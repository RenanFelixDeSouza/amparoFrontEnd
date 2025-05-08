import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import ChartAccountTree from '../../ChartAccount/ChartAccountTree';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import './AddTransaction.css';
import { CgListTree } from "react-icons/cg";


function AddTransaction() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    wallet_id: '',
    account_name: '',
    chart_of_account_id: '',
    chart_account_name: '',
    type: 'entrada',
    value: '',
    formattedAmount: '',
    comments: '',
    date: new Date().toISOString().split('T')[0],
    company_id: '',
    company_name: '',
    physical_person_id: '',
    person_name: '',
    receipt: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChartTree, setShowChartTree] = useState(false);
  const [chartAccounts, setChartAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filterCompanyName, setFilterCompanyName] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [companyError, setCompanyError] = useState("");
  const [filterPersonName, setFilterPersonName] = useState("");
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [personError, setPersonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterChartAccountName, setFilterChartAccountName] = useState("");
  const [filteredChartAccounts, setFilteredChartAccounts] = useState([]);
  const [showChartAccountsList, setShowChartAccountsList] = useState(false);

  useEffect(() => {
    const fetchChartAccounts = async () => {
      try {
        const params = {
          page: 1,
          limit: 999
        };
        const response = await api.get('/chart-accounts/index', { params });
        const chartAccountsData = response.data.data || [];

        // Ordenando o plano de contas por nome
        const sortedChartAccounts = chartAccountsData.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setChartAccounts(sortedChartAccounts);
      } catch (error) {
        setError('Erro ao carregar plano de contas');
      }
    };
    fetchChartAccounts();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // Busca as contas bancárias
        const response = await api.get('/wallets/index/simplified');
        const accountsData = response.data?.data || response.data || [];

        // Ordenando as contas bancárias por nome
        const sortedAccounts = accountsData.sort((a, b) =>
          (a.bank_name || '').localeCompare(b.bank_name || '')
        );

        setAccounts(sortedAccounts);

        // Busca as configurações
        const configResponse = await api.get('/configurations/index');
        if (configResponse.data?.default_wallet?.id) {
          const defaultAccount = sortedAccounts.find(
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

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        if (filterCompanyName.length >= 3 && !formData.company_id) {
          const params = {
            page: 1,
            limit: 999,
            company_name: filterCompanyName
          };
          const response = await api.get('/companies/index', { params });
          setFilteredCompanies(response.data.data || []);
        } else {
          setFilteredCompanies([]);
        }
      } catch (error) {
        setCompanyError('Erro ao carregar empresas');
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCompanies();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [filterCompanyName, formData.company_id]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        if (filterPersonName.length >= 3 && !formData.physical_person_id) {
          const params = {
            page: 1,
            limit: 999,
            name: filterPersonName
          };
          const response = await api.get('/users/index', { params });
          setFilteredPeople(response.data.data || []);
        } else {
          setFilteredPeople([]);
        }
      } catch (error) {
        setPersonError('Erro ao carregar pessoas');
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchPeople();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [filterPersonName, formData.physical_person_id]);

  useEffect(() => {
    const filterAnalyticalAccounts = () => {
      if (filterChartAccountName.length >= 3) {
        const filtered = chartAccounts.filter(account =>
          account.type === 'analytical' &&
          account.name.toLowerCase().includes(filterChartAccountName.toLowerCase())
        );
        setFilteredChartAccounts(filtered);
        setShowChartAccountsList(true);
      } else {
        setFilteredChartAccounts([]);
        setShowChartAccountsList(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      filterAnalyticalAccounts();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [filterChartAccountName, chartAccounts]);

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = (parseFloat(value) / 100).toFixed(2);

    setFormData(prev => ({
      ...prev,
      value: value,
      formattedAmount: formatCurrency(value)
    }));
  };

  const handleChartAccountSelect = (account) => {
    if (account.type === 'analytical') {
      setFormData(prev => ({
        ...prev,
        chart_of_account_id: account.id,
        chart_account_name: account.name
      }));
      setFilterChartAccountName(account.name);
      setShowChartTree(false);
      setShowChartAccountsList(false);
      setFilteredChartAccounts([]);
      setError('');
    } else {
      setError('Selecione apenas contas analíticas');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanySelect = (company) => {
    setFormData(prev => ({
      ...prev,
      company_id: company.id.toString(),
      company_name: company.company_name,
      physical_person_id: '',
      person_name: ''
    }));
    setFilteredCompanies([]);
    setCompanyError("");
    setFilterCompanyName(company.company_name);
    setFilterPersonName("");
  };

  const handlePersonSelect = (person) => {
    setFormData(prev => ({
      ...prev,
      physical_person_id: person.id.toString(),
      person_name: person.user_name,
      company_id: '',
      company_name: ''
    }));
    setFilteredPeople([]);
    setPersonError("");
    setFilterPersonName(person.user_name);
    setFilterCompanyName("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verifica se é PDF
      if (file.type !== 'application/pdf') {
        setError('Por favor, envie apenas arquivos PDF');
        e.target.value = null;
        return;
      }

      // Verifica o tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 5MB');
        e.target.value = null;
        return;
      }

      setFormData(prev => ({
        ...prev,
        receipt: file
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Adiciona todos os campos ao FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] && key !== 'receipt') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Adiciona o arquivo se existir
      if (formData.receipt) {
        formDataToSend.append('receipt', formData.receipt);
      }

      await api.post('/wallet/movement', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Movimentação registrada com sucesso!');
      setFormData({
        wallet_id: '',
        account_name: '',
        chart_of_account_id: '',
        chart_account_name: '',
        type: 'entrada',
        value: '',
        formattedAmount: '',
        comments: '',
        date: new Date().toISOString().split('T')[0],
        company_id: '',
        company_name: '',
        physical_person_id: '',
        person_name: '',
        receipt: null
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao registrar movimentação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bank-account-container">
      <form onSubmit={handleSubmit} className="add-bank-form">
        <h2>Nova Movimentação</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
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

          <div className="add-bank-form-group flex-1">
            <label htmlFor="chart_account_name">Plano de Contas (Analítico) *</label>
            <div className="input-container">
              <input
                type="text"
                id="chart_account_name"
                name="chart_account_name"
                value={filterChartAccountName}
                onChange={(e) => setFilterChartAccountName(e.target.value)}
                placeholder="Digite para buscar ou clique para abrir"
                onClick={() => {
                  if (!filterChartAccountName) {
                    setShowChartTree(!showChartTree);
                    setShowChartAccountsList(false);
                  }
                }}
                required
              />
              {showChartAccountsList && filteredChartAccounts.length > 0 && (
                <ul className="add-pet-field-list">
                  {filteredChartAccounts.map((account) => (
                    <li
                      key={account.id}
                      onClick={() => {
                        handleChartAccountSelect(account);
                        setFilterChartAccountName(account.name);
                        setShowChartAccountsList(false);
                      }}
                    >
                      {account.name}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="tree-button"
                onClick={() => {
                  setShowChartTree(!showChartTree);
                  setShowChartAccountsList(false);
                }}
              >
                <CgListTree />
              </button>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="type">Tipo *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>

          <div className="add-bank-form-group flex-1">
            <label htmlFor="value">Valor *</label>
            <input
              type="text"
              id="value"
              name="value"
              value={formData.formattedAmount || ''}
              onChange={handleAmountChange}
              required
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="add-bank-form-group flex-1">
            <label htmlFor="date">Data *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-row">
            <div className="add-bank-form-group flex-1">
              <label htmlFor="filterCompanyName">Buscar Empresa</label>
              <div className="input-container">
                <input
                  type="text"
                  id="filterCompanyName"
                  value={filterCompanyName}
                  onChange={(e) => setFilterCompanyName(e.target.value)}
                  placeholder="Digite para buscar empresa..."
                  className="form-control"
                />
                {filteredCompanies.length > 0 && (
                  <ul className="add-pet-field-list">
                    {filteredCompanies.map((company) => (
                      <li key={company.id} onClick={() => handleCompanySelect(company)}>
                        {company.company_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="add-bank-form-group flex-1">
              <label htmlFor="filterPersonName">Buscar Pessoa</label>
              <div className="input-container">
                <input
                  type="text"
                  id="filterPersonName"
                  value={filterPersonName}
                  onChange={(e) => setFilterPersonName(e.target.value)}
                  placeholder="Digite para buscar pessoa..."
                  className="form-control"
                />
                {filteredPeople.length > 0 && (
                  <ul className="add-pet-field-list">
                    {filteredPeople.map((person) => (
                      <li key={person.id} onClick={() => handlePersonSelect(person)}>
                        {person.user_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="add-bank-form-group">
          <label htmlFor="comments">Descrição *</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>

        <div className="add-bank-form-group">
          <label htmlFor="receipt">
            Nota Fiscal (PDF) 
            {formData.type === 'saida' && 
              <span className="file-recommendation">
                - Recomendamos fortemente anexar a nota fiscal para despesas
              </span>
            }
          </label>
          <input
            type="file"
            id="receipt"
            name="receipt"
            accept=".pdf"
            onChange={handleFileChange}
            className="form-control"
          />
          <small className="file-info">Máximo: 5MB, formato: PDF</small>
        </div>

        <div className="form-buttons">
          <button
            type="button"
            onClick={() => navigate('/listar-contas', { state: { activeTab: 'ListTransactions' } })}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner /> : 'Salvar'}
          </button>
        </div>
      </form>

      {showChartTree && (
        <div className="chart-tree-overlay">
          <div className="chart-tree-modal">
            <div className="chart-tree-header">
              <h3>Selecione uma Conta Analítica</h3>
              <button onClick={() => setShowChartTree(false)}>×</button>
            </div>
            <ChartAccountTree
              accounts={chartAccounts}
              onSelect={handleChartAccountSelect}
              selectedId={formData.chart_of_account_id}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AddTransaction;