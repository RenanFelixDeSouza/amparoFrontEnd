import React, { useState, useEffect } from 'react';
import './EditChartAccountModal.css';
import api from '../../../../services/api';
import { FaTimes,  FaFolder } from 'react-icons/fa';

function EditChartAccountModal({ account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: account?.id || '',
    account_code: account?.account_code || '',
    name: account?.name || '',
    type: account?.type || 'synthetic',
    parent_id: account?.parent?.id || ''
  });

  const [error, setError] = useState('');

  const [parentAccount, setParentAccount] = useState(null);
  const [childAccounts, setChildAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadAccountDetails = async () => {
      try {
        if (account.parent_id) {
          const parentResponse = await api.get(`/chart-accounts/${account.parent_id}`);
          setParentAccount(parentResponse.data.data);
        }
        const childrenResponse = await api.get(`/chart-accounts/children/${account.id}`);
        setChildAccounts(childrenResponse.data);
      } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        setError('Erro ao carregar detalhes da conta');
      }
    };
    loadAccountDetails();
  }, [account.id, account.parent_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type' && childAccounts.length > 0 && value === 'analytical') {
      setError('Não é possível mudar para conta analítica pois existem contas filhas');
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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

        <div className="account-hierarchy-info">
          <div className="account-hierarchy-path">
            {account.full_path && account.full_path.map((pathId, index) => (
              <span key={pathId} className="path-item">
                {parentAccount && parentAccount.id === parseInt(pathId) ? (
                  <>{parentAccount.name} 
                    <span className={`account-type-badge ${parentAccount.type}`}>
                      {parentAccount.type === 'analytical' ? 'Analítica' : 'Sintética'}
                    </span>
                  </>
                ) : null}
              </span>
            ))}
            <span className="path-item current-account">
              {account.name}
              <span className={`account-type-badge ${account.type}`}>
                {account.type === 'analytical' ? 'Analítica' : 'Sintética'}
              </span>
            </span>
          </div>

          {account.type === 'synthetic' && Array.isArray(childAccounts) && childAccounts.length > 0 && (
            <div className="child-accounts-container">
              <div className="child-accounts-title">
                <FaFolder /> Contas Filhas
              </div>
              <ul>
                {childAccounts.map(child => (
                  <li key={child.id}>
                    {child.name}
                    <span className={`account-type-badge ${child.type}`}>
                      {child.type === 'analytical' ? 'Analítica' : 'Sintética'}
                    </span>
                    <span className="account-code">({child.account_code})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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