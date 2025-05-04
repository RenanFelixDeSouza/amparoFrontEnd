import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import ChartAccountTree from '../../ChartAccount/ChartAccountTree';
import './AddTransaction.css';

function AddTransaction() {
  const navigate = useNavigate();
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [formData, setFormData] = useState({
    wallet_id: '',
    account_name: '',
    chart_of_account_id: '',
    chart_account_name: '',
    type: 'entrada',
    value: '',
    formattedAmount: '',
    comments: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChartTree, setShowChartTree] = useState(false);
  const [chartAccounts, setChartAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchChartAccounts = async () => {
      try {
        const params = {
          page: 1,
          limit: 999
        };
        const response = await api.get('/chart-accounts/index', {params});
        setChartAccounts(response.data.data || []);
      } catch (error) {
        setError('Erro ao carregar plano de contas');
      }
    };
    fetchChartAccounts();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // Busca as contas bancárias
        const response = await api.get('/wallets/index/simplified');
        const accountsData = response.data?.data || response.data || [];
        setAccounts(accountsData);

        // Busca as configurações
        const configResponse = await api.get('/configurations/index');
        if (configResponse.data?.default_wallet?.id) {
          const defaultAccount = accountsData.find(
            acc => acc.id === configResponse.data.default_wallet.id
          );
          
          if (defaultAccount) {
            setFormData(prev => ({
              ...prev,
              wallet_id: defaultAccount.id.toString(),
              account_name: defaultAccount.bank_name
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
        setError('Erro ao carregar contas bancárias');
      }
    };
    fetchAccounts();
  }, []);

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = (parseFloat(value) / 100).toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      value: value,
      formattedAmount: formatCurrency(value)
    }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const submitData = {
        wallet_id: formData.wallet_id,
        type: formData.type,
        value: formData.value,
        comments: formData.comments,
        chart_of_account_id: formData.chart_of_account_id,
        date: formData.date
      };
      
      await api.post('/wallet/movement', submitData);
      setSuccess('Movimentação registrada com sucesso!');
      setTimeout(() => {
        navigate('/listar-contas');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao registrar movimentação');
    }
  };

  return (
    <div className="bank-account-container">
      <form onSubmit={handleSubmit} className="bank-form">
        <h2>Nova Movimentação</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="wallet_id">Conta Bancária *</label>
            <select
              id="wallet_id"
              name="wallet_id"
              value={formData.wallet_id}
              onChange={(e) => {
                const selectedAccount = accounts.find(acc => acc.id === parseInt(e.target.value));
                setFormData(prev => ({
                  ...prev,
                  wallet_id: e.target.value,
                  account_name: selectedAccount ? selectedAccount.bank_name : ''
                }));
              }}
              required
              className="form-control"
            >
              <option value="">Selecione uma conta bancária</option>
              {Array.isArray(accounts) && accounts.length > 0 ? (
                accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {`${account.bank_name || ''} - Ag: ${account.agency || ''} - CC: ${account.account_number || ''}`}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nenhuma conta bancária disponível</option>
              )}
            </select>
          </div>

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

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="type">Tipo *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>

          <div className="add-bank-form-group flex-1">
            <label htmlFor="value">Valor *</label>
            <input
              type="text"
              id="value"
              name="value"
              value={formData.formattedAmount || ''}
              onChange={handleAmountChange}
              required
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="date">Data *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="add-bank-form-group">
          <label htmlFor="comments">Descrição *</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate('/listar-contas', { state: { activeTab: 'ListTransactions' } })}>
            Cancelar
          </button>
          <button type="submit">
            Salvar
          </button>
        </div>
      </form>

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
    </div>
  );
}

export default AddTransaction;