import React, { useState } from 'react';
import ChartAccountTree from '../../BankAccount/ChartAccount/ChartAccountTree';

function FinancialConfig({ chartAccounts, onChartSelect }) {
  const [showChartTree, setShowChartTree] = useState({
    banking: false,
    monthly: false
  });
  const [formData, setFormData] = useState({
    banking_chart_id: '',
    banking_chart_name: '',
    monthly_chart_id: '',
    monthly_chart_name: ''
  });

  const handleChartAccountSelect = (account, type) => {
    if (account.type === 'analytical') {
      const newData = {
        ...formData,
        [`${type}_chart_id`]: account.id,
        [`${type}_chart_name`]: account.name
      };
      setFormData(newData);
      onChartSelect(newData);
      setShowChartTree(prev => ({
        ...prev,
        [type]: false
      }));
    }
  };

  return (
    <div className="config-section">
      <div className="section-box">
        <h3>PLANO DE CONTAS</h3>
        <div className="form-group">
          <label>Plano de Contas Padrão para Movimentação Bancária</label>
          <div className="input-with-button">
            <input
              type="text"
              value={formData.banking_chart_name || ''}
              readOnly
              placeholder="Selecione um plano de contas analítico"
              onClick={() => setShowChartTree(prev => ({ ...prev, banking: true }))}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Plano de Contas para Controle de Mensalidades</label>
          <div className="input-with-button">
            <input
              type="text"
              value={formData.monthly_chart_name || ''}
              readOnly
              placeholder="Selecione um plano de contas analítico"
              onClick={() => setShowChartTree(prev => ({ ...prev, monthly: true }))}
            />
          </div>
        </div>
      </div>

      {(showChartTree.banking || showChartTree.monthly) && (
        <div className="chart-tree-overlay">
          <div className="chart-tree-modal">
            <div className="chart-tree-header">
              <h3>Selecione uma Conta Analítica</h3>
              <button onClick={() => setShowChartTree({ banking: false, monthly: false })}>×</button>
            </div>
            <ChartAccountTree 
              accounts={chartAccounts}
              onSelect={(account) => {
                if (showChartTree.banking) handleChartAccountSelect(account, 'banking');
                if (showChartTree.monthly) handleChartAccountSelect(account, 'monthly');
              }}
              selectedId={showChartTree.banking ? formData.banking_chart_id : formData.monthly_chart_id}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialConfig;