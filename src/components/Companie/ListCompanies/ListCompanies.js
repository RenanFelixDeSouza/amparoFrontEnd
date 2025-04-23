import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import Table from "../../Shared/Table.js";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import {  FaSync } from "react-icons/fa";

function ListCompanies() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Estados para filtros
  const [filterCompanyName, setFilterCompanyName] = useState("");
  const [filterFantasyName, setFilterFantasyName] = useState("");
  const [filterCnpj, setFilterCnpj] = useState("");

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

  /**
   * Atualiza a lista de empresas com filtros aplicados.
   */
  const handleRefresh = useCallback(async () => {
    setMessage(null);
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        company_name: filterCompanyName,
        fantasy_name: filterFantasyName,
        cnpj: filterCnpj,
        sort_column: sortColumn,
        sort_order: sortOrder,
      };
      const response = await api.get("/companies/index", { params });
      const data = response.data.data || [];
      setCompanies(data);

      setPagination({
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
        itemsPerPage: response.data.meta.per_page,
      });
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      setError("Erro ao atualizar a tabela.");
    } finally {
      setIsLoading(false);
    }
  }, [filterCompanyName, filterFantasyName, filterCnpj, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleRefresh();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [handleRefresh, filterCompanyName, filterFantasyName, filterCnpj, pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

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
    const columnDefinition = columns.find((c) => c.key === column);
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

  // Defina as colunas da tabela
  const columns = [
    { key: "id", label: "ID", type: "number" },
    { key: "company_name", label: "Razão Social", type: "text" },
    { key: "fantasy_name", label: "Nome Fantasia", type: "text" },
    { key: "cnpj", label: "CNPJ", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Telefone", type: "text" },
  ];

  return (
    <div style={{ padding: "1px" }}>
      <h2>Lista de Empresas</h2>

      {isLoading && <LoadingSpinner />}

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Razão Social:</legend>
              <input
                type="text"
                placeholder="Digite a Razão Social..."
                id="filter-company-name"
                value={filterCompanyName}
                onChange={(e) => setFilterCompanyName(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>Nome Fantasia:</legend>
              <input
                type="text"
                placeholder="Digite o Nome Fantasia..."
                id="filter-fantasy-name"
                value={filterFantasyName}
                onChange={(e) => setFilterFantasyName(e.target.value)}
              />
            </fieldset>
          </div>

          <div className="filter-group">
            <fieldset>
              <legend>CNPJ:</legend>
              <input
                type="text"
                placeholder="Digite o CNPJ..."
                id="filter-cnpj"
                value={filterCnpj}
                onChange={(e) => setFilterCnpj(e.target.value)}
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
          data={companies}
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

export default ListCompanies;