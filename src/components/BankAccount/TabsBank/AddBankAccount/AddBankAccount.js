import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import ChartAccountTree from '../../ChartAccount/ChartAccountTree';
import './BankAccount.css';

function AddBankAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bank_name: '',
    agency: '',
    account_number: '',
    account_type: 'corrente',
    balance: '',
    description: '',
    chart_account_id: '',
    chart_account_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChartTree, setShowChartTree] = useState(false);
  const [chartAccounts, setChartAccounts] = useState([]);

  useEffect(() => {
    const fetchChartAccounts = async () => {
      try {
        const params = {
          page: 1,
          limit: 999
        };
        const response = await api.get('/chart-accounts/index', { params });
        setChartAccounts(response.data.data || []);
      } catch (error) {
        setError('Erro ao carregar plano de contas');
      }
    };
    fetchChartAccounts();
  }, []);

  const formatCurrency = (value) => {
    if (!value) return '';
    value = value.replace(/\D/g, "");
    const numericValue = Number(value) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const handleChartAccountVisibility = () => {
    return formData.balance && parseFloat(formData.balance.replace(/[^\d,]/g, '').replace(',', '.')) > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/wallet/create', formData);
      setSuccess('Conta bancária criada com sucesso!');
      setTimeout(() => {
        navigate('/listar-contas');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao criar conta bancária');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'balance') {
      const formattedValue = formatCurrency(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
        // Limpa o plano de contas se o saldo for zero
        ...((!value || parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) === 0) && {
          chart_account_id: '',
          chart_account_name: ''
        })
      }));
      // Fecha o modal se o saldo for zero
      if (!value || parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) === 0) {
        setShowChartTree(false);
      }
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
        chart_account_id: account.id,
        chart_account_name: account.name
      }));
      setShowChartTree(false);
    } else {
      setError('Selecione apenas contas analíticas');
    }
  };

  return (
    <div className="bank-account-container">
      <form onSubmit={handleSubmit} className="bank-form">
        <h2>Criar Conta Bancária</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="bank_name">Nome do Banco *</label>
            <input
              type="text"
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-bank-form-group flex-1">
            <label htmlFor="account_type">Tipo de Conta *</label>
            <select
              id="account_type"
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              required
            >
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Conta Poupança</option>
              <option value="investimento">Conta Investimento</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="agency">Agência *</label>
            <input
              type="text"
              id="agency"
              name="agency"
              value={formData.agency}
              onChange={handleChange}
              required
            />
          </div>

          <div className="add-bank-form-group flex-1">
            <label htmlFor="account_number">Número da Conta *</label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="balance">Saldo Inicial *</label>
            <input
              type="text"
              id="balance"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              placeholder="R$ 0,00"
              required
            />
          </div>
        </div>

        {handleChartAccountVisibility() && (
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
                  required={handleChartAccountVisibility()}
                  onClick={() => setShowChartTree(!showChartTree)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="add-bank-form-group">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate('/listar-contas')}>
            Cancelar
          </button>
          <button type="submit">
            Criar Conta
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
                selectedId={formData.chart_account_id}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AddBankAccount;