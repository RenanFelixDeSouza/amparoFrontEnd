import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSync, FaPlus } from 'react-icons/fa';
import api from '../../../../services/api';
import Table from '../../../Shared/Table';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import EditBankAccountModal from '../../Modal/EditBankAccountModal/EditBankAccountModal';

function ListBankAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterBank, setFilterBank] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortColumn, setSortColumn] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });
  const [editAccount, setEditAccount] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        bank_name: filterBank,
        account_type: filterType,
        sort_column: sortColumn,
        sort_order: sortOrder,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      const response = await api.get('/wallets/index', { params });

      if (!response.data) {
        throw new Error('Resposta inválida do servidor');
      }

      setAccounts(Array.isArray(response.data.wallets) ? response.data.wallets : []);

      const summary = response.data.summary;
      setPagination({
        currentPage: summary.current_page,
        totalPages: summary.last_page,
        totalItems: summary.total,
        itemsPerPage: summary.per_page,
      });
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao carregar contas bancárias');
    } finally {
      setIsLoading(false);
    }
  }, [filterBank, filterType, sortColumn, sortOrder, pagination.currentPage, pagination.itemsPerPage]);

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

  const handleSaveEdit = () => {
    handleRefresh();
    setEditAccount(null);
  };

  const columns = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'bank_name', label: 'Nome do Banco', type: 'text' },
    { key: 'agency', label: 'Agência', type: 'text' },
    { key: 'account_number', label: 'Número da Conta', type: 'text' },
    { key: 'account_type', label: 'Tipo de Conta', type: 'text' },
    {
      key: 'total_value',
      label: 'Saldo Total',
      type: 'number',
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
      label: 'Editar',
      action: () => setEditAccount(item),
    },
    {
      label: 'Ver Movimentações',
      action: () => navigate('.', {
        state: {
          activeTab: 'ListTransactions',
          accountId: itemId,
          bankName: item.bank_name,
          accountNumber: item.account_number
        }
      }),
    },
  ];

  return (
    <div className="bank-account-list-container">
      <div className="list-header">
        <h2>Contas Bancárias</h2>
        <button
          className="add-button"
          onClick={() => navigate('/criar-conta')}
        >
          <FaPlus /> Nova Conta
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Banco:</legend>
              <input
                type="text"
                placeholder="Digite o nome do banco..."
                value={filterBank}
                onChange={(e) => setFilterBank(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Tipo de Conta:</legend>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Conta Poupança</option>
                <option value="investimento">Conta Investimento</option>
              </select>
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
            data={accounts}
            columns={columns}
            handleSort={handleSort}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            getActionItems={getActionItems}
            isSortable={true}
          />

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
        </>
      )}

      {editAccount && (
        <EditBankAccountModal
          account={editAccount}
          onClose={() => setEditAccount(null)}
          onSave={handleSaveEdit}
        />
      )}

    </div>
  );
}

export default ListBankAccounts;