import React, { useState, useEffect, useCallback } from "react";
import api from "../../../../../services/api";

/**
 * Modal para selecionar ou buscar espécies.
 * Permite a pesquisa, paginação e seleção de uma espécie.
 * 
 * @param {boolean} isOpen - Indica se o modal está aberto.
 * @param {function} onClose - Função para fechar o modal.
 * @param {function} onSave - Função para salvar a espécie selecionada.
 */
function ModalSpecie({ isOpen, onClose, onSave }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecie, setSelectedSpecie] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });
  const [species, setSpecies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Busca as espécies com base no termo de pesquisa e paginação.
   */
  const fetchSpecies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm,
      };
      const response = await api.get("/species/index", { params });
      const data = response.data.data || [];
      setSpecies(data);

      setPagination((prev) => ({
        ...prev,
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
      }));
    } catch (err) {
      setError("Erro ao buscar espécies. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      fetchSpecies();
    }
  }, [isOpen, fetchSpecies]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSelectSpecie = (specie) => {
    setSelectedSpecie(specie);
  };

  const handleSave = () => {
    if (selectedSpecie) {
      onSave(selectedSpecie);
      onClose();
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Selecione a Espécie</h2>
          </div>
          <div className="modal-body">
            <div className="search-container">
              <input
                type="text"
                placeholder="Pesquisar espécies..."
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
                {species.map((specie, index) => (
                  <div
                    key={index}
                    className={`category-grid-item ${selectedSpecie === specie ? "selected" : ""}`}
                    onClick={() => handleSelectSpecie(specie)}
                  >
                    {specie.description}
                  </div>
                ))}
              </div>
            )}
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
              <button type="button" onClick={handleSave} disabled={!selectedSpecie}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default ModalSpecie;