import React from 'react';
import WarningBanner from './WarningBanner';
import DangerMeter from './DangerMeter';
import CorrectionCard from './CorrectionCard';
import SourceSuggestion from './SourceSuggestion';

const ResultCard = ({ result }) => {
  if (!result) return null;

  const {
    verdict,
    confidence,
    explanation,
    fake_percentage,
    fake_breakdown,
    news_articles,
    input_type
  } = result;

  // Verdict Badge Colors
  const getBadgeColor = () => {
    switch (verdict) {
      case 'TRUE': return 'bg-green-100 text-green-700 border-green-200';
      case 'FALSE': return 'bg-red-100 text-red-700 border-red-200';
      case 'MISLEADING': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* 1. Warning Banner */}
      <WarningBanner verdict={verdict} />

      <div className="flex flex-col items-center text-center space-y-2 pt-4">
        {/* 2. Verdict Badge */}
        <div className={`px-6 py-2 rounded-full border-2 text-lg font-black tracking-widest uppercase ${getBadgeColor()}`}>
          {verdict}
        </div>
        
        {/* 3. Confidence Percentage */}
        <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
          Analysis Confidence: <span className="text-gray-600">{confidence}%</span>
        </p>
      </div>

      {/* 4. Danger Meter */}
      <DangerMeter 
        fake_percentage={fake_percentage} 
        fake_breakdown={fake_breakdown} 
      />

      {/* 5. Explanation Text */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">AI Analysis Summary</h4>
        <p className="text-gray-700 leading-relaxed font-medium">
          {explanation}
        </p>
      </div>

      {/* 6. News Articles as Evidence */}
      {news_articles && news_articles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Related News Context</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {news_articles.map((article, i) => (
              <a 
                key={i} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-4 bg-white border border-gray-100 rounded-xl hover:border-green-300 hover:shadow-md transition-all group"
              >
                <p className="text-xs font-bold text-green-600 mb-1 uppercase tracking-tight">{article.source?.name || article.source}</p>
                <h5 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-green-700">{article.title}</h5>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 7. Correction Card (only if false/misleading) */}
      <CorrectionCard data={result} />

      {/* 8. Source Suggestion (only if URL input) */}
      <SourceSuggestion input_type={input_type} verdict={verdict} />
    </div>
  );
};

export default ResultCard;
