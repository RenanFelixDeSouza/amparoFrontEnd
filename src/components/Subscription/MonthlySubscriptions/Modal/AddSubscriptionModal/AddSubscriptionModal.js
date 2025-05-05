import React, { useState, useEffect } from 'react';
import api from '../../../../../services/api';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const AddSubscriptionModal = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    plan_id: '',
    user_id: '',
    responsible_id: '',
    start_date: '',
    value: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, plansResponse] = await Promise.all([
          api.get('/users/index'),
          api.get('/subscription-plans')
        ]);
        
        setUsers(usersResponse.data.data || []);
        setPlans(plansResponse.data.data || []);
        setError('');
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados necessários');
      }
    };

    fetchData();
  }, []);

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
            <label htmlFor="user_id">Assinante:</label>
            <select
              id="user_id"
              name="user_id"
              value={form.user_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o assinante...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.user_name}
                </option>
              ))}
            </select>
          </div>


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