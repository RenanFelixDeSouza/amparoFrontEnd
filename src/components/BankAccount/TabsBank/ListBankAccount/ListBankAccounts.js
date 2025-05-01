import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaSync, FaPlus } from 'react-icons/fa';
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
  
  // Estados de paginação
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
        bank_name: filterBank,
        account_type: filterType,
        sort_column: sortColumn,
        sort_order: sortOrder,
        page: currentPage
      };
      const response = await api.get('/wallets/index', { params });
      setAccounts(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
      setTotalItems(response.data.total);
    } catch (error) {
      setError('Erro ao carregar contas bancárias');
    } finally {
      setIsLoading(false);
    }
  }, [filterBank, filterType, sortColumn, sortOrder, currentPage]);

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

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await api.delete(`/bank-accounts/${id}`);
        handleRefresh();
      } catch (error) {
        setError('Erro ao excluir conta bancária');
      }
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
    { key: 'bank_name', label: 'Nome do Banco', type: 'text' },
    { key: 'agency', label: 'Agência', type: 'text' },
    { key: 'account_number', label: 'Número da Conta', type: 'text' },
    { key: 'account_type', label: 'Tipo de Conta', type: 'text' },
    {
      key: 'total_value',
      label: 'Saldo Total',
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
      action: () => navigate('/movimentacoes', { 
        state: { 
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