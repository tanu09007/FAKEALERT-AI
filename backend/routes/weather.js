const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { lat = 13.0827, lon = 80.2707 } = req.query; // Default to Chennai

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    
    const response = await axios.get(url);
    res.json({
      location: "Chennai, India",
      ...response.data
    });
  } catch (error) {
    console.error("[Open-Meteo Error]", error.message);
    res.status(500).json({ error: true, message: "Weather data unavailable" });
  }
});

module.exports = router;
