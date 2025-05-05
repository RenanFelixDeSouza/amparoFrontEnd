import React, { useState } from 'react';
import ListSubscriptionPlans from './ListSubscriptionPlans/ListSubscriptionPlans';
import MonthlySubscriptions from './MonthlySubscriptions/MonthlySubscriptions';
import MonthlyInstallments from './MonthlyInstallments/MonthlyInstallments';

function TabsSubscriptions() {
  const [activeTab, setActiveTab] = useState('MonthlySubscriptions');

  return (
    <div className="list-container-tab">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'ListSubscriptionPlans' ? 'active' : ''}`}
          onClick={() => setActiveTab('ListSubscriptionPlans')}
        >
          Planos de Assinatura
        </button>
        <button
          className={`tab-button ${activeTab === 'MonthlySubscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('MonthlySubscriptions')}
        >
          Assinaturas Mensais
        </button>
        <button
          className={`tab-button ${activeTab === 'MonthlyInstallments' ? 'active' : ''}`}
          onClick={() => setActiveTab('MonthlyInstallments')}
        >
          Parcelas
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'ListSubscriptionPlans' && <ListSubscriptionPlans />}
        {activeTab === 'MonthlySubscriptions' && <MonthlySubscriptions />}
        {activeTab === 'MonthlyInstallments' && <MonthlyInstallments />}
      </div>
    </div>
  );
}

export default TabsSubscriptions;