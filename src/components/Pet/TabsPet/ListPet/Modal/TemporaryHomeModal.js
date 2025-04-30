import React, { useState, useEffect, useCallback } from "react";
import api from "../../../../../services/api";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function TemporaryHomeModal({ pet, onClose, onSave }) {
  const [users, setUsers] = useState([]);
  const [responsibleUsers, setResponsibleUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [responsibleSearchTerm, setResponsibleSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [responsibleUser, setResponsibleUser] = useState(null);
  const [temporaryHomeDate, setTemporaryHomeDate] = useState("");
  const [error, setError] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedResponsibleSearchTerm = useDebounce(responsibleSearchTerm, 500);

  const fetchUsers = useCallback(async (term) => {
    setIsLoadingUsers(true);
    try {
      const response = await api.get("/users/index", { params: { search: term } });
      setUsers(response.data.data || []);
      setError("");
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError("Erro ao carregar a lista de usuários.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchResponsibleUsers = useCallback(async (term) => {
    setIsLoadingResponsible(true);
    try {
      const response = await api.get("/users/index", { params: { search: term } });
      setResponsibleUsers(response.data.data || []);
      setError("");
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
      setError("Erro ao carregar a lista de responsáveis.");
    } finally {
      setIsLoadingResponsible(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchUsers]);

  useEffect(() => {
    fetchResponsibleUsers(debouncedResponsibleSearchTerm);
  }, [debouncedResponsibleSearchTerm, fetchResponsibleUsers]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedUser || !responsibleUser) {
      setError("Selecione o usuário do lar temporário e o responsável.");
      return;
    }

    try {
      await api.post(`/pets/${pet.id}/temporary-home`, {
        user_id: selectedUser.id,
        responsible_id: responsibleUser.id,
        date: temporaryHomeDate
      });
      onSave();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Erro ao atribuir lar temporário. Tente novamente.");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Atribuir Lar Temporário</h2>
        </div>
        {error && <div className="error-message">{error}</div>}

        <h3 className="section-title">Informações do Lar Temporário</h3>
        <div className="search-container">
          <label>Usuário que vai dar lar temporário:</label>
          <input
            type="text"
            placeholder="Pesquisar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {isLoadingUsers ? (
            <p>Carregando...</p>
          ) : (
            <>
              {users.length > 0 ? (
                <div className="categories-grid">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`category-grid-item ${selectedUser?.id === user.id ? "selected" : ""}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.user_name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>Nenhum usuário encontrado.</p>
                </div>
              )}
            </>
          )}
        </div>

        <hr className="modal-divider" />

        <h3 className="section-title">Informações do Responsável</h3>
        <div className="search-container">
          <label>Responsável pelo lar temporário:</label>
          <input
            type="text"
            placeholder="Pesquisar responsáveis..."
            value={responsibleSearchTerm}
            onChange={(e) => setResponsibleSearchTerm(e.target.value)}
            className="search-input"
          />
          {isLoadingResponsible ? (
            <p>Carregando...</p>
          ) : (
            <>
              {responsibleUsers.length > 0 ? (
                <div className="categories-grid">
                  {responsibleUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`category-grid-item ${responsibleUser?.id === user.id ? "selected" : ""}`}
                      onClick={() => setResponsibleUser(user)}
                    >
                      {user.user_name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>Nenhum responsável encontrado.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="date-group">
          <label>Data de Início:</label>
          <input
            type="date"
            value={temporaryHomeDate}
            onChange={(e) => setTemporaryHomeDate(e.target.value)}
            className="date-input"
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

export default TemporaryHomeModal;