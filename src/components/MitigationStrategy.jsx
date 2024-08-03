import React from 'react';

const MitigationStrategyCard = ({ strategy }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg mb-4 border border-gray-200 max-w-fit">
    <h4 className="text-lg font-bold mb-2">{strategy["Mitigation Strategy"]}</h4>
    <p className="text-sm text-gray-700 mb-2"><strong>Segments:</strong> {strategy.Segments}</p>
    <p className="text-sm text-gray-600">{strategy[strategy["Mitigation Strategy"]]}</p>
  </div>
);

export default MitigationStrategyCard;
