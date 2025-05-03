import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSync, FaPlus } from 'react-icons/fa';
import api from '../../../../services/api';
import Table from '../../../Shared/Table';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import DetailsTransactionModal from '../../Modal/DetailsTransactionModal/DetailsTransactionModal';

function ListTransactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const accountId = location.state?.accountId;

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filterAccount, setFilterAccount] = useState(accountId || '');
  const [filterType, setFilterType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [sortColumn, setSortColumn] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/wallets/index');
      setAccounts(response.data.wallets || []);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accountId) {
      setFilterAccount(accountId);
    }
  }, [accountId]);

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
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      const response = await api.get('/wallet/movements/index', { params });
      
      if (!response.data || !response.data.movements) {
        throw new Error('Resposta inválida do servidor');
      }

      setTransactions(response.data.movements.data || []);
      
      const movements = response.data.movements;
      setPagination({
        currentPage: movements.current_page,
        totalPages: movements.last_page,
        totalItems: movements.total,
        itemsPerPage: movements.per_page,
      });
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
    }
  }, [filterAccount, filterType, filterStartDate, filterEndDate, sortColumn, sortOrder, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleRefresh();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [handleRefresh]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = Number(event.target.value);
    setPagination({
      ...pagination,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    });
  };

  const columns = [
    { key: 'id', label: 'ID', type: 'number' },
    {
      key: 'user_name',
      label: 'Usuário',
      render: (value, item) => item.user.name
    },
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

  ];

  const getActionItems = (itemId, item) => [
    {
      label: "Detalhar",
      action: () => setSelectedTransaction(item),
    },
  ];

  return (
    <div className="transactions-list-container">
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
          
          <div className="pagination-container">
            <div className="pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage <= 1}
              >
                {"<<"}
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                {"<"}
              </button>
              <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                {">"}
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                {">>"}
              </button>
            </div>

            <div className="items-per-page-selector">
              <label htmlFor="itemsPerPage">Itens por página: </label>
              <select
                id="itemsPerPage"
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
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