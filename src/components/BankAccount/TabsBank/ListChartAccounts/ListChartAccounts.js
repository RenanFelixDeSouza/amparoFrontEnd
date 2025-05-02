import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSync, FaPlus } from 'react-icons/fa';
import api from '../../../../services/api';
import Table from '../../../Shared/Table';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import EditChartAccountModal from '../../Modal/EditChartAccountModal/EditChartAccountModal';

function ListChartAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState('');
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

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        name: filterName,
        type: filterType,
        sort_column: sortColumn,
        sort_order: sortOrder,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      const response = await api.get('/chart-accounts/index', { params });
      setAccounts(Array.isArray(response.data.data) ? response.data.data : []);
      
      setPagination({
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
        itemsPerPage: response.data.meta.per_page,
      });
    } catch (error) {
      setError('Erro ao carregar plano de contas');
    } finally {
      setIsLoading(false);
    }
  }, [filterName, filterType, sortColumn, sortOrder, pagination.currentPage, pagination.itemsPerPage]);

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
    { key: 'account_code', label: 'Código', type: 'text' },
    { key: 'name', label: 'Nome da Conta', type: 'text' },
    { 
      key: 'level', 
      label: 'Nível', 
      type: 'number',
      render: (value) => `Nível ${value}`
    },
    {
      key: 'parent',
      label: 'Conta Pai',
      type: 'text',
      render: (value) => value ? value.name : '-'
    },
    { 
      key: 'type', 
      label: 'Tipo', 
      type: 'text',
      render: (value) => value === 'analytical' ? 'Analítico' : 'Sintético'
    },
    {
      key: 'children',
      label: 'Sub-contas',
      type: 'number',
      render: (value) => value ? value.length : 0
    },
  ];

  const getActionItems = (itemId, item) => [
    {
      label: 'Editar',
      action: () => setEditAccount(item),
    },
    {
      label: 'Ver Movimentações',
      action: () => navigate('/plano-contas/movimentacoes', { 
        state: { 
          accountId: itemId,
          accountName: item.name
        } 
      }),
    },
  ];

  return (
    <div className="chart-account-list-container">
      <div className="list-header">
        <h2>Plano de Contas</h2>
        <button 
          className="add-button"
          onClick={() => navigate('/listar-plano-contas')}
        >
          <FaPlus /> Nova Conta
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Nome da Conta:</legend>
              <input
                type="text"
                placeholder="Digite o nome da conta..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
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
                <option value="analytical">Analítico</option>
                <option value="synthetic">Sintético</option>
              </select>
            </fieldset>
          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <FaSync />
            {isLoading ? '' : ' Atualizar'}
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

      {editAccount && (
        <EditChartAccountModal
          account={editAccount}
          onClose={() => setEditAccount(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default ListChartAccounts;