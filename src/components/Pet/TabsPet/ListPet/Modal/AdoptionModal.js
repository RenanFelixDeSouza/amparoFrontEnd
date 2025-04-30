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

function AdoptionModal({ pet, onClose, onSave }) {
  const [adoptUsers, setAdoptUsers] = useState([]);
  const [responsibleUsers, setResponsibleUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [responsibleUser, setResponsibleUser] = useState(null);
  const [responsibleSearchTerm, setResponsibleSearchTerm] = useState("");
  const [adoptionDate, setAdoptionDate] = useState("");
  const [error, setError] = useState("");
  const [isLoadingAdopt, setIsLoadingAdopt] = useState(false);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedResponsibleSearchTerm = useDebounce(responsibleSearchTerm, 500);

  const fetchAdoptUsers = useCallback(async (term) => {
    setIsLoadingAdopt(true);
    try {
      const response = await api.get("/users/index", { params: { search: term } });
      setAdoptUsers(response.data.data || []);
      setError(""); // Limpa o erro quando a pesquisa é bem-sucedida
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError("Erro ao carregar a lista de usuários.");
    } finally {
      setIsLoadingAdopt(false);
    }
  }, []);

  const fetchResponsibleUsers = useCallback(async (term) => {
    setIsLoadingResponsible(true);
    try {
      const response = await api.get("/users/index", { params: { search: term } });
      setResponsibleUsers(response.data.data || []);
      setError(""); // Limpa o erro quando a pesquisa é bem-sucedida
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
      setError("Erro ao carregar a lista de responsáveis.");
    } finally {
      setIsLoadingResponsible(false);
    }
  }, []);

  useEffect(() => {
    fetchAdoptUsers(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchAdoptUsers]);

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
      setError(error.response?.data?.message || "Erro ao realizar a adoção. Tente novamente.");
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
        <div className="modal-header">
          <h2>Atribuir Adoção</h2>
        </div>
        {error && <div className="error-message">{error}</div>}

        <h3 className="section-title">Informações do Adotante</h3>
        <div className="search-container">
          <label>Usuário que vai adotar:</label>
          <input
            type="text"
            placeholder="Pesquisar usuários..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {isLoadingAdopt ? (
            <p>Carregando...</p>
          ) : (
            <>
              {adoptUsers.length > 0 ? (
                <div className="categories-grid">
                  {adoptUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`category-grid-item ${selectedUser?.id === user.id ? "selected" : ""}`}
                      onClick={() => handleSelectUser(user)}
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
          <label>Responsável pela adoção:</label>
          <input
            type="text"
            placeholder="Pesquisar responsáveis..."
            value={responsibleSearchTerm}
            onChange={handleResponsibleSearchChange}
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
                      onClick={() => handleSelectResponsible(user)}
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
          <label>Data de Adoção:</label>
          <input
            type="date"
            value={adoptionDate}
            onChange={(e) => setAdoptionDate(e.target.value)}
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

export default AdoptionModal;