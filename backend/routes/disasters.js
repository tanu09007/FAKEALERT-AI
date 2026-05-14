const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const url = `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=TC;EQ;FL;VO;DR`;
    const response = await axios.get(url);
    
    // Filter for major events
    const events = response.data.features.slice(0, 5).map(f => ({
      type: f.properties.eventtype,
      severity: f.properties.alertlevel,
      location: f.properties.country,
      date: f.properties.fromdate,
      link: f.properties.url.report
    }));

    res.json(events);
  } catch (error) {
    console.error("[GDACS Error]", error.message);
    res.status(500).json({ error: true, message: "Disaster data unavailable" });
  }
});

module.exports = router;
