import React from 'react';

const SourceSuggestion = ({ input_type, verdict }) => {
  if (input_type !== 'url') return null;

  let config = {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    icon: 'ℹ️',
    message: "Could not fully verify this source's claim."
  };

  if (verdict === 'TRUE') {
    config = {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✅',
      message: "This source appears credible on this claim."
    };
  } else if (verdict === 'FALSE' || verdict === 'MISLEADING') {
    config = {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: '⚠️',
      message: "This source may spread misinformation. Always verify before sharing content from here."
    };
  }

  return (
    <div className={`${config.bg} ${config.border} border-2 rounded-xl p-4 flex items-start space-x-3`}>
      <span className="text-xl">{config.icon}</span>
      <p className={`text-sm font-bold ${config.text}`}>
        {config.message}
      </p>
    </div>
  );
};

export default SourceSuggestion;
