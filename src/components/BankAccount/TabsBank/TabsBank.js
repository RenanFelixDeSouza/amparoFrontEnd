import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ListBankAccounts from './ListBankAccount/ListBankAccounts';
import ListTransactions from './ListTransactions/ListTransactions';
import ListChartAccounts from './ListChartAccounts/ListChartAccounts';
import './TabsBank.css';

function TabsBank() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('ListBankAccounts');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="list-container-tab">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'ListBankAccounts' ? 'active' : ''}`}
          onClick={() => handleTabChange('ListBankAccounts')}
        >
          Contas
        </button>
        <button
          className={`tab-button ${activeTab === 'ListTransactions' ? 'active' : ''}`}
          onClick={() => handleTabChange('ListTransactions')}
        >
          Movimentações
        </button>
        <button
          className={`tab-button ${activeTab === 'ListChartAccounts' ? 'active' : ''}`}
          onClick={() => handleTabChange('ListChartAccounts')}
        >
          Plano de Contas
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'ListBankAccounts' && <ListBankAccounts />}
        {activeTab === 'ListTransactions' && <ListTransactions />}
        {activeTab === 'ListChartAccounts' && <ListChartAccounts />}
      </div>
    </div>
  );
}

export default TabsBank;