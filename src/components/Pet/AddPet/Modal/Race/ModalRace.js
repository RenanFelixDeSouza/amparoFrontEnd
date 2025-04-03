import React, { useState, useEffect, useCallback } from "react";
import api from "../../../../../services/api"; // Certifique-se de ajustar o caminho conforme necessário

function ModalRace({ isOpen, onClose, onSave }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRace, setSelectedRace] = useState(null);
  const [newRace, setNewRace] = useState("");
  const [isAddingNewRace, setIsAddingNewRace] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });

  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Atualiza as raças ao abrir o modal ou alterar a página/pesquisa
  const fetchRaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm,
      };
      const response = await api.get("/races/index", { params });
      const data = response.data.data || [];
      setRaces(data);

      setPagination((prev) => ({
        ...prev,
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
      }));
    } catch (err) {
      console.error("Erro ao buscar raças:", err);
      setError("Erro ao buscar raças. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      fetchRaces();
    }
  }, [isOpen, fetchRaces]);

  const addNewRace = async () => {
    try {
      const response = await api.post("/races/store", { description: newRace });
      setRaces((prevRaces) => [...prevRaces, response.data]);
      setNewRace("");
      setIsAddingNewRace(false);
      fetchRaces();
    } catch (error) {
      console.error("Erro ao adicionar nova raça:", error);
    }
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSelectRace = (race) => {
    setSelectedRace(race);
  };

  const handleSave = () => {
    if (selectedRace) {
      onSave(selectedRace);
      onClose();
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Selecione a Raça</h2>
          </div>
          <div className="modal-body">
            <div className="search-container">
              <input
                type="text"
                placeholder="Pesquisar raças..."
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
                {races.map((race, index) => (
                  <div
                    key={index}
                    className={`category-grid-item ${selectedRace === race ? "selected" : ""
                      }`}
                    onClick={() => handleSelectRace(race)}
                  >
                    {race.description}
                  </div>
                ))}
              </div>
            )}
            <div className="add-new-data">
              {isAddingNewRace ? (
                <div className="new-data-input">
                  <label className="new-data-label">Digite o nome da nova raça:</label>
                  <input
                    type="text"
                    placeholder="Nova raça"
                    value={newRace}
                    onChange={(e) => setNewRace(e.target.value)}
                    className="new-data-field"
                  />
                  <button
                    type="button"
                    onClick={() => addNewRace()}>
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewRace(false)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingNewRace(true)}
                  className="add-data-button"
                >
                  + Adicionar Nova Raça
                </button>
              )}
            </div>

            <div className="pagination">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
              >
                {"<<"}
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                {"<"}
              </button>
              <span>
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                {">"}
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                {">>"}
              </button>
            </div>
            <div className="modal-buttons">
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" onClick={handleSave} disabled={!selectedRace}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default ModalRace;

