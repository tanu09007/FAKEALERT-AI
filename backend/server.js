const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Allow all origins during development
app.use(cors());

// Set express JSON limit to 10mb to handle base64 image uploads (Tesseract OCR)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Mount Routes
app.use('/api/analyse', require('./routes/analyse'));
app.use('/api/news', require('./routes/news'));
app.use('/api/climate', require('./routes/climate'));
app.use('/api/scrape', require('./routes/scrape'));

// Global Error Handler (MUST be at the very bottom)
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({ 
    error: true, 
    message: 'Server error. Please try again.' 
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TruthLeaf backend running on port ${PORT}`);
});
