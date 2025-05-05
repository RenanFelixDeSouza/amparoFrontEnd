import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSync, FaPlus } from 'react-icons/fa';
import api from '../../../services/api';
import Table from '../../Shared/Table';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import EditSubscriptionPlanModal from './Modal/EditSubscriptionPlanModal/EditSubscriptionPlanModal';

function ListSubscriptionPlans() {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Estados para filtros
  const [filterName, setFilterName] = useState("");
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

  const fetchSubscriptionPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        name: filterName,
        active_status: filterActiveStatus,
        sort_column: sortColumn,
        sort_order: sortOrder,
      };
      const response = await api.get('/subscription-plans', { params });
      setSubscriptionPlans(Array.isArray(response?.data?.data) ? response.data.data : []);
      
      if (response.data.meta) {
        setPagination({
          currentPage: response.data.meta.current_page,
          totalPages: response.data.meta.last_page,
          totalItems: response.data.meta.total,
          itemsPerPage: response.data.meta.per_page,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      setError('Erro ao carregar planos de assinatura');
      setSubscriptionPlans([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filterName, filterActiveStatus, sortColumn, sortOrder]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSubscriptionPlans();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [fetchSubscriptionPlans]);

  const handleAddClick = () => {
    navigate('/nova-assinatura');
  };

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

  const getActionItems = (itemId, item) => {
    return [
      {
        label: "Editar",
        action: () => setSelectedPlan(item),
      }
    ];
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { 
      key: 'value', 
      label: 'Valor',
      render: (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    },
    { 
      key: 'duration_months', 
      label: 'Duração (meses)',
      render: (value) => value === null ? 'Indefinido' : value
    },
    { key: 'description', label: 'Descrição' },
    { 
      key: 'created_at', 
      label: 'Data Criação',
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    }
  ];

  return (
    <div>
      <div className="list-header">
        <h2>Planos de Assinatura</h2>
        <div className="header-buttons">
          <button className="add-button" onClick={handleAddClick}>
            <FaPlus /> Novo Plano
          </button>
        </div>
      </div>

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Nome:</legend>
              <input
                type="text"
                placeholder="Digite um nome..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </fieldset>
          </div>

          <button
            className="refresh-button"
            onClick={fetchSubscriptionPlans}
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
            data={subscriptionPlans}
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

      {selectedPlan && (
        <EditSubscriptionPlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSave={() => {
            fetchSubscriptionPlans();
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
}

export default ListSubscriptionPlans;