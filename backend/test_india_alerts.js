const axios = require('axios');

async function test() {
  try {
    // Sachet NDMA Public Alerts API
    const url = 'https://sachet.ndma.gov.in/cap_dissemination/get_all_cap_alerts';
    const response = await axios.get(url);
    
    console.log("Total Alerts in India:", response.data.length);
    
    // Filter for Tamil Nadu
    const tnAlerts = response.data.filter(a => 
      a.state_name && a.state_name.toLowerCase().includes('tamil nadu')
    );
    
    console.log("Tamil Nadu Alerts:", tnAlerts.length);
    if (tnAlerts.length > 0) {
      console.log("Sample TN Alert:", JSON.stringify(tnAlerts[0], null, 2));
    } else {
      console.log("No active alerts in TN. Sample from elsewhere:");
      if (response.data.length > 0) {
        console.log(JSON.stringify(response.data[0], null, 2));
      }
    }
  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
}

test();
