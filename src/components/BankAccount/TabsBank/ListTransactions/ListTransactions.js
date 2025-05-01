import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSync, FaMoneyBillWave, FaPlus } from 'react-icons/fa';
import api from '../../../../services/api';
import Table from '../../../Shared/Table';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import DetailsTransactionModal from '../../Modal/DetailsTransactionModal/DetailsTransactionModal';

function ListTransactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAccount = location.state || {};
  
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filterAccount, setFilterAccount] = useState(selectedAccount.accountId || '');
  const [selectedAccountName, setSelectedAccountName] = useState(
    selectedAccount.bankName && selectedAccount.accountNumber 
      ? `${selectedAccount.bankName} - ${selectedAccount.accountNumber}`
      : ''
  );
  const [filterType, setFilterType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [sortColumn, setSortColumn] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/wallets/index');
      // Pegando apenas os dados do array data
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        wallet_id: filterAccount,
        type: filterType,
        start_date: filterStartDate,
        end_date: filterEndDate,
        sort_column: sortColumn,
        sort_order: sortOrder,
        page: currentPage
      };
      const response = await api.get(`/wallet/movements/index`, { params });
      setTransactions(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
      setTotalItems(response.data.total);
    } catch (error) {
      setError('Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
    }
  }, [filterAccount, filterType, filterStartDate, filterEndDate, sortColumn, sortOrder, currentPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleRefresh();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [handleRefresh]);

  useEffect(() => {
    if (selectedAccount.accountId) {
      setFilterAccount(selectedAccount.accountId);
      handleRefresh();
    }
  }, [selectedAccount, handleRefresh]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    { key: 'id', label: 'ID', type: 'number' },
    { 
      key: 'created_at', 
      label: 'Data',
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    },
    { 
      key: 'wallet_info', 
      label: 'Conta',
      render: (value, item) => `${item.wallet.bank_name} - ${item.wallet.account_number}`,
    },
    { 
      key: 'type',
      label: 'Tipo',
      render: (value) => value === 'entrada' ? 'Entrada' : 'Saída',
    },
    {
      key: 'value',
      label: 'Valor',
      render: (value, item) => (
        <span style={{ color: item.type === 'entrada' ? '#4caf50' : '#f44336' }}>
          {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(value)}
        </span>
      ),
    },
    {
      key: 'wallet_balance',
      label: 'Saldo',
      render: (value, item) => new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(item.wallet.total_value)
    },
    {
      key: 'user_name',
      label: 'Usuário',
      render: (value, item) => item.user.name
    },
  ];

  const getActionItems = (itemId, item) => [
    {
      label: "Detalhar",
      action: () => setSelectedTransaction(item),
    },
  ];

  return (
    <div className="transactions-container">
      <div className="list-header">
        <h2>Movimentações Bancárias</h2>
        <button 
          className="add-button"
          onClick={() => navigate('/nova-movimentacao')}
        >
          <FaPlus /> Nova Movimentação
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Conta:</legend>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
              >
                <option value="">Todas</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.bank_name} -  Conta: {account.account_number}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Tipo:</legend>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Data Inicial:</legend>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Data Final:</legend>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </fieldset>
          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <FaSync />
            {isLoading ? '' : '   Atualizar Tabela'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!isLoading && (
        <>
          <Table
            data={transactions}
            columns={columns}
            handleSort={handleSort}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            getActionItems={getActionItems}
            isSortable={true}
          />
          
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      <DetailsTransactionModal 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </div>
  );
}

export default ListTransactions;