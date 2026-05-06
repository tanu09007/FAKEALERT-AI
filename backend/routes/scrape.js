const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ 
      error: true, 
      message: "URL query parameter is required" 
    });
  }

  let rawHtml = null;

  try {
    // 1. Try Primary Proxy (corsproxy.io)
    console.log(`[Scrape] Trying primary proxy for: ${targetUrl}`);
    const primaryUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const primaryResponse = await axios.get(primaryUrl, { timeout: 8000 });
    rawHtml = primaryResponse.data;

  } catch (primaryError) {
    console.log(`[Scrape] Primary proxy failed. Trying fallback...`);
    
    try {
      // 2. Try Fallback Proxy (allorigins.win)
      const fallbackUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      const fallbackResponse = await axios.get(fallbackUrl, { timeout: 8000 });
      
      if (fallbackResponse.data && fallbackResponse.data.contents) {
        rawHtml = fallbackResponse.data.contents;
      } else {
        throw new Error("Invalid response format from fallback proxy");
      }
    } catch (fallbackError) {
      console.error(`[Scrape] Both proxies failed for: ${targetUrl}`);
      
      return res.status(200).json({
        error: true,
        message: "Could not scrape this URL. Please paste the article text directly into the text tab instead."
      });
    }
  }

  // 4. Clean and Extract Text using Cheerio
  try {
    const $ = cheerio.load(rawHtml);

    // Remove unwanted heavy/structural elements
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('footer').remove();
    $('header').remove();

    // Extract pure text from all remaining paragraph tags
    const paragraphs = [];
    $('p').each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        paragraphs.push(text);
      }
    });

    // Join with spaces
    let extractedText = paragraphs.join(' ');

    // Trim to a maximum of 3000 characters
    if (extractedText.length > 3000) {
      extractedText = extractedText.substring(0, 3000);
    }

    // Edge case: if we parsed the page but no paragraphs were found
    if (!extractedText) {
      return res.status(200).json({
        error: true,
        message: "Could not scrape this URL. Please paste the article text directly into the text tab instead."
      });
    }

    // 5. Successful Response
    return res.json({
      error: false,
      extractedText,
      sourceUrl: targetUrl
    });

  } catch (parsingError) {
    console.error(`[Scrape] HTML Parsing Error:`, parsingError.message);
    
    return res.status(200).json({
      error: true,
      message: "Could not scrape this URL. Please paste the article text directly into the text tab instead."
    });
  }
});

module.exports = router;
