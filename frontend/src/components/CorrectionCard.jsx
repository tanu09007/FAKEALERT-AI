import React from 'react';
import toast from 'react-hot-toast';

const CorrectionCard = ({ data }) => {
  const { claim_text, verdict, fake_percentage, real_version, climate_evidence, news_evidence } = data;
  const isDangerous = verdict === 'FALSE' || verdict === 'MISLEADING';

  if (!isDangerous) return null;

  const copyCorrection = () => {
    navigator.clipboard.writeText(real_version);
    toast.success("Correction copied!");
  };

  const shareTruth = () => {
    const text = `✅ FACT CHECK by TruthLeaf
     
CLAIM: ${claim_text}
VERDICT: ${verdict}
FAKE SCORE: ${fake_percentage}%

REAL VERSION:
${real_version}

EVIDENCE:
${climate_evidence}

NEWS SOURCES:
${news_evidence}

Verified by TruthLeaf 🌿`;

    navigator.clipboard.writeText(text);
    toast.success("Fact report copied! Share the truth.");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 bg-red-50 border-b border-red-100">
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-200 px-2 py-0.5 rounded">Claim</span>
          <p className="mt-2 text-gray-800 font-medium italic">"{claim_text}"</p>
        </div>
        
        <div className="p-6 bg-green-50">
          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-200 px-2 py-0.5 rounded">Real Version</span>
          <p className="mt-2 text-gray-900 font-bold">{real_version}</p>
        </div>
      </div>

      <div className="space-y-4 px-2">
        <div className="text-sm">
          <span className="font-bold text-gray-700">Evidence: </span>
          <span className="text-gray-600">{climate_evidence}</span>
        </div>
        <div className="text-sm">
          <span className="font-bold text-gray-700">News: </span>
          <span className="text-gray-600">{news_evidence}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={copyCorrection}
          className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all active:scale-95"
        >
          Copy Correction
        </button>
        <button 
          onClick={shareTruth}
          className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95"
        >
          Share the Truth
        </button>
      </div>
    </div>
  );
};

export default CorrectionCard;
