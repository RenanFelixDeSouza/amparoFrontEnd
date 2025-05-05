import React, { useState } from 'react';
import api from '../../../../../services/api';

function EditSubscriptionPlanModal({ plan, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: plan.name,
    description: plan.description,
    value: plan.value,
    duration_months: plan.duration_months
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.put(`/subscription-plans/${plan.id}`, formData);
      onSave();
    } catch (error) {
      setError('Erro ao atualizar o plano. Por favor, tente novamente.');
      console.error('Error updating subscription plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Plano de Assinatura</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
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
              step="0.01"
              value={formData.value}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration_months">Duração (meses):</label>
            <input
              type="number"
              id="duration_months"
              name="duration_months"
              value={formData.duration_months || ''}
              onChange={handleChange}
            />
          </div>

          <div className="button-group">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSubscriptionPlanModal;