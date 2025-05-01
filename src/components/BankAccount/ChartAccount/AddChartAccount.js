import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import api from '../../../services/api';
import ChartAccountTree from './ChartAccountTree';
import './ChartAccount.css';

function AddChartAccount() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'synthetic',
    account_code: '',
    parent_id: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await api.get('/chart-accounts/index');
        setAccounts(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        setErrors({ fetch: 'Erro ao carregar plano de contas' });
      }
    };
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.account_code.trim()) {
      newErrors.account_code = 'Código contábil é obrigatório';
    }

    // Novas regras de validação
    if (formData.type === 'analytical') {
      const parent = accounts.find(acc => acc.id === formData.parent_id);
      if (!parent) {
        newErrors.type = 'Contas analíticas precisam ter uma conta pai';
      } else if (parent.type === 'analytical') {
        newErrors.type = 'Contas analíticas não podem ser criadas dentro de outras contas analíticas';
      }
    }

    // Validação do formato do código contábil (X.X.X)
    const codePattern = /^\d+(\.\d+)*$/;
    if (!codePattern.test(formData.account_code)) {
      newErrors.account_code = 'Código contábil deve seguir o formato: X.X.X (ex: 1.1.0)';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.post('/chart-accounts/create', formData);
      navigate('/listar-contas', { state: { activeTab: 'ListChartAccounts' } });
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Erro ao criar plano de contas'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParentSelect = (account) => {
    setSelectedParent(account);
    const parentCode = account.account_code;
    const suggestion = `${parentCode}.0`;
    
    setFormData(prev => ({
      ...prev,
      parent_id: account.id,
      account_code: suggestion,
      // Se o pai for analítico, força filho como analítico
      type: account.type === 'analytical' ? 'analytical' : prev.type
    }));
  };

  const handleAddChild = (parentAccount) => {
    setSelectedParent(parentAccount);
    const newCode = `${parentAccount.account_code}.`;
    setFormData(prev => ({
      ...prev,
      parent_id: parentAccount.id,
      account_code: newCode,
      type: parentAccount.type === 'synthetic' ? 'analytical' : 'synthetic'
    }));
  };

  return (
    <div className="chart-account-container">
      <div className="chart-account-tree-section">
        <ChartAccountTree
          accounts={accounts}
          onSelect={handleParentSelect}
          onAddChild={handleParentSelect}
          selectedId={selectedParent?.id}
        />
      </div>

      <div className="chart-account-form-section">
        <h2>Nova Conta no Plano de Contas</h2>
        
        <form onSubmit={handleSubmit} className="chart-account-form">
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="account_code">Código Contábil *</label>
              <input
                type="text"
                id="account_code"
                name="account_code"
                value={formData.account_code}
                onChange={handleChange}
                placeholder="Ex: 1.1.2"
                className={errors.account_code ? 'error' : ''}
              />
              {errors.account_code && (
                <span className="error-message">{errors.account_code}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="type">Tipo de Conta *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error' : ''}
                disabled={selectedParent?.type === 'analytical'}
              >
                <option value="synthetic">Sintética (pode ter subcontas)</option>
                <option value="analytical">Analítica (não pode ter subcontas)</option>
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
              <small className="help-text">
                {formData.type === 'synthetic' 
                  ? 'Conta sintética: Agrupa outras contas (Ex: Despesas, Receitas)'
                  : 'Conta analítica: Conta final para lançamentos (Ex: Aluguel, Salário)'}
              </small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Nome da Conta *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {selectedParent && (
            <div className="selected-parent-info">
              <strong>Conta Pai:</strong>
              <p>
                {selectedParent.account_code} - {selectedParent.name}
                <br />
                <small>Tipo: {selectedParent.type === 'synthetic' ? 'Sintética' : 'Analítica'}</small>
              </p>
            </div>
          )}

          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/listar-contas', { state: { activeTab: 'ListChartAccounts' } })}
            >
              <FaTimes /> Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              <FaSave /> {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddChartAccount;