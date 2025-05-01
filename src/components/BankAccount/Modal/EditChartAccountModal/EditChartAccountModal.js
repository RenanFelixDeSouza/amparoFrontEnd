import React, { useState } from 'react';
import './EditChartAccountModal.css';
import api from '../../../../services/api';
import { FaTimes } from 'react-icons/fa';

function EditChartAccountModal({ account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: account.name || '',
    type: account.type || 'analytical',
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
      await api.put(`/chart-accounts/${account.id}`, formData);
      onSave();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao atualizar plano de contas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-bank-account-modal-overlay" onClick={onClose}>
      <div className="edit-bank-account-modal-content" onClick={e => e.stopPropagation()}>
        <div className="edit-bank-account-modal-header">
          <h2>Editar Plano de Contas</h2>
          <button className="edit-bank-account-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-bank-account-form">
          {error && <div className="error-message">{error}</div>}

          <div className="edit-bank-account-form-group">
            <label htmlFor="name">Nome da Conta *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="edit-bank-account-form-group">
            <label htmlFor="type">Tipo de Conta *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="analytical">Analítico</option>
              <option value="synthetic">Sintético</option>
            </select>
          </div>

          <div className="edit-bank-account-form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
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

export default EditChartAccountModal;