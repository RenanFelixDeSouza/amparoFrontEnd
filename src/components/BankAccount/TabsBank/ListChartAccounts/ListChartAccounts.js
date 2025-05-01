import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaSync, FaPlus } from 'react-icons/fa';
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
  const [filterBankAccount, setFilterBankAccount] = useState('');
  const [sortColumn, setSortColumn] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
        name: filterName,
        type: filterType,
        wallet_id: filterBankAccount,
        sort_column: sortColumn,
        sort_order: sortOrder,
        page: currentPage
      };
      const response = await api.get('/chart-accounts/index', { params });
      // Garantindo que response.data.data é um array
      setAccounts(Array.isArray(response.data.data) ? response.data.data : []);
      setCurrentPage(response.data.meta.current_page);
      setTotalPages(response.data.meta.last_page);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      setError('Erro ao carregar plano de contas');
    } finally {
      setIsLoading(false);
    }
  }, [filterName, filterType, filterBankAccount, sortColumn, sortOrder, currentPage]);

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
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSaveEdit = () => {
    handleRefresh();
    setEditAccount(null);
  };

  const columns = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'name', label: 'Nome da Conta', type: 'text' },
    { key: 'type', label: 'Tipo', type: 'text',
      render: (value) => value === 'analytical' ? 'Analítico' : 'Sintético'
    },
    {
      key: 'total_value',
      label: 'Valor Total',
      type: 'number',
      render: (value) => value ? formatCurrency(value) : '-',
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