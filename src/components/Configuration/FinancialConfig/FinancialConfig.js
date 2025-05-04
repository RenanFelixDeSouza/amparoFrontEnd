import React, { useState, useEffect } from 'react';
import ChartAccountTree from '../../BankAccount/ChartAccount/ChartAccountTree';
import api from '../../../services/api'; // Assuming api is imported from a relevant file

function FinancialConfig() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chartAccounts, setChartAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [formData, setFormData] = useState({});
  const [showChartTree, setShowChartTree] = useState({
    monthly: false,
    donation: false,
    sponsorship: false
  });

  useEffect(() => {
    const fetchChartAccounts = async () => {
      try {
        const params = { page: 1, limit: 999 };
        const response = await api.get('/chart-accounts/index', { params });
        setChartAccounts(response.data.data || []);
      } catch (error) {
        setError('Erro ao carregar plano de contas');
      }
    };
    fetchChartAccounts();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await api.get('/wallets/index/simplified');
        const accountsData = response.data?.data || response.data || [];
        setAccounts(accountsData);
      } catch (error) {
        setError('Erro ao carregar contas bancárias');
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const response = await api.get('/configurations/index');
        if (response.data) {
          const initialData = {
            monthly_chart_id: response.data.monthly_chart?.id || '',
            monthly_chart_name: response.data.monthly_chart?.name || '',
            donation_chart_id: response.data.donation_chart?.id || '',
            donation_chart_name: response.data.donation_chart?.name || '',
            sponsorship_chart_id: response.data.sponsorship_chart?.id || '',
            sponsorship_chart_name: response.data.sponsorship_chart?.name || '',
            default_wallet_id: response.data.default_wallet?.id || ''
          };
          setFormData(initialData);
          setSelectedAccount(response.data.default_wallet?.id || '');
        }
      } catch (error) {
        setError('Erro ao carregar configurações');
      }
    };
    fetchConfigurations();
  }, []);

  const handleChartAccountSelect = (account, type) => {
    if (account.type === 'analytical') {
      const newData = {
        ...formData,
        [`${type}_chart_id`]: account.id,
        [`${type}_chart_name`]: account.name
      };
      setFormData(newData);
      setShowChartTree(prev => ({
        ...prev,
        [type]: false
      }));
    }
  };

  const handleSave = async () => {
    try {
      const configData = {
        ...formData,
        default_wallet_id: selectedAccount
      };
      await api.post('/configurations/save', configData);
      setSuccess('Configurações salvas com sucesso!');
    } catch (error) {
      setError('Erro ao salvar as configurações');
    }
  };

  return (
    <div className="financial-config">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="config-section">
        <div className="section-box">
          <h3>CONTA BANCÁRIAS</h3>

          <div className="form-group">
            <label>Conta Bancária Padrão:</label>
            <select
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="form-control"
              value={selectedAccount}
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

          <h3>PLANO DE CONTAS</h3>
          <div className="form-group-inline">
            <div className="form-group">
              <label>Plano de Contas para Controle de Mensalidades</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={formData.monthly_chart_name || ''}
                  readOnly
                  placeholder="Selecione um plano de contas analítico"
                  onClick={() => setShowChartTree(prev => ({ ...prev, monthly: true }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Plano de Contas para Controle de Doações</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={formData.donation_chart_name || ''}
                  readOnly
                  placeholder="Selecione um plano de contas analítico"
                  onClick={() => setShowChartTree(prev => ({ ...prev, donation: true }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Plano de Contas para Controle de Patrocínios</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={formData.sponsorship_chart_name || ''}
                  readOnly
                  placeholder="Selecione um plano de contas analítico"
                  onClick={() => setShowChartTree(prev => ({ ...prev, sponsorship: true }))}
                />
              </div>
            </div>
          </div>
        </div>

        {(showChartTree.monthly || showChartTree.donation || showChartTree.sponsorship) && (
          <div className="chart-tree-overlay">
            <div className="chart-tree-modal">
              <div className="chart-tree-header">
                <h3>Selecione uma Conta Analítica</h3>
                <button onClick={() => setShowChartTree({ monthly: false, donation: false, sponsorship: false })}>×</button>
              </div>
              <ChartAccountTree
                accounts={chartAccounts}
                onSelect={(account) => {
                  if (showChartTree.monthly) handleChartAccountSelect(account, 'monthly');
                  if (showChartTree.donation) handleChartAccountSelect(account, 'donation');
                  if (showChartTree.sponsorship) handleChartAccountSelect(account, 'sponsorship');
                }}
                selectedId={
                  showChartTree.monthly ? formData.monthly_chart_id :
                    showChartTree.donation ? formData.donation_chart_id :
                      formData.sponsorship_chart_id
                }
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="form-buttons">
        <button type="button" className="btn-cancelar" onClick={() => setFormData({})}>CANCELAR</button>
        <button type="submit" onClick={() => handleSave()}>SALVAR</button>
      </div>
    </div>
  );
}

export default FinancialConfig;