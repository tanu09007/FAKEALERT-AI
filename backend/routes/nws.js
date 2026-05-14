const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // NWS API requires a User-Agent header
    const url = 'https://api.weather.gov/alerts/active?status=actual&message_type=alert';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': '(truthleaf.app, contact@truthleaf.app)'
      }
    });

    // Map the most recent 5 alerts
    const alerts = response.data.features.slice(0, 5).map(f => ({
      event: f.properties.event,
      severity: f.properties.severity,
      area: f.properties.areaDesc,
      headline: f.properties.headline,
      instruction: f.properties.instruction,
      link: f.id
    }));

    res.json(alerts);
  } catch (error) {
    console.error("[NWS Error]", error.message);
    res.status(500).json({ error: true, message: "NWS alerts unavailable" });
  }
});

module.exports = router;
