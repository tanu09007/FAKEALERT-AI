import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: backendUrl,
});

export const analyzeClaim = async (data) => {
  try {
    const response = await api.post('/api/analyse', data);
    return response.data;
  } catch (error) {
    console.error("Analysis API Error:", error);
    throw error;
  }
};

export const scrapeUrl = async (url) => {
  try {
    const response = await api.get(`/api/scrape?url=${encodeURIComponent(url)}`);
    return response.data;
  } catch (error) {
    console.error("Scrape API Error:", error);
    throw error;
  }
};
