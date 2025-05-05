import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../../services/api';
import ChartAccountTree from '../../../../BankAccount/ChartAccount/ChartAccountTree';

const AddSubscriptionPlan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    chart_of_account_id: '',
    chart_account_name: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChartTree, setShowChartTree] = useState(false);
  const [chartAccounts, setChartAccounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsResponse, configResponse] = await Promise.all([
          api.get('/chart-accounts/index', { params: { page: 1, limit: 999 } }),
          api.get('/configurations/index')
        ]);
        
        setChartAccounts(accountsResponse.data.data || []);

        // Se existe monthly_chart na configuração, define como padrão
        if (configResponse.data?.monthly_chart) {
          setFormData(prev => ({
            ...prev,
            chart_of_account_id: configResponse.data.monthly_chart.id,
            chart_account_name: configResponse.data.monthly_chart.name
          }));
        }
      } catch (error) {
        setError('Erro ao carregar dados');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'value') {
      const numericValue = value.replace(/\D/g, '');
      const formattedValue = (numericValue / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      setFormData(prev => ({
        ...prev,
        [name]: numericValue / 100
      }));
      e.target.value = formattedValue;
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleChartAccountSelect = (account) => {
    if (account.type === 'analytical') {
      setFormData(prev => ({
        ...prev,
        chart_of_account_id: account.id,
        chart_account_name: account.name
      }));
      setShowChartTree(false);
    } else {
      setError('Selecione apenas contas analíticas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/subscription-plans', formData);
      setSuccess('Plano criado com sucesso!');
      setTimeout(() => {
        navigate('/assinaturas');
      }, 2000);
    } catch (error) {
      setError('Erro ao criar plano. Por favor, tente novamente.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-account-container">
      <form onSubmit={handleSubmit} className="bank-form">
        <h2>Novo Plano de Assinatura</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="name">Nome do Plano *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-bank-form-group flex-1">
            <label htmlFor="value">Valor Mensal *</label>
            <input
              type="text"
              id="value"
              name="value"
              placeholder="R$ 0,00"
              value={formData.value ? formData.value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }) : ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="chart_account_name">Plano de Contas (Analítico) *</label>
            <div className="input-with-button">
              <input
                type="text"
                id="chart_account_name"
                name="chart_account_name"
                value={formData.chart_account_name}
                readOnly
                placeholder="Selecione um plano de contas analítico"
                required
                onClick={() => setShowChartTree(!showChartTree)}
              />
            </div>
          </div>
        </div>

        <div className="add-bank-form-group">
          <label htmlFor="description">Descrição *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate('/assinaturas')}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {showChartTree && (
          <div className="chart-tree-overlay">
            <div className="chart-tree-modal">
              <div className="chart-tree-header">
                <h3>Selecione uma Conta Analítica</h3>
                <button onClick={() => setShowChartTree(false)}>×</button>
              </div>
              <ChartAccountTree
                accounts={chartAccounts}
                onSelect={handleChartAccountSelect}
                selectedId={formData.chart_of_account_id}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddSubscriptionPlan;