const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory cache to save GNews free tier quota (100 req/day)
const cache = {};

router.get('/', async (req, res) => {
  const { keywords } = req.query;

  // Validation
  if (!keywords) {
    return res.status(400).json({ error: "Keywords query parameter is required" });
  }

  // Normalize keywords for consistent caching
  const cacheKey = keywords.toLowerCase().trim();

  // 1. Check Cache
  if (cache[cacheKey]) {
    console.log(`[News API] Cache hit for: "${keywords}"`);
    return res.json({ 
      articles: cache[cacheKey], 
      cached: true 
    });
  }

  // 2. Fetch Fresh Data from GNews
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      throw new Error("GNEWS_API_KEY is missing in .env");
    }

    console.log(`[News API] Fetching fresh data for: "${keywords}"`);
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&max=5&apikey=${apiKey}`;
    
    const response = await axios.get(url);

    // Map the raw response to your exact required format
    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name
    }));

    // 3. Store in Cache
    cache[cacheKey] = articles;

    // 4. Return Fresh Data
    return res.json({ 
      articles, 
      cached: false 
    });

  } catch (error) {
    console.error("GNews Fetch Error:", error.message);
    
    // Graceful fallback if GNews quota is hit or request fails
    return res.status(200).json({
      articles: [],
      warning: "News context unavailable. Analysis will use climate data only."
    });
  }
});

module.exports = router;
