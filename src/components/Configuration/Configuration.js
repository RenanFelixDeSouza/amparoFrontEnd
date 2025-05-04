import React, { useState } from 'react';
import './Configuration.css';
import FinancialConfig from './FinancialConfig/FinancialConfig';

function Configuration() {
  const [activeTab, setActiveTab] = useState('geral');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="config-container">
      <div className="config-tabs">
        <button
          className={`config-tab ${activeTab === 'geral' ? 'active' : ''}`}
          onClick={() => handleTabChange('geral')}
        >
          GERAL
        </button>
        <button
          className={`config-tab ${activeTab === 'financeiro' ? 'active' : ''}`}
          onClick={() => handleTabChange('financeiro')}
        >
          FINANCEIRO
        </button>
      </div>

      <div className="config-content">
        {activeTab === 'financeiro' && <FinancialConfig />}
      </div>
    </div>
  );
}

export default Configuration;