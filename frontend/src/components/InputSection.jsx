import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';
import { analyzeClaim, scrapeUrl } from '../api';

const InputSection = ({ onAnalysisComplete }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle image upload and generate preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or WebP image");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // TAB 1: TEXT SUBMISSION
  // ==========================================
  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter a claim");
      return;
    }
    setLoading(true);
    setStatusMessage("Analysing claim...");
    
    try {
      const result = await analyzeClaim({ type: 'text', content: textInput });
      if (result.error) toast.error(result.message);
      else if (onAnalysisComplete) onAnalysisComplete(result);
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // ==========================================
  // TAB 2: URL SUBMISSION
  // ==========================================
  const handleUrlSubmit = async () => {
    if (!urlInput.trim() || !urlInput.startsWith('https://')) {
      toast.error("Please enter a valid URL starting with https://");
      return;
    }
    setLoading(true);
    setStatusMessage("Extracting text from URL...");
    
    try {
      // Step 1: Scrape text
      const scrapeResult = await scrapeUrl(urlInput);
      if (scrapeResult.error) {
        toast.error(scrapeResult.message);
        setLoading(false);
        setStatusMessage('');
        return; // Stop. Do not call analyse.
      }
      
      // Step 2: Analyse extracted text
      setStatusMessage("Analysing extracted text...");
      const result = await analyzeClaim({ 
        type: 'url', 
        content: scrapeResult.extractedText,
        sourceUrl: scrapeResult.sourceUrl
      });
      
      if (result.error) toast.error(result.message);
      else if (onAnalysisComplete) onAnalysisComplete(result);
    } catch (error) {
      toast.error("Failed to process URL.");
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // ==========================================
  // TAB 3: IMAGE SUBMISSION
  // ==========================================
  const handleImageSubmit = async () => {
    if (!imageFile) {
      toast.error("Please upload an image first");
      return;
    }
    
    setLoading(true);
    setStatusMessage("Reading text from image...");
    
    try {
      // Step 1: Extract text using Tesseract OCR
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng');
      const extractedText = text.trim();
      
      let payload = { type: 'image' };
      
      // Step 2: Send to backend
      if (extractedText) {
        setStatusMessage("Analysing extracted text...");
        payload.content = extractedText;
        payload.imageBase64 = imagePreview; 
      } else {
        // Fallback: Send base64 directly to Groq Vision
        setStatusMessage("No text found via OCR. Trying vision analysis...");
        payload.content = "Please analyze this image for climate claims.";
        payload.imageBase64 = imagePreview;
      }

      const result = await analyzeClaim(payload);
      if (result.error) toast.error(result.message);
      else if (onAnalysisComplete) onAnalysisComplete(result);
      
    } catch (error) {
      console.error(error);
      toast.error("Image processing failed.");
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'text') handleTextSubmit();
    else if (activeTab === 'url') handleUrlSubmit();
    else if (activeTab === 'image') handleImageSubmit();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden w-full max-w-3xl mx-auto">
      
      {/* Tabs Header */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button 
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'text' ? 'text-green-700 border-b-2 border-green-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          📝 TEXT
        </button>
        <button 
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'url' ? 'text-green-700 border-b-2 border-green-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          🔗 URL
        </button>
        <button 
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'image' ? 'text-green-700 border-b-2 border-green-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          🖼️ IMAGE
        </button>
      </div>

      <div className="p-6 sm:p-8">
        
        {/* Text Input Tab */}
        {activeTab === 'text' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <textarea
              className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-400 text-gray-800"
              placeholder="Paste or type a climate claim here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* URL Input Tab */}
        {activeTab === 'url' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <input
              type="url"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-800"
              placeholder="Paste a news article URL here..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Image Input Tab */}
        {activeTab === 'image' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors group">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label htmlFor="image-upload" className="cursor-pointer text-green-700 font-medium group-hover:text-green-800 transition-colors">
                Click to upload a JPG, PNG, or WebP image
              </label>
              <p className="text-gray-400 text-sm mt-2">Max file size: 5MB</p>
            </div>
            {imagePreview && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-black/5 flex items-center justify-center shadow-inner">
                <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>
        )}

        {/* Dynamic Status Message */}
        {statusMessage && (
          <p className="mt-6 text-sm text-center text-green-700 font-bold tracking-wide animate-pulse">
            {statusMessage}
          </p>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-6 py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all flex items-center justify-center gap-3 ${
            loading 
              ? 'bg-green-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-md hover:shadow-lg shadow-green-600/20'
          }`}
        >
          {loading ? (
            <>
              {/* Spinner SVG */}
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analysing...
            </>
          ) : (
            'Analyse Claim'
          )}
        </button>
        
      </div>
    </div>
  );
};

export default InputSection;
