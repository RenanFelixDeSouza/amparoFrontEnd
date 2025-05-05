import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';

function PayInstallmentModal({ installment, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    observation: '',
    wallet_id: '',
    account_name: ''
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // Busca as contas bancárias
        const response = await api.get('/wallets/index/simplified');
        const accountsData = response.data?.data || response.data || [];
        setAccounts(accountsData);

        // Busca as configurações
        const configResponse = await api.get('/configurations/index');
        if (configResponse.data?.default_wallet?.id) {
          const defaultAccount = accountsData.find(
            acc => acc.id === configResponse.data.default_wallet.id
          );
          
          if (defaultAccount) {
            setFormData(prev => ({
              ...prev,
              wallet_id: defaultAccount.id.toString(),
              account_name: defaultAccount.bank_name
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
        setError('Erro ao carregar contas bancárias');
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post(`/financial/installments/${installment.id}/pay`, formData);
      setSuccess("Pagamento registrado com sucesso!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao registrar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay-edit") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay-edit" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registrar Pagamento</h2>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="modal-form-body">
              <div className="form-group-inline">
                <div className="form-group">
                  <label>Parcela:</label>
                  <input
                    type="text"
                    disabled
                    value={`${installment.current_installment}/${installment.total_installments}`}
                  />
                </div>

                <div className="form-group">
                  <label>Assinante:</label>
                  <input
                    type="text"
                    disabled
                    value={installment.subscriber_name}
                  />
                </div>
              </div>

              <div className="form-group-inline">
                <div className="form-group">
                  <label>Plano:</label>
                  <input
                    type="text"
                    disabled
                    value={installment.plan_name}
                  />
                </div>

                <div className="form-group">
                  <label>Valor:</label>
                  <input
                    type="text"
                    disabled
                    value={new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(installment.installment_value)}
                  />
                </div>
              </div>

              <div className="form-group-inline">
                <div className="form-group">
                  <label>Vencimento:</label>
                  <input
                    type="text"
                    disabled
                    value={new Date(installment.due_date).toLocaleDateString('pt-BR')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="payment_date">Data do Pagamento:</label>
                  <input
                    type="date"
                    id="payment_date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="wallet_id">Conta Bancária *</label>
                <select
                  id="wallet_id"
                  name="wallet_id"
                  value={formData.wallet_id}
                  onChange={(e) => {
                    const selectedAccount = accounts.find(acc => acc.id === parseInt(e.target.value));
                    setFormData(prev => ({
                      ...prev,
                      wallet_id: e.target.value,
                      account_name: selectedAccount ? selectedAccount.bank_name : ''
                    }));
                  }}
                  required
                  className="form-control"
                >
                  <option value="">Selecione uma conta bancária</option>
                  {Array.isArray(accounts) && accounts.length > 0 ? (
                    accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {`${account.bank_name || ''} - Ag: ${account.agency || ''} - CC: ${account.account_number || ''}`}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Nenhuma conta bancária disponível</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="observation">Observação:</label>
                <textarea
                  id="observation"
                  name="observation"
                  value={formData.observation}
                  onChange={handleChange}
                  rows={3}
                  className="full-width"
                />
              </div>
            </div>

            <div className="modal-buttons">
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit">
                Registrar Pagamento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PayInstallmentModal;