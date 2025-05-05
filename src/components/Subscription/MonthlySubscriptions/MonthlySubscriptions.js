import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSync } from 'react-icons/fa';
import api from '../../../services/api';
import Table from '../../Shared/Table';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import EditMonthlySubscriptionModal from './Modal/EditMonthlySubscriptionModal/EditMonthlySubscriptionModal';

function MonthlySubscriptions() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [message, setMessage] = useState(null);

  // Estados para filtros
  const [filterSubscriberName, setFilterSubscriberName] = useState("");
  const [filterPlanName, setFilterPlanName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterActiveStatus, setFilterActiveStatus] = useState("all");

  // Estados para paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Estados para ordenação
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        subscriber_name: filterSubscriberName,
        plan_name: filterPlanName,
        status: filterStatus,
        active_status: filterActiveStatus,
        sort_column: sortColumn,
        sort_order: sortOrder,
      };
      const response = await api.get('/monthly-subscriptions', { params });
      const mappedData = response?.data?.data?.map(item => ({
        id: item.id,
        user: {
          name: item.user?.name || '-'
        },
        status: item.status || 'pending',
        subscription_plan: {
          description: item.subscription_plan?.description || '-'
        }
      })) || [];
      
      setSubscriptions(mappedData);
      
      if (response.data.meta) {
        setPagination({
          currentPage: response.data.meta.current_page,
          totalPages: response.data.meta.last_page,
          totalItems: response.data.meta.total,
          itemsPerPage: response.data.meta.per_page,
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao carregar assinaturas mensais');
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterSubscriberName, filterPlanName, filterStatus, filterActiveStatus, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSubscriptions();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [fetchSubscriptions]);

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

  const handleChangeStatus = async (subscriptionId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/monthly-subscriptions/${subscriptionId}/status`, { status: newStatus });
      fetchSubscriptions();
      setMessage({
        type: 'success',
        text: `Status da assinatura alterado com sucesso!`
      });
    } catch (error) {
      console.error('Erro ao alterar status da assinatura:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erro ao alterar status.'
      });
    }
  };

  const columns = [
    { 
      key: 'id', 
      label: 'ID',
      sortable: true 
    },
    {
      key: 'user.name',
      label: 'Nome do Usuário',
      render: (_, row) => row.user?.name || '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => {
        switch (value) {
          case 'active': return 'Ativo';
          case 'inactive': return 'Inativo';
          case 'cancelled': return 'Cancelado';
          case 'pending': return 'Pendente';
          default: return '-';
        }
      }
    },
    { 
      key: 'subscription_plan.description', 
      label: 'Descrição do Plano',
      render: (_, row) => row.subscription_plan?.description || '-'
    }
  ];

  const getActionItems = (itemId, item) => {
    return [
      {
        label: "Editar",
        action: () => setSelectedSubscription(item),
      },
      {
        label: "Cancelar Assinatura",
        action: async () => {
          if (window.confirm('Tem certeza que deseja cancelar esta assinatura?')) {
            try {
              await api.post(`/monthly-subscriptions/${item.id}/cancel`);
              fetchSubscriptions();
              setMessage({
                type: 'success',
                text: 'Assinatura cancelada com sucesso!'
              });
            } catch (error) {
              console.error('Erro ao cancelar assinatura:', error);
              setMessage({
                type: 'error',
                text: 'Funcionalidade em desenvolvimento. Em breve você poderá cancelar assinaturas.'
              });
            }
          }
        },
      },
      {
        label: "Gerar Parcelas",
        action: async () => {
          try {
            await api.post(`/monthly-subscriptions/${item.id}/generate-installments`);
            fetchSubscriptions();
            setMessage({
              type: 'success',
              text: 'Parcelas geradas com sucesso!'
            });
          } catch (error) {
            console.error('Erro ao gerar parcelas:', error);
            setMessage({
              type: 'error',
              text: error.response?.data?.message || 'Erro ao gerar parcelas.'
            });
          }
        },
      },
      {
        label: "Pagar Parcela",
        action: async () => {
          try {
            await api.post(`/monthly-subscriptions/${item.id}/pay`);
            fetchSubscriptions();
            setMessage({
              type: 'success',
              text: 'Parcela paga com sucesso!'
            });
          } catch (error) {
            console.error('Erro ao pagar parcela:', error);
            setMessage({
              type: 'error',
              text: error.response?.data?.message || 'Erro ao realizar o pagamento da parcela.'
            });
          }
        },
      }
    ];
  };

  return (
    <div className="monthly-subscriptions-container">
      <div className="list-header">
        <h2>Assinaturas Mensais</h2>
          <button className="add-button" onClick={() => navigate('/vincular-assinatura')}>
            <FaPlus /> Nova Assinatura
          </button>
        <div className="header-buttons">
        </div>
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </fieldset>
          </div>

          <div className="switch-container">
            <label className="switch">
              <input
                type="checkbox"
                id="showInactive"
                checked={filterActiveStatus === "active"}
                onChange={(e) => setFilterActiveStatus(e.target.checked ? "active" : "inactive")}
              />
              <span className="slider round"></span>
            </label>
            <label htmlFor="showInactive">Inativo</label>
          </div>

          <button
            className="refresh-button"
            onClick={fetchSubscriptions}
            disabled={isLoading}
          >
            <FaSync />
            {isLoading ? "" : " Atualizar"}
          </button>
        </div>
      </div>

      {message && <div className={`save-message ${message.type}`}>{message.text}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Table
            data={subscriptions}
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

      {selectedSubscription && (
        <EditMonthlySubscriptionModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          onSave={() => {
            fetchSubscriptions();
            setSelectedSubscription(null);
          }}
        />
      )}

    </div>
  );
}

export default MonthlySubscriptions;