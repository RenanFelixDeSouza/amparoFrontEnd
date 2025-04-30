/**
 * Componente ListUsers
 * Gerencia listagem e ações em usuários
 */

import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import Table from "../../Shared/Table.js";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { FaSync } from "react-icons/fa";
import './ListUser.css';
import Cookies from 'js-cookie';

function ListUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Estados para os filtros
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterActiveStatus, setFilterActiveStatus] = useState("all");

  // Estados para paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Estados para ordenação
  const [sortColumn, setSortColumn] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleDisableUser = async (userId, is_active) => {
    try {
      const userToDisable = users.find(user => user.id === userId);
      const loggedUserId = parseInt(Cookies.get('userId'));

      if (userToDisable.type === 'admin') {
        setMessage({
          type: 'error',
          text: 'Administradores não podem ser desativados.'
        });
        return;
      }

      if (userId === loggedUserId) {
        setMessage({
          type: 'error',
          text: 'Você não pode desativar seu próprio usuário.'
        });
        return;
      }

      const endpoint = is_active ? `/user/${userId}/inactive` : `/user/${userId}/active`;
      await api.put(endpoint);

      handleRefresh();
      setMessage({
        type: 'success',
        text: `Usuário ${userToDisable.user_name} foi ${!is_active ? 'ativado' : 'inativado'} com sucesso!`
      });

    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erro ao alterar status do usuário. Por favor, tente novamente.'
      });
    }
  };

  const handleRestore = async (userId) => {
    try {
      const response = await api.post(`/user/${userId}/restore`);
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, deleted_at: null } : user
          )
        );
        setMessage({
          type: 'success',
          text: 'Usuário restaurado com sucesso!'
        });
      } else {
        throw new Error("Erro ao restaurar o usuário.");
      }
    } catch (error) {
      console.error("Erro ao restaurar usuário:", error);
      setMessage({
        type: 'error',
        text: 'Erro ao restaurar o usuário. Por favor, tente novamente.'
      });
    }
  };

  /**
   * Busca usuários com filtros aplicados
   */
  const handleRefresh = useCallback(async () => {
    setMessage(null);
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        name: filterName,
        email: filterEmail,
        type: filterType,
        active_status: filterActiveStatus,
        sort_column: sortColumn,
        sort_order: sortOrder,
      };
      const response = await api.get('/users/index', { params });
      const data = response.data.data || [];
      setUsers(data);

      setPagination({
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
        itemsPerPage: response.data.meta.per_page,
      });

    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError(error.response?.data?.message || "Erro ao atualizar a tabela.");
    } finally {
      setIsLoading(false);
    }
  }, [filterName, filterEmail, filterType, filterActiveStatus, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

  const handleActionClick = (action, itemId, event) => {
    if (event) {
      event.stopPropagation();
    }
    if (action === 'restore') {
      handleRestore(itemId);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
    setPagination({ ...pagination, currentPage: 1 });
  };

  // Defina as colunas da tabela
  const columns = [
    { key: 'id', label: 'ID', type: 'number' },
    {
      key: 'photo_url',
      label: 'Foto',
      sortable: false,
      align: 'center',
      render: (value, item) =>
        value ? (
          <img
            src={value}
            alt="Foto do Usuário"
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          <div
            style={{
              backgroundColor: '#e68c3a',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            {item.user_name?.charAt(0).toUpperCase() || '?'}
          </div>
        ),
    },
    { key: 'user_name', label: 'Nome', type: 'text' },
    {
      key: 'type',
      label: 'Tipo',
      type: 'text',
      render: (value) => value?.description || '-'
    },
    {
      key: "is_active",
      label: "Ativo",
      render: (value, item) => (
        <input
          type="checkbox"
          checked={!!value}
          readOnly
          disabled
          title={item.name}
        />
      )
    },
  ];

  /**
   * Gerencia ações dos usuários
   */
  const getActionItems = (itemId, item) => {
    const actions = [];

    if (item.type !== 'admin') {
      actions.push({
        label: item.is_active ? 'Desativar' : 'Ativar',
        action: () => handleDisableUser(itemId, item.is_active),
      });
    }

    if (item.deleted_at) {
      actions.push({ label: 'Restaurar', action: () => handleRestore(itemId) });
    }

    return actions;
  };

  return (
    <div className="users-list-container">
      <h2>Lista de Usuários</h2>

      {message && (
        <div className={`save-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {isLoading && <LoadingSpinner />}
      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Nome:</legend>
              <input
                type="text"
                placeholder="Nome"
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Email:</legend>
              <input
                type="text"
                id="filter-email"
                placeholder="Email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Tipo:</legend>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="master">Master</option>
                <option value="admin">Admin</option>
                <option value="basic">Basic</option>
              </select>
            </fieldset>
          </div>

          <div className="switch-container">
            <label className="switch">
              <input
                type="checkbox"
                id="showDeleted"
                checked={filterActiveStatus === "active"}
                onChange={(e) => setFilterActiveStatus(e.target.checked ? "active" : "inactive")}
              />
              <span className="slider round"></span>
            </label>
            <label htmlFor="showDeleted">Inativo</label>
          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <FaSync />
            {isLoading ? "" : "   Atualizar Tabela"}
          </button>
        </div>
      </div>
      {!isLoading && (
        <Table
          data={users}
          columns={columns}
          itemsPerPage={pagination.itemsPerPage}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onAction={handleActionClick}
          isSortable={true}
          showDeletedToggle={true}
          loading={isLoading}
          error={error}
          refresh={handleRefresh}
          getActionItems={getActionItems}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
        />
      )}

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
    </div>
  );
}

export default ListUsers;