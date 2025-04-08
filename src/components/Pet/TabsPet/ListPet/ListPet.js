import React, { useState, useEffect, useCallback } from "react";
import api from "../../../../services/api";
import Table from "../../../Shared/Table.js";
import LoadingSpinner from "../../../LoadingSpinner/LoadingSpinner";
import DetailsPetModal from "./Modal/DetailsPetModal.js";
import EditPetModal from "./Modal/EditPetModal";
import { FaPaw, FaSync } from "react-icons/fa";

function ListPet() {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editPet, setEditPet] = useState(null);

  // Estados para filtros
  const [filterName, setFilterName] = useState("");
  const [filterSpecie, setFilterSpecie] = useState("");
  const [filterRace, setFilterRace] = useState("");

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


  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /**
   * Atualiza a lista de pets com filtros aplicados.
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
        specie: filterSpecie,
        race: filterRace,
        sort_column: sortColumn,
        sort_order: sortOrder,
      };
      const response = await api.get("/pets/index", { params });
      const data = response.data.data || [];
      setPets(data);

      setPagination({
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
        itemsPerPage: response.data.meta.per_page,
      });
    } catch (error) {
      console.error("Erro ao buscar pets:", error);
      setError("Erro ao atualizar a tabela.");
    } finally {
      setIsLoading(false);
    }
  }, [filterName, filterSpecie, filterRace, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleRefresh();
    }, 500); 
  
    return () => clearTimeout(delayDebounce); 
  }, [ handleRefresh, filterName, filterSpecie, filterRace, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

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
    const columnDefinition = columns.find(c => c.key === column);
    if (columnDefinition && columnDefinition.sortable !== false) {
      if (sortColumn === column) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortOrder("asc");
      }
      setPagination({ ...pagination, currentPage: 1 });
    }
  };

  const handleSaveEdit = () => {
    handleRefresh();
    setEditPet(null);
  };

  const handleCloseEditModal = () => {
    setEditPet(null);
    handleRefresh(); 
  };

  // Defina as colunas da tabela
  const columns = [
    { key: "id", label: "ID", type: "number" },
    {
      key: "photo_url",
      label: "Foto",
      sortable: false,
      align: "center",
      render: (value, item) =>
        value ? (
          <img
            src={value}
            alt="Foto do Pet"
            style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" }}
            onClick={() => setSelectedPet(item)}
          />
        ) : (
          <div
            style={{
              backgroundColor: "#e68c3a",
              cursor: "pointer",
              borderRadius: "50%", 
              width: "50px", 
              height: "50px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto", 
            }}
            onClick={() => setSelectedPet(item)}
          >
            <FaPaw size={24} color="#fff" />
          </div>
        ),
    },
    { key: "name", label: "Nome", type: "text" },
    { key: "specie", label: "Espécie", type: "text" },
    { key: "race", label: "Raça", type: "text" },
    {
      key: "birth_date", label: "Data de nascimento",
      type: "date",
      render: (value) => formatDate(value),

    },
    {
      key: "adoptions",
      label: "Disponível para Adoção",
      align: "center",
      render: (value) => (
        <span style={{ color: value ? "red" : "green" }}>
          {value ? "Não" : "Sim"}
        </span>
      ),
    },
    {
      key: "is_castrated",
      label: "Castrado",
      align: "center",
      render: (value) => (
        <input type="checkbox" checked={!!value} readOnly disabled />
      ),
    },
  ];

  /**
   * Função para gerar ações para cada linha da tabela.
   */
  const getActionItems = (itemId, item) => {
    return [
      {
        label: "detalhar",
        action: () => setSelectedPet(item),
      },
      {
        label: "Editar",
        action: () => setEditPet(item),
      },
    ];
  };

  return (
    <div >
      <h2>Lista de Pets</h2>


      {isLoading && <LoadingSpinner />}

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Nome:</legend>
              <input
                type="text"
                placeholder="Digite um Nome..."
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Espécie:</legend>
              <input
                type="text"
                placeholder="Digite uma Espécie..."
                id="filter-specie"
                value={filterSpecie}
                onChange={(e) => setFilterSpecie(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Raça:</legend>
              <input
                type="text"
                placeholder="Digite uma Raça..."
                id="filter-race"
                value={filterRace}
                onChange={(e) => setFilterRace(e.target.value)}
              />
            </fieldset>
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
      {message && <div className={`save-message ${message.type}`}>{message.text}</div>}
      {error && <div className="error-message">{error}</div>}

      {!isLoading && (
        <Table
          data={pets}
          columns={columns}
          itemsPerPage={pagination.itemsPerPage}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          getActionItems={getActionItems} 
        />
      )}

      {/* Modal para exibir detalhes do pet */}
      <DetailsPetModal pet={selectedPet} onClose={() => setSelectedPet(null)} />

      {editPet && (
        <EditPetModal
          pet={editPet}
          onClose={handleCloseEditModal} 
          onSave={handleSaveEdit}
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

export default ListPet;
