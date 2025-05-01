import React, { useState } from 'react';
import './EditBankAccountModal.css';
import api from '../../../../services/api';
import { FaTimes } from 'react-icons/fa';

function EditBankAccountModal({ account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    bank_name: account.bank_name || '',
    agency: account.agency || '',
    account_number: account.account_number || '',
    account_type: account.account_type || 'corrente',
    description: account.description || ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      await api.put(`/wallet/update/${account.id}`, formData);
      onSave();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao atualizar conta bancária');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-bank-account-modal-overlay" onClick={onClose}>
      <div className="edit-bank-account-modal-content" onClick={e => e.stopPropagation()}>
        <div className="edit-bank-account-modal-header">
          <h2>Editar Conta Bancária</h2>
          <button className="edit-bank-account-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-bank-account-form">
          {error && <div className="error-message">{error}</div>}

          <div className="edit-bank-account-form-group">
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

          <div className="edit-bank-account-form-row">
            <div className="edit-bank-account-form-group">
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

            <div className="edit-bank-account-form-group">
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

            <div className="edit-bank-account-form-group">
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

          <div className="edit-bank-account-form-group">
            <label htmlFor="description">Descrição</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="edit-bank-account-modal-buttons">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBankAccountModal;