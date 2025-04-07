import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import Table from "../../Shared/Table.js";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { FaSync } from "react-icons/fa";

function ListRace() {
  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [filterDescription, setFilterDescription] = useState("");

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

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        description: filterDescription,
        sort_column: sortColumn,
        sort_order: sortOrder,
      };
      const response = await api.get("/races/index", { params });
      const data = response.data.data || [];
      setRaces(data);

      setPagination({
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
        itemsPerPage: response.data.meta.per_page,
      });
    } catch (error) {
      console.error("Erro ao buscar raças:", error);
      setError("Erro ao atualizar a tabela.");
    } finally {
      setIsLoading(false);
    }
  }, [ filterDescription, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

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
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
    setPagination({ ...pagination, currentPage: 1 });
  };

  const columns = [
    { key: "id", label: "ID", type: "number" },
    { key: "description", label: "Descrição", type: "text" },
  ];

  return (
    <div>
      <h2>Lista de Raças</h2>

      {isLoading && <LoadingSpinner />}

      <div className="header-container">
        <div className="filters-container">

          <div className="filter-group">
            <fieldset>
              <legend>Descrição:</legend>
              <input
                type="text"
                placeholder="Digite uma Descrição..."
                id="filter-description"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
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

      {error && <div className="error-message">{error}</div>}

      {!isLoading && (
        <Table
          data={races}
          columns={columns}
          itemsPerPage={pagination.itemsPerPage}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
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

export default ListRace;