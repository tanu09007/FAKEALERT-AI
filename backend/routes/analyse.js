const express = require('express');
const axios = require('axios');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize external clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);

router.post('/', async (req, res) => {
  const { type, content, imageBase64, sourceUrl } = req.body;

  if (!content) {
    return res.status(400).json({ error: true, message: "Claim content is required" });
  }

  try {
    // ══════════════════════════════════
    // STEP 1 — GROQ BRAIN CALL 1 
    // ══════════════════════════════════
    let step1Model = type === 'image' && imageBase64 ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';
    let response1;

    const userMessage = {
      role: 'user',
      content: [
        { type: 'text', text: `Read this claim carefully:\nCLAIM: ${content}\n\nReturn ONLY this JSON:\n{\n  "keywords": "comma separated search terms for news",\n  "climate_variable": "temperature or rainfall or sea_level or co2 or floods or drought",\n  "core_claim": "one sentence of what is being claimed"\n}` }
      ]
    };

    // Add image if it's a vision call
    if (type === 'image' && imageBase64) {
      userMessage.content.push({
        type: 'image_url',
        image_url: { url: imageBase64 }
      });
    }

    try {
      response1 = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a climate fact-checking assistant.\nYour job is to understand claims only.\nDo not give verdicts yet.\nReturn ONLY raw JSON. No markdown. No backticks.' },
          userMessage
        ],
        model: step1Model,
        temperature: 0.1,
      });
    } catch (groqError) {
      console.error("[Groq Error]", groqError.message);
      // Fallback to text model
      response1 = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a climate fact-checking assistant.\nYour job is to understand claims only.\nDo not give verdicts yet.\nReturn ONLY raw JSON. No markdown. No backticks.' },
          { role: 'user', content: `Read this claim carefully:\nCLAIM: ${content}\n\nReturn ONLY this JSON:\n{\n  "keywords": "comma separated search terms for news",\n  "climate_variable": "temperature or rainfall or sea_level or co2 or floods or drought",\n  "core_claim": "one sentence of what is being claimed"\n}` }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
      });
    }

    // Safe JSON Parsing Step 1
    const text1 = response1.choices[0].message.content;
    const start1 = text1.indexOf('{');
    const end1 = text1.lastIndexOf('}') + 1;
    const step1 = JSON.parse(text1.substring(start1, end1));

    // ══════════════════════════════════
    // STEP 2 — FETCH REAL DATA IN PARALLEL
    // ══════════════════════════════════
    const port = process.env.PORT || 5000;
    const [newsData, climateData] = await Promise.all([
      axios.get(`http://localhost:${port}/api/news?keywords=${encodeURIComponent(step1.keywords)}`),
      axios.get(`http://localhost:${port}/api/climate?variable=${encodeURIComponent(step1.climate_variable)}`)
    ]);

    // Format news for the prompt
    const newsArticlesText = newsData.data.articles && newsData.data.articles.length > 0
      ? newsData.data.articles.map(a => `- ${a.title}: ${a.description}`).join('\n')
      : "No news articles found.";

    // ══════════════════════════════════
    // STEP 3 — GROQ BRAIN CALL 2
    // ══════════════════════════════════
    const step3Prompt = `ORIGINAL CLAIM: ${content}
CORE CLAIM IDENTIFIED: ${step1.core_claim}

REAL NEWS DATA:
${newsArticlesText}

REAL CLIMATE DATA:
${climateData.data.summary}

Now compare the claim against this real data.
Calculate fake_percentage by scoring:
- climate_data_contradiction: 0-40 points (40 = completely contradicts Open-Meteo data)
- news_contradiction: 0-30 points (30 = all 5 news articles contradict claim)
- emotional_language: 0-20 points (20 = highly manipulative emotional language)
- source_credibility: 0-10 points (10 = source known for misinformation)
fake_percentage = sum of all four scores

Return ONLY this exact JSON:
{
  "verdict": "TRUE" or "FALSE" or "MISLEADING" or "UNVERIFIABLE",
  "fake_percentage": 0-100,
  "fake_breakdown": {
    "climate_data_contradiction": 0-40,
    "news_contradiction": 0-30,
    "emotional_language": 0-20,
    "source_credibility": 0-10
  },
  "real_version": "corrected claim using EXACT numbers from the climate data and news provided. Must include real temperature numbers. Must reference real news sources. Must NOT be generic.",
  "explanation": "2-3 sentences comparing claim to real data",
  "climate_evidence": "exact numbers from Open-Meteo used in this verdict",
  "news_evidence": "which news headlines contradicted the claim",
  "topic": "one word topic",
  "emotional_language": true or false
}`;

    const response2 = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a strict climate misinformation fact-checker.\nYou have been given a claim and real verified data.\nCompare them carefully and give a verdict.\nReturn ONLY raw JSON. No markdown. No backticks.' },
        { role: 'user', content: step3Prompt }
      ],
      model: 'llama-3.3-70b-versatile', // Fact checking requires the strongest reasoning model
      temperature: 0.1,
    });

    // ══════════════════════════════════
    // STEP 4 — SAFE JSON PARSING
    // ══════════════════════════════════
    const text2 = response2.choices[0].message.content;
    const start2 = text2.indexOf('{');
    const end2 = text2.lastIndexOf('}') + 1;
    const parsed = JSON.parse(text2.substring(start2, end2));

    // ══════════════════════════════════
    // STEP 5 — SAVE TO SUPABASE
    // ══════════════════════════════════
    try {
      await supabase.from('claims').insert([
        {
          claim_text: content,
          verdict: parsed.verdict,
          fake_percentage: parsed.fake_percentage,
          confidence: 100 - parsed.fake_breakdown.climate_data_contradiction,
          topic: parsed.topic,
          input_type: type,
          source_url: sourceUrl || null,
          real_version: parsed.real_version,
          climate_evidence: parsed.climate_evidence,
          news_evidence: parsed.news_evidence,
          emotional_language: parsed.emotional_language
        }
      ]);
    } catch (dbError) {
      // Don't crash the request if just the DB insert fails
      console.error("[Supabase] Failed to save claim:", dbError.message);
    }

    // ══════════════════════════════════
    // STEP 6 — RETURN TO FRONTEND
    // ══════════════════════════════════
    return res.json({
      ...parsed,
      claim_text: content,
      climate_data: climateData.data,
      news_articles: newsData.data.articles
    });

  } catch (error) {
    console.error("[Analyse Route] Error:", error.message);
    // Graceful error fallback for frontend
    return res.status(200).json({
      error: true,
      message: "Analysis failed. Please try again."
    });
  }
});

module.exports = router;
