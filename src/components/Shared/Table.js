import React, { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { FaImage } from "react-icons/fa"; // Importa o ícone de imagem
import "./Table.css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

function Table({
  data,
  columns,
  itemsPerPage = 10,
  isSortable = false,
  loading = false,
  isModalError = false,
  error,
  getActionItems = null,
  getMultiActions = null,
  handleSort,
  sortColumn,
  sortOrder,
  onModalStateChange,
  menuHeight = 120,
}) {
  const [currentPage, setCurrentPage] = useState(1);  //eslint-disable-line
  const [showActions, setShowActions] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const tableRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, isOpen: false, itemId: null });
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortColumn && sortOrder) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aString =
          aValue === null || aValue === undefined
            ? ""
            : String(aValue).toLowerCase();
        const bString =
          bValue === null || bValue === undefined
            ? ""
            : String(bValue).toLowerCase();
        return sortOrder === "asc"
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }
    return sortableItems;
  }, [data, sortColumn, sortOrder]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const toggleActions = (itemId, event, item) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (isMobile) {
      const actions = getActionItems(itemId, item);
      if (actions.length > 0) {
        const callAction = actions.find(action => action.label === 'Fazer Chamada');
        if (callAction) {
          onModalStateChange?.(true);
          callAction.action(itemId);
          return;
        }
      }
    }

    setContextMenu({ x: 0, y: 0, isOpen: false, itemId: null });
    setShowActions(showActions === itemId ? null : itemId);
    setShowOverlay(!showOverlay);
  };

  const handleRowClick = (itemId, event) => {
    if (getMultiActions === null) return;
    if (event.target.tagName === "TD" || event.target.tagName === "SPAN" || event.target.tagName === "DIV") {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows.includes(itemId)) {
          return prevSelectedRows.filter((id) => id !== itemId);
        } else {
          return [...prevSelectedRows, itemId];
        }
      });
    }
  };

  const isRowSelected = (itemId) => selectedRows.includes(itemId);

  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (!tableRef.current?.contains(event.target) ||
        !event.target.closest('.actions-menu')) {
        setShowActions(null);
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener("click", handleGlobalClick, true);

    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
    };
  }, []);

  const handleMouseDown = (index, event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = tableRef.current.querySelectorAll("th")[index].offsetWidth;

    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth + moveEvent.clientX - startX;
      setColumnWidths((prevWidths) => ({
        ...prevWidths,
        [index]: newWidth > 50 ? newWidth : 50,
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const columnsWithInitialWidth = {};
    columns.forEach((_, index) => {
      columnsWithInitialWidth[index] = 150;
    });
    setColumnWidths(columnsWithInitialWidth);
  }, [columns]);

  const currentPageSelectedRows = useMemo(() => {
    return currentItems.map(item => item.id).filter(id => selectedRows.includes(id));
  }, [currentItems, selectedRows]);

  const handleSelectAll = () => {
    const allCurrentPageSelected = currentPageSelectedRows.length === currentItems.length;

    setSelectedRows((prevSelectedRows) => {
      if (allCurrentPageSelected) {
        return prevSelectedRows.filter(id => !currentItems.find(item => item.id === id));
      } else {
        const currentPageIds = currentItems.map(item => item.id);
        return [...new Set([...prevSelectedRows, ...currentPageIds])];
      }
    });
  };

  const handleContextMenu = (event, itemId) => {
    event.preventDefault();
    event.stopPropagation();

    const x = event.clientX;
    const y = event.clientY;
    const viewportHeight = window.innerHeight;
    const adjustedY = y + menuHeight > viewportHeight ? y - menuHeight : y;

    setShowActions(null);
    setContextMenu({
      x: x,
      y: adjustedY,
      isOpen: true,
      itemId: itemId
    });
  };

  const renderCellContent = (column, item) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }

    if (column.key === "image") {
      const imageUrl = item[column.key]?.replace('uploads/photos', 'uploads/users');
      return imageUrl ? (
        <img
          src={imageUrl}
          alt="Imagem"
          onError={(e) => {
            e.target.onerror = null; // Evita loop infinito
            e.target.src = "https://placehold.co/600x400"; // Define como vazio para exibir o ícone
          }}
          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%" }}
        />
      ) : (
        <FaImage style={{ fontSize: "24px", color: "var(--secondary-color)" }} />
      );
    }

    return item[column.key] || "N/A";
  };

  return (
    <div className="table-container">
      {error && !isModalError && <div className="error-message">{isModalError}</div>}

      {loading && <LoadingSpinner />}

      <div className="multi-actions-container">
        {getMultiActions && selectedRows.length > 0 && getMultiActions(selectedRows).map((actionItem) => (
          <button
            key={actionItem.label}
            onClick={() => {
              actionItem.action(selectedRows);
              setSelectedRows([]);
            }}
          >
            {actionItem.label}
          </button>
        ))}
      </div>

      {!loading && currentItems.length > 0 && (
        <table ref={tableRef} className="data-table">
          <thead>
            <tr>
              {getMultiActions && (
                <th
                  style={{ width: '50px', cursor: getMultiActions ? 'pointer' : 'default' }}
                  onClick={getMultiActions ? handleSelectAll : null}
                >
                  <input
                    type="checkbox"
                    checked={currentPageSelectedRows.length === currentItems.length && currentItems.length > 0}
                    onChange={handleSelectAll}
                    disabled={currentItems.length === 0 || getMultiActions === null}
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{
                    cursor: isSortable ? "pointer" : "default",
                    width: columnWidths[index] ? columnWidths[index] + "px" : "150px",
                    textAlign: column.align || "center"
                  }}

                >
                  {column.label}
                  {sortColumn === column.key && (sortOrder === "asc" ? " ↑" : " ↓")}
                  <div className="resizer" onMouseDown={(e) => handleMouseDown(index, e)}></div>
                </th>
              ))}
              {getActionItems  && (
                <th className="actions-column">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr
                key={item.id}
                className={`
                  ${item.deleted_at || item.is_active === 0 ? "deleted-item" : ""} 
                  ${isRowSelected(item.id) ? "selected" : ""}
                  ${contextMenu.isOpen && contextMenu.itemId === item.id ? "context-menu-open" : ""}
                `}
                onClick={(event) => handleRowClick(item.id, event)}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
              >
                {getMultiActions && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isRowSelected(item.id)}
                      onChange={() => handleRowClick(item.id, { target: { tagName: 'TD' } })}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    data-label={column.label}
                    style={{ textAlign: column.align || "center" }}
                  >
                    {renderCellContent(column, item)}
                  </td>
                ))}
                {getActionItems && (
                <td className="actions">
                  <div
                    className="actions-dropdown"
                    onClick={(e) => toggleActions(item.id, e, item)}
                  >
                    <button
                      className="actions-btn"
                      onClick={(e) => toggleActions(item.id, e, item)}
                    >
                      {isMobile ? '' : '...'}
                    </button>
                    {(showActions === item.id || (contextMenu.isOpen && contextMenu.itemId === item.id)) && (
                      <div
                        className="actions-menu"
                        style={contextMenu.isOpen ? {
                          position: 'fixed',
                          left: `${contextMenu.x}px`,
                          top: `${contextMenu.y}px`
                        } : {}}
                      >
                        {getActionItems(item.id, item).map((actionItem) => (
                          <button
                            key={actionItem.label}
                            onClick={(e) => {
                              e.stopPropagation();
                              actionItem.action(item.id);
                              setShowActions(null);
                              setContextMenu(prev => ({ ...prev, isOpen: false }));
                            }}
                          >
                            {actionItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && currentItems.length === 0 && (
        <div>Nenhum registro encontrado.</div>
      )}
    </div>
  );
}

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  itemsPerPage: PropTypes.number,
  defaultSortColumn: PropTypes.string,
  defaultSortOrder: PropTypes.string,
  isSortable: PropTypes.bool,
  loading: PropTypes.bool,
  isModalError: PropTypes.bool,
  error: PropTypes.string,
  getActionItems: PropTypes.func,
  getMultiActions: PropTypes.func,
  handleSort: PropTypes.func.isRequired,
  onModalStateChange: PropTypes.func,
  menuHeight: PropTypes.number,
};

export default Table;