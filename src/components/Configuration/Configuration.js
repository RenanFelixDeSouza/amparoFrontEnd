import React, { useState, useEffect } from 'react';
import './Configuration.css';
import api from '../../services/api';
import GeneralConfig from './GeneralConfig/GeneralConfig';
import FinancialConfig from './FinancialConfig/FinancialConfig';

function Configuration() {
  const [activeTab, setActiveTab] = useState('geral');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chartAccounts, setChartAccounts] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchChartAccounts = async () => {
      try {
        const params = { page: 1, limit: 999 };
        const response = await api.get('/chart-accounts/index', { params });
        setChartAccounts(response.data.data || []);
      } catch (error) {
        setError('Erro ao carregar plano de contas');
      }
    };
    fetchChartAccounts();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleChartSelect = (data) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const handleSave = async () => {
    try {
      // Implementar lógica de salvamento
      setSuccess('Configurações salvas com sucesso!');
    } catch (error) {
      setError('Erro ao salvar as configurações');
    }
  };

  return (
    <div className="config-container">
      <div className="config-header">
        <h2>Configurações::Preferências</h2>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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
        {activeTab === 'geral' && (
          <GeneralConfig chartAccounts={chartAccounts} onChartSelect={handleChartSelect} />
        )}

        {activeTab === 'financeiro' && (
          <FinancialConfig chartAccounts={chartAccounts} onChartSelect={handleChartSelect} />
        )}
      </div>

      <div className="form-buttons">
        <button type="button" className="btn-cancelar">CANCELAR</button>

        <button type="submit">Salvar</button>
      </div>
    </div>
  );
}

export default Configuration;