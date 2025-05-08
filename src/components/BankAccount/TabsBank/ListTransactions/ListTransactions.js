import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSync, FaPlus } from 'react-icons/fa';
import api from '../../../../services/api';
import Table from '../../../Shared/Table';
import LoadingSpinner from '../../../LoadingSpinner/LoadingSpinner';
import DetailsTransactionModal from '../../Modal/DetailsTransactionModal/DetailsTransactionModal';
import { IoIosDocument } from "react-icons/io";


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
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalExits, setTotalExits] = useState(0);

  const [documentError, setDocumentError] = useState('');
  const [documentSuccess, setDocumentSuccess] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);

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

      if (!response.data || !response.data.data || !response.data.data.movements) {
        throw new Error('Resposta inválida do servidor');
      }

      const { movements, meta } = response.data.data;

      setTransactions(movements || []);
      setPagination({
        currentPage: meta.current_page,
        totalPages: meta.last_page,
        totalItems: meta.total,
        itemsPerPage: meta.per_page,
      });

      setTotalEntries(meta.total_entries || 0);
      setTotalExits(meta.total_exits || 0);

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
    { key: 'id', label: 'ID' },
    {
      key: 'chart_of_account',
      label: 'Conta',
      render: (value) => value?.name || '-'
    },
    {
      key: 'comments',
      label: 'Descrição',
      render: (value) => value || '-'
    },
    {
      key: 'date',
      label: 'Data',
      render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value) => value === 'entrada' ? 'Entrada' : 'Saída'
    },
    {
      key: 'value',
      label: 'Valor',
      render: (value, row) => (
        <span style={{
          color: row.type === 'entrada' ? '#28a745' : '#dc3545',
          fontWeight: 'bold'
        }}>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value)}
        </span>
      )
    },
    {
      key: 'receipt_url',
      label: 'Nota Fiscal',
      render: (value) => value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#213e60' }}>
          <IoIosDocument />
        </a>
      ) : '-'
    }
  ];

  const getActionItems = (itemId, item) => [
    {
      label: "Detalhar",
      action: () => setSelectedTransaction(item),
    },
    ...(item.receipt_url ? [] : [{
      label: "Anexar Documento",
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.onchange = (e) => handleDocumentUpload(e, item.id);
        input.click();
      },
    }]),
  ];

  const handleDocumentUpload = async (event, movementId) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validações do arquivo
    if (file.type !== 'application/pdf') {
      setDocumentError('Por favor, selecione apenas arquivos PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setDocumentError('O tamanho do documento deve ser menor que 5MB.');
      return;
    }

    setUploadingDocument(true);
    setDocumentError('');

    try {
      const documentData = new FormData();
      documentData.append('receipt', file);

      await api.post(`/wallet/movement/${movementId}/upload-receipt`, documentData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDocumentSuccess('Documento anexado com sucesso!');
      handleRefresh(); // Atualiza a lista após o upload

      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setDocumentSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      setDocumentError('Erro ao enviar o documento. Tente novamente.');
    } finally {
      setUploadingDocument(false);
    }
  };

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

      {documentError && (
        <div className="error-message" style={{ margin: '10px 0' }}>
          {documentError}
        </div>
      )}
      {documentSuccess && (
        <div className="success-message" style={{ margin: '10px 0' }}>
          {documentSuccess}
        </div>
      )}
      {uploadingDocument && (
        <div className="info-message" style={{ margin: '10px 0' }}>
          Enviando documento...
        </div>
      )}

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
            itemsPerPage={pagination.itemsPerPage}
          />

          <div className="totals-container" style={{
            display: 'flex',
            justifyContent: 'space-around', // Distribuir elementos uniformemente
            alignItems: 'center',
            width: '98..3%', // Ocupar toda a largura disponível
            padding: '0.75rem',
            margin: '1rem 0',
            backgroundColor: '#fff',
            borderRadius: '4px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <small>Entradas</small>
              <div style={{ color: '#28a745', marginTop: '4px' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntries)}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <small>Saídas</small>
              <div style={{ color: '#dc3545', marginTop: '4px' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExits)}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <small>Saldo</small>
              <div style={{ fontWeight: 500, marginTop: '4px' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntries + totalExits)}
              </div>
            </div>
          </div>

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