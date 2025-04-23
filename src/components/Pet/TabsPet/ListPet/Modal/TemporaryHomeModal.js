import React, { useState, useEffect, useCallback } from "react";
import api from "../../../../../services/api";

function TemporaryHomeModal({ pet, onClose, onSave }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/users/index", { params: { search: searchTerm } });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError("Erro ao carregar a lista de usuários.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError("Selecione um usuário para o lar temporário.");
      return;
    }

    try {
      await api.post(`/pets/${pet.id}/temporary-home`, { user_id: selectedUser.id });
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao atribuir lar temporário:", error);
      setError("Erro ao atribuir lar temporário. Tente novamente.");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2>Atribuir Lar Temporário</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="search-container">
          <input
            type="text"
            placeholder="Pesquisar usuários..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        {isLoading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="categories-grid">
            {users.map((user) => (
              <div
                key={user.id}
                className={`category-grid-item ${selectedUser?.id === user.id ? "selected" : ""}`}
                onClick={() => handleSelectUser(user)}
              >
                {user.user_name}
              </div>
            ))}
          </div>
        )}
        <div className="modal-buttons">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit} disabled={!selectedUser}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemporaryHomeModal;