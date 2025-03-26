/**
 * Componente ListUsers
 * Gerencia listagem e ações em usuários
 */

import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import Table from "../../Shared/Table.js";
import EditUserModal from "./Modal/EditUserModal/EditUserModal";
import RemoveCategoriesModal from "./Modal/RemoveCategoriesModal/RemoveCategoriesModal.js";
import AddWorkshopsModal from "./Modal/AddCategoryModal/AddCategoryModal.js";
import ChangePasswordModal from "./Modal/ChangePasswordModal/ChangePasswordModal";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { FaSync } from "react-icons/fa";

function ListUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Estados para os filtros
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterType, setFilterType] = useState("");

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

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changingPasswordForUser, setChangingPasswordForUser] = useState(null);

  const [isAddWorkshopsModalOpen, setIsAddWorkshopsModalOpen] = useState(false);
  const [isRemoveCategoriesModalOpen, setIsRemoveCategoriesModalOpen] = useState(false);
  const [selectedUserForWorkshops, setSelectedUserForWorkshops] = useState(null);

  const [message, setMessage] = useState(null);

  const handleEdit = (userId) => {
    const userToEdit = users.find((user) => user.id === userId);
    setEditingUser(userToEdit);
    setIsModalOpen(true);
  };

  const handleChangePassword = (userId) => {
    const userToChangePassword = users.find((user) => user.id === userId);
    setChangingPasswordForUser(userToChangePassword);
    setIsChangePasswordModalOpen(true);
  };

  const handleAddWorkshops = (userId) => {
    const user = users.find((user) => user.id === userId);
    setSelectedUserForWorkshops(user);
    setIsAddWorkshopsModalOpen(true);
  };

  const handleRemoveWorkshops = (userId) => {
    const user = users.find((user) => user.id === userId);
    setSelectedUserForWorkshops(user);
    setIsRemoveCategoriesModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setChangingPasswordForUser(null);
  };

  const handleSaveModal = async (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
    handleRefresh();
  };

  const handlePasswordChanged = (userId) => {
    console.log(`Senha alterada para o usuário com ID ${userId}`);
  };

  const handleDisableUser = async (userId, is_active) => {
    try {
      const userToDisable = users.find(user => user.id === userId);

      if (userToDisable.type === 'admin') {
        setMessage({
          type: 'error',
          text: 'Administradores não podem ser desativados.'
        });
        return;
      }
      await api.patch(`/user/${userId}/disable`, {
        is_active: !is_active,
      });

      handleRefresh();
      setMessage({
        type: 'success',
        text: `Usuário ${userToDisable.name} foi ${!is_active ? 'ativado' : 'desativado'} com sucesso!`
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
      const withDeleted = showDeleted ? "true" : "false";
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        with_deleted: withDeleted,
        name: filterName,
        email: filterEmail,
        type: filterType,
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
      setError("Erro ao atualizar a tabela.");
    } finally {
      setIsLoading(false);
    }
  }, [showDeleted, filterName, filterEmail, filterType, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

  const handleActionClick = (action, itemId, event) => {
    if (event) {
      event.stopPropagation();
    }
    if (action === 'edit') {
      handleEdit(itemId);
    } else if (action === 'restore') {
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
    { key: 'name', label: 'Nome', type: 'text' },
    { key: 'type', label: 'Tipo', type: 'text' },
    {
      key: 'categories',
      label: 'Categoria',
      type: 'text',
      render: (value) => {
        if (!value) return ''; 
        return Array.isArray(value) ? value.map((category) => category.name).join(', ') : '';
      },
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
    const actions = [
      { label: 'Editar', action: () => handleEdit(itemId) },
      { label: 'Alterar Senha', action: () => handleChangePassword(itemId) },
    ];

    if (item.type === 'professor') {
      actions.push(
        { label: 'Adicionar Oficinas', action: () => handleAddWorkshops(itemId) },
        { label: 'Remover Oficinas', action: () => handleRemoveWorkshops(itemId) }
      );
    }

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
                <option value="">Tipo</option>
                <option value="admin">Admin</option>
                <option value="professor">Professor</option>
              </select>
            </fieldset>
          </div>

          <div className="switch-container">
            <label className="switch">
              <input
                type="checkbox"
                id="showDeleted"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
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
          onEdit={handleEdit}
          onRestore={handleRestore}
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

      {/* Renderiza o modal de edição de usuário */}
      {isModalOpen && (
        <EditUserModal
          user={editingUser}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}

      {/* Renderiza o modal de alteração de senha */}
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          user={changingPasswordForUser}
          onClose={handleCloseChangePasswordModal}
          onPasswordChanged={handlePasswordChanged}
        />
      )}

      {isAddWorkshopsModalOpen && (
        <AddWorkshopsModal
          user={selectedUserForWorkshops}
          onClose={() => {
            setIsAddWorkshopsModalOpen(false);
            setSelectedUserForWorkshops(null);
          }}
          onSave={handleRefresh}
        />
      )}

      {isRemoveCategoriesModalOpen && (
        <RemoveCategoriesModal
          user={selectedUserForWorkshops}
          onClose={() => {
            setIsRemoveCategoriesModalOpen(false);
            setSelectedUserForWorkshops(null);
          }}
          onSave={handleRefresh}
        />
      )}
    </div>
  );
}

export default ListUsers;