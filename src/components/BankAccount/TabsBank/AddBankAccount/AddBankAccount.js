import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import './BankAccount.css';

function AddBankAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bank_name: '',
    agency: '',
    account_number: '',
    account_type: 'corrente',
    balance: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
              type="number"
              step="0.01"
              id="balance"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              required
            />
          </div>
        </div>

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
      </form>
    </div>
  );
}

export default AddBankAccount;