import React, { useState, useEffect } from 'react';
import api from '../../../../../services/api';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './AddSubscriptionModal.css';

const AddSubscriptionModal = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    plan_id: '',
    user_id: '',
    user_name: '',
    responsible_id: '',
    start_date: '',
    value: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansResponse = await api.get('/subscription-plans');
        const sortedPlans = (plansResponse.data.data || []).sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setPlans(sortedPlans);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        setError('Erro ao carregar planos');
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm) {
        setFilteredUsers([]);
        return;
      }

      try {
        const params = {
          name: searchTerm,
          limit: 999,
          active_status: 'active'
        };
        const response = await api.get('/users/index', { params });
        const sortedUsers = (response.data.data || []).sort((a, b) => 
          a.user_name.localeCompare(b.user_name)
        );
        setFilteredUsers(sortedUsers);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setError('Erro ao buscar usuários');
      }
    };

    // Debounce para evitar muitas requisições
    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const onClose = () => {
    navigate('/assinaturas');
  };

  const onSuccess = () => {
    navigate('/assinaturas');
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/monthly-subscriptions', form);
      message.success('Assinatura criada com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      setError(error.response?.data?.message || 'Erro ao criar assinatura');
      message.error('Erro ao criar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'value') {
      const numericValue = value.replace(/\D/g, '');
      const floatValue = numericValue ? parseFloat(numericValue) / 100 : 0;
      setForm(prev => ({ ...prev, [name]: floatValue }));
    } else {
      setForm(prev => {
        const newForm = {
          ...prev,
          [name]: value
        };
        
        if (name === 'plan_id') {
          const selectedPlan = plans.find(plan => plan.id === parseInt(value));
          if (selectedPlan) {
            newForm.value = selectedPlan.value;
          }
        }
        
        return newForm;
      });
    }
  };

  const handleUserSelect = (user) => {
    setForm(prev => ({
      ...prev,
      user_id: user.id,
      user_name: user.user_name
    }));
    setShowUserSearch(false);
    setSearchTerm('');
  };

  return (
    <div className="bank-account-container">
      <div className="bank-form">
        <h2>Vincular Nova Assinatura</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="plan_id">Plano:</label>
            <select
              id="plan_id"
              name="plan_id"
              value={form.plan_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um plano...</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(plan.value)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="user_name">Assinante:</label>
            <div className="input-with-button">
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={form.user_name}
                onClick={() => setShowUserSearch(true)}
                readOnly
                placeholder="Selecione o assinante..."
                required
              />
            </div>
          </div>

          {showUserSearch && (
            <div className="search-overlay">
              <div className="search-modal">
                <div className="search-header">
                  <h3>Selecione um Assinante</h3>
                  <button type="button" onClick={() => setShowUserSearch(false)}>×</button>
                </div>
                <input
                  type="text"
                  placeholder="Buscar assinante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <div className="search-results">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="search-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      {user.user_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="start_date">Data de Início:</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="value">Valor:</label>
            <input
              type="text"
              id="value"
              name="value"
              value={formatCurrency(form.value)}
              onChange={handleChange}
              required
              readOnly
            />
          </div>

          <div className="form-buttons">
            <button type="button" onClick={onClose} disabled={loading}>
              Voltar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Criar Assinatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriptionModal;