import React, { useState, useEffect, useCallback } from "react";
import api from "../../../../../services/api";

function AdoptionModal({ pet, onClose, onSave }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [responsibleUser, setResponsibleUser] = useState(null);
  const [responsibleSearchTerm, setResponsibleSearchTerm] = useState("");
  const [adoptionDate, setAdoptionDate] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async (searchTerm, setFunction) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/users/index", { params: { search: searchTerm } });
      setFunction(response.data.data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError("Erro ao carregar a lista de usuários.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(searchTerm, setUsers);
  }, [searchTerm, fetchUsers]);

  const handleSubmit = async () => {
    if (!selectedUser || !responsibleUser) {
      setError("Selecione o usuário que vai adotar e o responsável pela adoção.");
      return;
    }

    try {
      await api.post(`/pets/${pet.id}/adopt`, {
        user_id: selectedUser.id,
        responsible_id: responsibleUser.id,
        date: adoptionDate,
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao realizar adoção:", error);
      setError("Erro ao realizar a adoção. Tente novamente.");
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

  const handleResponsibleSearchChange = (e) => {
    setResponsibleSearchTerm(e.target.value);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleSelectResponsible = (user) => {
    setResponsibleUser(user);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2>Atribuir Adoção</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="search-container">
          <label>Usuário que vai adotar:</label>
          <input
            type="text"
            placeholder="Pesquisar usuários..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {isLoading ? (
            <p>Carregando...</p>
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
        </div>
        <div className="search-container">
          <label>Responsável pela adoção:</label>
          <input
            type="text"
            placeholder="Pesquisar responsáveis..."
            value={responsibleSearchTerm}
            onChange={handleResponsibleSearchChange}
            className="search-input"
          />
          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            <div className="categories-grid">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`category-grid-item ${responsibleUser?.id === user.id ? "selected" : ""}`}
                  onClick={() => handleSelectResponsible(user)}
                >
                  {user.user_name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Data de Adoção:</label>
          <input
            type="date"
            value={adoptionDate}
            onChange={(e) => setAdoptionDate(e.target.value)}
          />
        </div>
        <div className="modal-buttons">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit} disabled={!selectedUser || !responsibleUser}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdoptionModal;