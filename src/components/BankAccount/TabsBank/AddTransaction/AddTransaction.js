import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './AddTransaction.css';

function AddTransaction() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [accountError, setAccountError] = useState("");
  const [formData, setFormData] = useState({
    account_id: '',
    account_name: '',
    type: 'entrada',
    amount: '',
    formattedAmount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

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
      amount: value,
      formattedAmount: formatCurrency(value)
    }));
  };

  const fetchAccounts = async (searchTerm) => {
    try {
      const response = await api.get('/wallets/index', {
        params: { search: searchTerm }
      });
      setFilteredAccounts(response.data.data || []);
    } catch (error) {
      setAccountError('Erro ao buscar contas bancárias');
      setFilteredAccounts([]);
    }
  };

  const handleAccountSearch = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      account_name: value,
      account_id: ''
    }));
    setAccountError("");

    if (value.length >= 3) {
      fetchAccounts(value);
    } else {
      setFilteredAccounts([]);
    }
  };

  const handleAccountSelect = (account) => {
    setFormData(prev => ({
      ...prev,
      account_id: account.id,
      account_name: account.bank_name
    }));
    setFilteredAccounts([]);
    setAccountError("");
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
        ...formData,
        amount: formData.amount // usando o valor não formatado
      };
      delete submitData.formattedAmount; // remove o campo formatado antes de enviar
      
      await api.post('/wallet/movement', submitData);
      setSuccess('Movimentação registrada com sucesso!');
      setTimeout(() => {
        navigate('/movimentacoes');
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
            <label htmlFor="account_name">Conta Bancária *</label>
            <div className="input-with-button">
              <input
                type="text"
                id="account_name"
                name="account_name"
                value={formData.account_name}
                onChange={handleAccountSearch}
                placeholder="Digite para buscar conta"
                required
              />
              {filteredAccounts.length > 0 && (
                <ul className="add-pet-field-list">
                  {filteredAccounts.map(account => (
                    <li key={account.id} onClick={() => handleAccountSelect(account)}>
                      {`${account.id} - ${account.bank_name}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

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
        </div>

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="amount">Valor *</label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.formattedAmount || ''}
              onChange={handleAmountChange}
              required
              placeholder="R$ 0,00"
            />
          </div>

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
          <label htmlFor="description">Descrição *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate('/movimentacoes')}>
            Cancelar
          </button>
          <button type="submit">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTransaction;