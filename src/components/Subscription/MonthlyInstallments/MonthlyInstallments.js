import React, { useState, useEffect, useCallback } from 'react';
import { FaSync } from 'react-icons/fa';
import api from '../../../services/api';
import Table from '../../Shared/Table';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import PayInstallmentModal from './Modal/PayInstallmentModal';

function MonthlyInstallments() {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);

  // Estados para filtros
  const [filterSubscriberName, setFilterSubscriberName] = useState("");
  const [filterPlanName, setFilterPlanName] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");

  // Estados para paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });

  // Estados para ordenação
  const [sortColumn, setSortColumn] = useState("due_date");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchInstallments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: parseInt(pagination.currentPage) || 1,
        per_page: parseInt(pagination.itemsPerPage) || 5,
        subscriber_name: filterSubscriberName || undefined,
        plan_name: filterPlanName || undefined,
        payment_status: filterPaymentStatus || undefined,
        sort_column: sortColumn || 'due_date',
        sort_order: sortOrder || 'asc',
      };

      // Remove undefined values
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );

      const response = await api.get('/financial/installments', { params });
      
      setInstallments(response?.data?.data || []);
      setPagination(prev => ({
        ...prev,
        currentPage: parseInt(response.data.meta.current_page) || 1,
        totalPages: parseInt(response.data.meta.last_page) || 1,
        totalItems: parseInt(response.data.meta.total) || 0,
        itemsPerPage: parseInt(response.data.meta.per_page) || 5,
      }));
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao carregar parcelas');
    } finally {
      setLoading(false);
    }
  }, [filterSubscriberName, filterPlanName, filterPaymentStatus, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInstallments();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [fetchInstallments]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: parseInt(page) || 1
    }));
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = Number(event.target.value);
    setPagination({
      ...pagination,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    });
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'paid':
        return { 
          color: '#28a745', 
          fontWeight: 'bold',
          backgroundColor: '#d4edda',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        };
      case 'pending':
        return { 
          color: '#ffc107',
          fontWeight: 'bold',
          backgroundColor: '#fff3cd',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        };
      case 'overdue':
        return { 
          color: '#dc3545',
          fontWeight: 'bold',
          backgroundColor: '#f8d7da',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        };
      default:
        return {};
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => value || '-'
    },
    { 
      key: 'current_installment', 
      label: 'Parcela',
      render: (_, row) => `${row.current_installment}/${row.total_installments}`
    },
    { 
      key: 'subscriber_name', 
      label: 'Assinante',
      render: (value) => value || '-'
    },
    { 
      key: 'plan_name', 
      label: 'Plano',
      render: (value) => value || '-'
    },
    { 
      key: 'installment_value', 
      label: 'Valor',
      render: (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },
    { 
      key: 'due_date', 
      label: 'Data Vencimento',
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    },
    { 
      key: 'payment_date', 
      label: 'Data Pagamento',
      render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => {
        const statusText = {
          'pending': 'Pendente',
          'paid': 'Pago',
          'overdue': 'Atrasado'
        }[value] || value;
        
        return <span style={getStatusStyle(value)}>{statusText}</span>;
      }
    }
  ];

  const getActionItems = (itemId, item) => {
    if (item.status === 'paid') return [];
    
    return [
      {
        label: "Registrar Pagamento",
        action: () => setSelectedInstallment(item),
      }
    ];
  };

  return (
    <div className="monthly-installments-container">
      <div className="list-header">
        <h2>Parcelas</h2>
      </div>

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Assinante:</legend>
              <input
                type="text"
                placeholder="Digite o nome do assinante..."
                value={filterSubscriberName}
                onChange={(e) => setFilterSubscriberName(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Plano:</legend>
              <input
                type="text"
                placeholder="Digite o nome do plano..."
                value={filterPlanName}
                onChange={(e) => setFilterPlanName(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Status:</legend>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Atrasado</option>
              </select>
            </fieldset>
          </div>

          <button
            className="refresh-button"
            onClick={fetchInstallments}
            disabled={loading}
          >
            <FaSync />
            {loading ? "" : " Atualizar"}
          </button>
        </div>
      </div>

      {message && <div className={`save-message ${message.type}`}>{message.text}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Table
            data={installments}
            columns={columns}
            getActionItems={getActionItems}
            handleSort={handleSort}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
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
            <span>
              Página {pagination.currentPage} de {pagination.totalPages || 1}
            </span>
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

      {selectedInstallment && (
        <PayInstallmentModal
          installment={selectedInstallment}
          onClose={() => setSelectedInstallment(null)}
          onSuccess={() => {
            fetchInstallments();
            setSelectedInstallment(null);
            setMessage({
              type: 'success',
              text: 'Pagamento registrado com sucesso!'
            });
          }}
        />
      )}
    </div>
  );
}

export default MonthlyInstallments;