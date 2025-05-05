import React, { useState } from 'react';
import api from '../../../../../services/api';

function EditMonthlySubscriptionModal({ subscription, onClose, onSave }) {
  const [formData, setFormData] = useState({
    subscriber_name: subscription.subscriber_name,
    plan_id: subscription.plan_id,
    status: subscription.status,
    start_date: subscription.start_date?.split('T')[0],
    value: subscription.value
  });
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await api.put(`/monthly-subscriptions/${subscription.id}`, formData);
      onSave();
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      setError('Erro ao salvar as alterações. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Assinatura Mensal</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subscriber_name">Nome do Assinante:</label>
            <input
              type="text"
              id="subscriber_name"
              name="subscriber_name"
              value={formData.subscriber_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="value">Valor:</label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Data de Início:</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="pending">Pendente</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMonthlySubscriptionModal;