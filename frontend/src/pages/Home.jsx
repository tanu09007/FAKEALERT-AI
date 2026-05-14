import React, { useState } from 'react';
import InputSection from '../components/InputSection';
import LoadingState from '../components/LoadingState';
import ResultCard from '../components/ResultCard';
import ClimateIntelligence from '../components/ClimateIntelligence';

const Home = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysisComplete = (data) => {
    setIsLoading(false);
    if (data.error) {
      setError("Something went wrong. Please try again.");
      setResult(null);
    } else {
      setResult(data);
      setError(null);
      // Scroll to result after a short delay for mount
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 100);
    }
  };

  const startLoading = () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
  };

  const resetResult = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      {/* Brand Header */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-5xl font-black text-green-800 tracking-tighter">
          TruthLeaf<span className="text-green-500">.</span>
        </h1>
        <p className="text-gray-500 font-medium tracking-wide">Climate Misinformation Detector</p>
      </div>

      <main className="w-full max-w-4xl space-y-12">
        {/* 0. Live Intelligence Context */}
        <section>
          <ClimateIntelligence />
        </section>

        {/* 1. Input Section */}
        <section>
          <InputSection 
            onAnalysisComplete={handleAnalysisComplete} 
            onStartLoading={startLoading}
            onTabChange={resetResult}
          />
        </section>

        {/* 4. Error Message */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl text-center font-bold animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {/* 2. Loading State (Conditional) */}
        {isLoading && (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
            <LoadingState />
          </section>
        )}

        {/* 3. Result Card (Conditional) */}
        {result && !isLoading && (
          <section>
            <ResultCard result={result} />
          </section>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="mt-auto py-8 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
        Powered by Groq Brain & Open-Meteo Evidence • TruthLeaf 🌿
      </footer>
    </div>
  );
};

export default Home;
