import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ListSubscriptionPlans from './ListSubscriptionPlans/ListSubscriptionPlans';
import MonthlySubscriptions from './MonthlySubscriptions/MonthlySubscriptions';

function TabsSubscriptions() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('ListSubscriptionPlans');

  useEffect(() => {
    if (location?.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location?.state?.activeTab]);

  return (
    <div className="list-container-tab">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'ListSubscriptionPlans' ? 'active' : ''}`}
          onClick={() => setActiveTab('ListSubscriptionPlans')}>
          Planos de Assinatura
        </button>
        <button
          className={`tab-button ${activeTab === 'MonthlySubscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('MonthlySubscriptions')}>
          Assinaturas Mensais
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'ListSubscriptionPlans' && <ListSubscriptionPlans />}
        {activeTab === 'MonthlySubscriptions' && <MonthlySubscriptions />}
      </div>
    </div>
  );
}

export default TabsSubscriptions;