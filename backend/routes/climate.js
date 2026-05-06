const express = require('express');
const axios = require('axios');
const router = express.Router();

const SUPPORTED_VARIABLES = {
  'temperature_2m_max': { name: 'max temperature', unit: '°C' },
  'precipitation_sum': { name: 'precipitation', unit: 'mm' },
  'windspeed_10m_max': { name: 'wind speed', unit: 'km/h' }
};

router.get('/', async (req, res, next) => {
  try {
    let { variable } = req.query;

    // Default to temperature if none provided or if unsupported
    if (!variable || !SUPPORTED_VARIABLES[variable]) {
      variable = 'temperature_2m_max';
    }

    const varInfo = SUPPORTED_VARIABLES[variable];

    // Using the exact Archive endpoint requested
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=20&longitude=78&start_date=2000-01-01&end_date=2024-12-31&daily=${variable}&timezone=Asia/Kolkata`;
    
    const response = await axios.get(url);
    const times = response.data.daily.time;
    const values = response.data.daily[variable];

    // Group values by year
    const yearlyData = {};
    for (let i = 0; i < times.length; i++) {
      const year = times[i].substring(0, 4);
      if (!yearlyData[year]) {
        yearlyData[year] = { sum: 0, count: 0 };
      }
      if (values[i] !== null) {
        yearlyData[year].sum += values[i];
        yearlyData[year].count += 1;
      }
    }

    // Calculate yearly averages and find the highest value year dynamically
    let peakYear = "2023"; // Fallback
    let peakValue = -Infinity;

    const yearlyAverages = Object.keys(yearlyData).map(year => {
      const avg = yearlyData[year].sum / yearlyData[year].count;
      
      if (avg > peakValue) {
        peakValue = avg;
        peakYear = year;
      }

      return {
        year,
        avg: avg.toFixed(2)
      };
    });

    // Helper to get average across a set of years
    const getPeriodAverage = (startYear, endYear) => {
      const periodData = yearlyAverages.filter(y => parseInt(y.year) >= startYear && parseInt(y.year) <= endYear);
      const sum = periodData.reduce((acc, curr) => acc + parseFloat(curr.avg), 0);
      return periodData.length ? (sum / periodData.length) : 0;
    };

    const oldAvg = getPeriodAverage(2000, 2004);
    const recentAvg = getPeriodAverage(2020, 2024);
    const rise = recentAvg - oldAvg;

    const direction = rise >= 0 ? 'rose' : 'fell';
    const trendSymbol = rise >= 0 ? '+' : '';
    const absRise = Math.abs(rise).toFixed(2);
    
    // Format the peak year sentence depending on the variable
    let peakSentence = '';
    if (variable === 'temperature_2m_max') {
       peakSentence = `${peakYear} was the hottest year on record.`;
    } else {
       peakSentence = `${peakYear} had the highest ${varInfo.name} on record.`;
    }
    
    // Construct the exact object requested
    const result = {
      yearlyAverages,
      rise: parseFloat(rise.toFixed(2)),
      oldAverage: oldAvg.toFixed(2),
      recentAverage: recentAvg.toFixed(2),
      trend: `${trendSymbol}${absRise}${varInfo.unit} ${rise >= 0 ? 'rise' : 'fall'} from 2000 to 2024`,
      summary: `India average ${varInfo.name} ${direction} by ${absRise}${varInfo.unit} over 24 years. Early 2000s average was ${oldAvg.toFixed(2)}${varInfo.unit}. Recent years average is ${recentAvg.toFixed(2)}${varInfo.unit}. ${peakSentence}`
    };

    return res.json(result);

  } catch (error) {
    console.error("Open-Meteo Fetch Error:", error.message);
    // Passing error to the global error handler in server.js
    next(error);
  }
});

module.exports = router;
