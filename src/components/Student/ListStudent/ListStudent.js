/**
 * Componente ListStudent
 * Exibe lista de alunos com filtros, paginação e ações
 */

import React, { useState, useEffect, useRef } from "react";
import api from "../../../services/api";
import Modal from 'react-modal';
import "./ListStudents.css";
import EditStudentModal from "../Modal/EditStudent/EditStudentModal";
import Table from "../../Shared/Table";
import { FaSync } from "react-icons/fa";
import ContractView from "../Modal/ContractView/ContractView";
import ContactModal from "../Modal/ContactModal/ContactModal";
import { useSearchParams } from 'react-router-dom';

function ListStudents() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showActions, setShowActions] = useState(null); // eslint-disable-line
  const [filterFullName, setFilterFullName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const actionsMenuRef = useRef(null);

  const [editingStudent, setEditingStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfAttachmentUrl, setPdfAttachmentUrl] = useState(null);
  //modal detail
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContactStudent, setSelectedContactStudent] = useState(null);

  /**
   * Carrega lista de alunos com filtros aplicados
   */
  useEffect(() => {
    setIsLoading(true);
    const fetchStudents = async () => {
      setError(null);
      try {
        const withDeleted = showDeleted ? "true" : "false";
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          with_deleted: withDeleted,
          sort_column: sortColumn,
          sort_order: sortOrder,
        };
        if (filterFullName) {
          params.full_name = filterFullName;
        }
        if (filterEmail) {
          params.email = filterEmail;
        }
        if (filterGender) {
          params.gender = filterGender;
        }
        if (filterCategory) {
          params.category = filterCategory; 
        }
        const response = await api.get(`/students/index`, { params });

        setStudents(response.data.data);
        setPagination({
          currentPage: response.data.pagination.current_page,
          totalPages: response.data.pagination.last_page,
          totalItems: response.data.pagination.total,
          itemsPerPage: response.data.pagination.per_page
        });
        setIsLoading(false);
      } catch (error) {
        setError("Erro ao carregar os alunos. Tente novamente.");
      }
    };

    fetchStudents();
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    showDeleted,
    sortColumn,
    sortOrder,
    filterFullName,
    filterEmail,
    filterGender,
    filterCategory,
  ]);

  
  useEffect(() => {
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) {
      setFilterFullName(nameFromUrl);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }

    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/index', {
          params: {
            limit: 9999, 
            page: 1
          }
        });
        // Ordena as categorias por nome em ordem alfabética
        const sortedCategories = response.data.data.sort((a, b) => 
          a.name.localeCompare(b.name, 'pt-BR')
        );
        setCategories(sortedCategories);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };

    fetchCategories();
  }, [searchParams]);

  const handleItemsPerPageChange = (event) => {
    setPagination({ ...pagination, itemsPerPage: Number(event.target.value), currentPage: 1 });
  };

  const handleEdit = async (studentId) => {
    try {
      const response = await api.get(`/student/${studentId}/index`);
      setEditingStudent(response.data.data);
      setIsModalOpen(true);
      setShowActions(null);
    } catch (error) {
      console.error("Erro ao carregar dados do aluno:", error);
      alert("Erro ao carregar dados do aluno. Por favor, tente novamente.");
    }
  };

  const handlePrintContract = async (studentId) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/student/${studentId}/contract`, {
        responseType: "json",
      });

      if (response.data) {
        const studentData = response.data.student;
        const poloData = response.data.polo;
        const allCategoryData = response.data.allCategory;

        // Renderiza o contrato em um novo modal
        setPdfUrl({ student: studentData, polo: poloData, allCategory: allCategoryData });
        setIsLoading(false);
      } else {
        console.error("Nenhuma URL recebida do servidor:", response.data);
        alert("Erro ao gerar o contrato. Nenhuma URL recebida.");
      }

      setShowActions(null);
    } catch (error) {
      console.error("Erro ao imprimir contrato:", error);
      alert("Erro ao gerar o contrato. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };


  const handlePrint = () => {
    const modalContent = document.querySelector('.student-details').innerHTML;

    const printStyles = `
      <style>
        .details-content { margin: 15px 0; }
        h2, h3 { margin: 15px 0; color: #333; }
        p { margin: 8px 0; }
        @media print {
          body { font-family: Arial, sans-serif; }
          .modal-buttons { display: none; }
        }
      </style>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Imprimir Detalhes do Aluno</title>');
    printWindow.document.write(printStyles);
    printWindow.document.write('</head><body>');
    printWindow.document.write(modalContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSaveModal = (updatedStudent) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const withDeleted = showDeleted ? "true" : "false";
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        with_deleted: withDeleted,
        sort_column: sortColumn,
        sort_order: sortOrder,
      };
      if (filterFullName) params.filter_full_name = filterFullName;
      if (filterEmail) params.filter_email = filterEmail;
      if (filterGender) params.filter_gender = filterGender;
      const response = await api.get(`/students/index`, { params });
      setStudents(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
        totalItems: response.data.total,
        itemsPerPage: response.data.per_page,
      });
    } catch (error) {
      setError("Erro ao carregar os alunos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const handleSort = (column) => {
    const columnDefinition = columns.find(c => c.key === column);
    if (columnDefinition && columnDefinition.sortable) { 
      if (sortColumn === column) {
        if (sortOrder === 'asc') {
          setSortOrder('desc');
        } else if (sortOrder === 'desc') {
          setSortColumn(null);
          setSortOrder('asc');
        } else {
          setSortOrder('asc');
        }
      } else {
        setSortColumn(column);
        setSortOrder('asc');
      }
      setPagination({ ...pagination, currentPage: 1 });
    }
  };

  const getMultiActions = () => {
    return [
      {
        label: "Excluir Selecionados",
        action: async (ids) => {
          if (window.confirm(`Tem certeza que deseja excluir ${ids.length} alunos?`)) {
            try {
              await api.post('/students/bulk-delete', { ids });
              handleRefresh();
              alert("Alunos excluídos com sucesso!");
            } catch (error) {
              console.error("Erro ao excluir alunos:", error);
              alert("Erro ao excluir alunos. Por favor, tente novamente.");
            }
          }
        },
      },
      {
        label: "Restaurar Selecionados",
        action: async (ids) => {
          if (window.confirm(`Tem certeza que deseja restaurar ${ids.length} alunos?`)) {
            try {
              await api.post('/students/bulk-restore', { ids });
              handleRefresh();
              alert("Alunos restaurados com sucesso!");
            } catch (error) {
              console.error("Erro ao restaurar alunos:", error);
              alert("Erro ao restaurar alunos. Por favor, tente novamente.");
            }
          }
        }
      }
    ];
  };

  const handleDelete = async (studentId) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      try {
        const response = await api.delete(`/student/${studentId}/delete`);
        if (response.status === 204) {
          setStudents(students.filter((student) => student.id !== studentId));
          alert("Aluno excluído com sucesso!");
          handleRefresh();
          setShowActions(null);
        } else {
          setError("Erro ao excluir o aluno. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        setError("Erro ao excluir o aluno. Tente novamente.");
      }
    }
  };

  const handleRestore = async (studentId) => {
    try {
      const response = await api.post(`/student/${studentId}/restore`);
      if (response.status === 200) {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.id !== studentId)
        );
        alert("Aluno restaurado com sucesso!");
        handleRefresh();
      } else {
        setError("Erro ao restaurar o aluno. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao restaurar aluno:", error);
      setError("Erro ao restaurar o aluno. Tente novamente.");
    }
  };

  const handleOpenPdfAttachment = (pdfUrl) => {

    if (pdfUrl) {
      const formattedUrl = `http://amparoserver.test${pdfUrl}`;
      console.log("Formatted URL:", formattedUrl);
      setPdfAttachmentUrl(formattedUrl);
    } else {
      alert("Nenhum PDF de anexo disponível.");
    }
  };

  const handleDetailStudent = async (studentId) => {
    try {
      const response = await api.get(`/student/${studentId}/index`);
      setSelectedStudent(response.data.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes do aluno:", error);
      alert("Erro ao carregar detalhes do aluno. Por favor, tente novamente.");
    }
  };

  const handleContact = async (studentId) => {
    try {
      const response = await api.get(`/student/${studentId}/contacts`);
      // Os dados já vêm no formato correto, não precisamos transformá-los
      setSelectedContactStudent(response.data);
      setIsContactModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
      alert("Erro ao carregar informações de contato. Por favor, tente novamente.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target)
      ) {
        setShowActions(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const columns = [
    {
      key: "full_name",
      sortable: true,
      label: "Nome Completo",
      render: (value, item) => `${item.first_name} ${item.last_name}`
    },
    { key: "email", sortable: true, label: "Email" },
    {
      key: "phone_number",
      label: "Telefone",
      sortable: true,
      render: (phone) => {
        if (!phone) return "Não informado";
        phone = phone.replace(/\D/g, "");
        if (phone.length === 11) {
          return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
        } else if (phone.length === 10) {
          return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
        }
        return phone;
      }
    },
    {
      key: "gender",
      sortable: true,
      label: "Gênero",
      render: (value) => value === 'male' ? 'Masculino' : 'Feminino'
    },
    {
      key: 'birthdate',
      label: 'Data de Nascimento',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      key: "categories",
      label: "Oficinas",
      sortable: false,
      render: (categories) => {
        if (!categories || categories.length === 0) return "Nenhuma";
        return categories.map((category) => category.name).join(", ");
      },
    },
    {
      key: "deleted_at",
      label: "Ativo",
      sortable: true,
      render: (value) => (
        <input
          type="checkbox"
          checked={!value}
          readOnly
          disabled
          title={value ? "Inativo" : "Ativo"}
        />
      )
    }
  ];

  const getActionItems = (itemId, item) => {
    const actions = [
      {
        label: "Detalhar",
        action: () => handleDetailStudent(itemId)
      },
      {
        label: "Contatar",
        action: () => handleContact(itemId)
      }
    ];

    if (item.pdf_attachment) {
      actions.push({
        label: "Abrir Laudo PCD",
        action: () => handleOpenPdfAttachment(`/storage/${item.pdf_attachment}`),
      });
    }

    if (item.deleted_at === null) {
      actions.push(
        {
          label: "Imprimir Contrato",
          action: () => handlePrintContract(itemId),
        },
        {
          label: "Editar",
          action: () => handleEdit(itemId),
        },
        {
          label: "Excluir",
          action: () => handleDelete(itemId),
        });
    } else {
      actions.push(
        {
          label: "Restaurar",
          action: () => handleRestore(itemId),
        });
    }

    return actions;
  };

  return (
    <div className="students-list-container">
      <h2>Lista de Alunos</h2>

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Nome Completo:</legend>
              <input
                type="text"
                placeholder="Filtrar por Nome Completo"
                value={filterFullName}
                onChange={(e) => setFilterFullName(e.target.value)}
              />
            </fieldset>
          </div>
          <div className="filter-group">
            <fieldset>
              <legend>Email:</legend>
              <input
                type="text"
                placeholder="Filtrar por Email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
              />
            </fieldset>
          </div>
          <div className="filter-group">
            <fieldset>
              <legend>Gênero:</legend>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="">Todos os Gêneros</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </fieldset>
          </div>
          <div className="filter-group">
            <fieldset>
              <legend>Oficina:</legend>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Todas as Oficinas</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="show-deleted"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            <label htmlFor="show-deleted">EXIBIR EXCLUIDOS</label>
          </div>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <FaSync />
            {isLoading ? "" : " Atualizar"}
          </button>
        </div>
      </div>

      <Table
        data={students}
        columns={columns}
        itemsPerPage={Number(pagination.itemsPerPage) || 10} 
        loading={isLoading}
        error={error}
        isSortable={true}
        getActionItems={getActionItems}
        getMultiActions={getMultiActions}
        handleSort={handleSort}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        menuHeight={200}
      />

      {pdfAttachmentUrl && (
        <div className="iframe-modal-overlay" onClick={() => setPdfAttachmentUrl(null)}>
          <div className="iframe-modal-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={pdfAttachmentUrl}
              width="100%"
              height="500px"
              title="PDF de Anexo"
            />
            <button onClick={() => setPdfAttachmentUrl(null)} className="iframe-close-button">
              x
            </button>
          </div>
        </div>
      )}

      {pdfUrl && (
        <div className="iframe-modal-overlay" onClick={() => setPdfUrl(null)}>
          <div className="iframe-modal-content" onClick={(e) => e.stopPropagation()}>
            <ContractView student={pdfUrl.student} polo={pdfUrl.polo} allCategory={pdfUrl.allCategory} />
            <button onClick={() => setPdfUrl(null)} className="iframe-close-button">x</button>
          </div>
        </div>
      )}

      <div className="pagination">
        <button onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1}>{"<<"}</button>
        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>{"<"}</button>
        <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>{">"}</button>
        <button onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages}>{">>"}</button>
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

      {isModalOpen && (
        <EditStudentModal
          student={editingStudent}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}

      <Modal
        isOpen={isDetailsModalOpen}
        onRequestClose={() => setIsDetailsModalOpen(false)}
        contentLabel="Detalhes do Aluno"
        className="modal-student-details"
        overlayClassName="modal-overlay-student-details"
      >
        <div className="student-details">
          <h2>Detalhes do Aluno</h2>
          <div className="modal-header">
            <div className="modal-buttons">
              <button onClick={handlePrint} className="button">
                Imprimir
              </button>
            </div>
          </div>

          {selectedStudent && (
            <div className="details-content">
              <fieldset>
                <legend>Informações Pessoais</legend>
                <div className="details-row">
                  <ul>
                    <li><strong>ID:</strong> {selectedStudent.id}</li>
                    <li><strong>Nome Completo:</strong> {selectedStudent.first_name} {selectedStudent.last_name}</li>
                    <li><strong>Data de Nascimento:</strong> {new Date(selectedStudent.birthdate).toLocaleDateString('pt-BR')}</li>
                    <li><strong>Gênero:</strong> {selectedStudent.gender === 'male' ? 'Masculino' : 'Feminino'}</li>
                  </ul>
                  <ul>
                    <li><strong>Email:</strong> {selectedStudent.email}</li>
                    <li><strong>Telefone:</strong> {selectedStudent.phone_number}</li>
                    <li>
                      <strong>Status:</strong> {selectedStudent.deleted_at ? (
                        <>
                          Inativo (Excluído em: {new Date(selectedStudent.deleted_at).toLocaleString('pt-BR')})
                        </>
                      ) : 'Ativo'}
                    </li>
                    <li><strong>Oficinas:</strong> {selectedStudent.categories && selectedStudent.categories.length > 0 ? selectedStudent.categories.map(category => category.name).join(", ") : "Nenhuma"}</li>
                  </ul>
                </div>
              </fieldset>
              <fieldset>
                <legend>Filiação</legend>
                <div className="details-row">
                  <ul>
                    <li><strong>Nome do Pai:</strong> {selectedStudent.father_name}</li>
                    <li><strong>Nome da Mãe:</strong> {selectedStudent.mother_name}</li>
                    <li><strong>Pode ir embora sozinho:</strong> {selectedStudent.can_go_home ? 'Sim' : 'Não'}</li>
                  </ul>
                </div>
              </fieldset>
              <fieldset>
                <legend>Endereço</legend>
                <div className="details-row">
                  <ul>
                    <li><strong>Rua:</strong> {selectedStudent.street}</li>
                    <li><strong>Número:</strong> {selectedStudent.number}</li>
                    <li><strong>Complemento:</strong> {selectedStudent.complement}</li>
                  </ul>
                  <ul>
                    <li><strong>Bairro:</strong> {selectedStudent.neighborhood}</li>
                    <li><strong>Cidade:</strong> {selectedStudent.city}</li>
                    <li><strong>Estado:</strong> {selectedStudent.state}</li>
                    <li><strong>CEP:</strong> {selectedStudent.zip_code}</li>
                  </ul>
                </div>
              </fieldset>
              <fieldset>
                <legend>Responsáveis</legend>
                {selectedStudent.responsibles && selectedStudent.responsibles.length > 0 ? (
                  <table className="responsibles-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Parentesco</th>
                        <th>Email</th>
                        <th>Telefone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.responsibles.map((responsible) => (
                        <tr key={responsible.id}>
                          <td>{responsible.first_name} {responsible.last_name}</td>
                          <td>{responsible.relation}</td>
                          <td>{responsible.email}</td>
                          <td>{responsible.phone_number || 'Não informado'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Nenhum responsável cadastrado.</p>
                )}
              </fieldset>
            </div>
          )}
        </div>
      </Modal>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        student={selectedContactStudent}
      />
    </div>
  );

}

export default ListStudents;