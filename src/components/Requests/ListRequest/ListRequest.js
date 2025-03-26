import React, { useState, useCallback, useEffect } from 'react';
import api from '../../../services/api';
import Table from '../../Shared/Table';
import { FaSync } from 'react-icons/fa';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import './ListRequest.css';
import CustomDatePicker from '../../Shared/CustomDatePicker/CustomDatePicker';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatDateToBR = (dateString) => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

function ListRequest() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterStatus, setFilterStatus] = useState("pendente");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filterCourse, setFilterCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dateError, setDateError] = useState('');
  const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
  const [selectedLessonPlanContent, setSelectedLessonPlanContent] = useState('');
  const [selectedLessonInfo, setSelectedLessonInfo] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [modalRoot, setModalRoot] = useState(null);

  const handleDateChange = (date, isStartDate) => {
    if (isStartDate) {
      if (endDate && date > endDate) {
        setDateError('A data inicial não pode ser maior que a data final');
        return;
      }
      setStartDate(date);
    } else {
      if (startDate && date < startDate) {
        setDateError('A data final não pode ser menor que a data inicial');
        return;
      }
      setEndDate(date);
    }
    setDateError('');
  };

  const fetchRequests = useCallback(async () => {
    if (dateError) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/requests/index`, {
        params: {
          limit: itemsPerPage,
          page: currentPage,
          sort_column: sortColumn,
          sort_order: sortOrder,
          teacher: filterTeacher,
          status: filterStatus,
          date_start: startDate,
          date_end: endDate,
          course: filterCourse,
        },
      });

      const requestsData = response.data.data;
      setRequests(requestsData);
      setPagination({
        currentPage: response.data.meta.current_page,
        totalPages: response.data.meta.last_page,
        totalItems: response.data.meta.total,
        itemsPerPage: response.data.meta.per_page
      });

      
      const hasPendingRequests = requestsData.some(request => request.status === 'pending');
      
      
      const event = new CustomEvent('requestsStatusUpdate', {
        detail: hasPendingRequests
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      setError("Erro ao carregar as solicitações.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, sortColumn, sortOrder, filterTeacher, filterStatus, 
      startDate, endDate, filterCourse, dateError]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses/index');
        setCourses(response.data.data);
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const root = document.getElementById('modal-root') || document.createElement('div');
    if (!root.id) {
      root.id = 'modal-root';
      document.body.appendChild(root);
    }
    Modal.setAppElement('#modal-root');
    setModalRoot(root);

    return () => {
      if (root.id === 'modal-root' && !document.getElementById('modal-root')) {
        document.body.removeChild(root);
      }
    };
  }, []);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await api.put(`/requests/admin/${requestId}/status`, { status: newStatus });
      setShowConfirmModal(false);
      handleRefresh(); 
    } catch (error) {
      setError("Erro ao atualizar status da solicitação.");
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction && selectedRequest) {
      handleStatusUpdate(selectedRequest.id, confirmAction);
    }
  };

  const showConfirmation = (request, action) => {
    setSelectedRequest(request);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setFilterStatus(""); 
    fetchRequests();
  }, [fetchRequests]);

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
      setCurrentPage(1);
    }
  };

  const processLessonPlanContent = (content) => {
    try {
      const parsedContent = JSON.parse(content);
      let htmlContent = '';

      parsedContent.blocks.forEach(block => {
        switch (block.type) {
          case 'header':
            htmlContent += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
            break;
          case 'list':
            if (block.data.style === 'unordered') {
              htmlContent += '<ul class="unordered-list">';
              block.data.items.forEach(item => {
                htmlContent += `<li>${item.content}</li>`;
              });
              htmlContent += '</ul>';
            } else if (block.data.style === 'ordered') {
              htmlContent += '<ol class="ordered-list">';
              block.data.items.forEach(item => {
                htmlContent += `<li>${item.content}</li>`;
              });
              htmlContent += '</ol>';
            } else if (block.data.style === 'checklist') {
              htmlContent += '<ul class="checklist">';
              block.data.items.forEach(item => {
                htmlContent += `
                  <li>
                    <input type="checkbox" ${item.checked ? 'checked' : ''} disabled>
                    <span>${item.content}</li>`;
              });
              htmlContent += '</ul>';
            }
            break;
          default:
            if (block.data && block.data.text) {
              htmlContent += `<p>${block.data.text}</p>`;
            }
        }
      });

      return htmlContent;
    } catch (error) {
      console.error('Erro ao processar conteúdo do plano de aula:', error);
      return '<p>Erro ao carregar o conteúdo do plano de aula</p>';
    }
  };

  const handleViewLessonPlan = async (sessionId, courseName, date) => {
    try {
      const response = await api.get(`/lesson-plans/${sessionId}`);
      setSelectedLessonInfo({
        courseName: courseName,
        date: formatDateToBR(date)
      });
      const lessonPlanContent = JSON.parse(response.data.content);
      const formattedContent = processLessonPlanContent(JSON.stringify(lessonPlanContent));
      setSelectedLessonPlanContent(formattedContent);
      setShowLessonPlanModal(true);
    } catch (error) {
      console.error('Erro ao carregar planejamento:', error);
      alert('Erro ao carregar o planejamento de aula');
    } finally {
      handleRefresh(); 
    }
};

const handleViewReport = async (sessionId) => {
    try {
        const response = await api.get(`/attendances/session/${sessionId}/lesson-report`);
        const reportData = response.data.data;

        if (!reportData || !reportData.course_name || !Array.isArray(reportData.attendances)) {
            throw new Error("Dados inválidos para gerar o relatório.");
        }

        const doc = new jsPDF({ format: 'a4' });
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();

        
        const addHeader = (pageNumber) => {
            doc.setFillColor(primaryColor);
            doc.rect(0, 0, doc.internal.pageSize.width, 15, 'F');
            doc.setTextColor('#f4f2efFFF');
            doc.setFontSize(8);
            const formattedDate = formatDateToBR(reportData.date);
            doc.text(`Turma: ${reportData.course_name} | Data: ${formattedDate} | Página ${pageNumber}`, 5, 10);
        };

        
        const sortedAttendances = reportData.attendances.sort((a, b) => {
            const fullNameA = `${a.student_first_name} ${a.student_last_name}`.toLowerCase();
            const fullNameB = `${b.student_first_name} ${b.student_last_name}`.toLowerCase();
            return fullNameA.localeCompare(fullNameB, 'pt-BR');
        });

        
        const tableData = sortedAttendances.map(attendance => [
            `${attendance.student_first_name} ${attendance.student_last_name}`,
            attendance.status === 'P' ? 'P' :
                attendance.status === 'F' ? 'F' :
                    attendance.status === 'FJ' ? 'FJ' :
                        attendance.status === 'PA' ? 'PA' : '-',
            attendance.comments || ''
        ]);

        
        doc.autoTable({
            startY: 20,
            head: [['Nome do Aluno', 'St', 'Observações']],
            body: tableData,
            theme: 'grid',
            styles: {
                font: 'helvetica',
                fontSize: 8,
                cellPadding: {
                    top: 1,
                    right: 2,
                    bottom: 1,
                    left: 2
                },
                lineColor: primaryColor,
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: '#f4f2efFFF',
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.2,
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 10, halign: 'center' },
                2: { cellWidth: 'auto' },
            },
            margin: { top: 20 },
            didDrawPage: function (data) {
                addHeader(doc.internal.getNumberOfPages());
            },
            foot: [[
                { content: 'Legenda: P = Presente | F = Falta | FJ = Falta Justificada | PA = Presente com Atraso', colSpan: 3, styles: { fontSize: 6, textColor: textColor, halign: 'left' } }
            ]],
        });

        const pdfBytes = doc.output('arraybuffer');
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setShowPdfModal(true);
    } catch (error) {
        console.error("Error generating or displaying PDF:", error);
        alert("Ocorreu um erro tentando gerar o relatório. Por favor, tente novamente mais tarde.");
    } finally {
        handleRefresh(); 
    }
};

  const columns = [
    {
      key: "requested_user.name",
      label: "Professor",
      sortable: false,
      render: (_, row) => row.requested_user?.name || 'N/A'
    },
    {
      key: "course",
      label: "Turma",
      sortable: false,
      render: (_, row) => row.course?.name || 'N/A'
    },
    {
      key: "request_type",
      label: "Tipo",
      sortable: true
    },
    {
      key: "comment",
      label: "Comentário",
      sortable: false,
      render: (_, row) => row.comment || ''
    },
    {
      key: "created_at",
      label: "Data",
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => {
        const statusMap = {
          'pending': 'Pendente',
          'approved': 'Aprovado',
          'rejected': 'Rejeitado'
        };
        const statusClass = {
          'pending': 'status-pending',
          'approved': 'status-approved',
          'rejected': 'status-rejected'
        };
        return (
          <span className={`status-badge ${statusClass[status] || ''}`}>
            {statusMap[status] || status}
          </span>
        );
      }
    },
  ];

  const getActionItems = (requestId, request) => {
    const actions = [
        {
            label: "Aprovar",
            action: () => showConfirmation(request, 'aprovado'),
            hidden: request.status !== 'pending'
        },
        {
            label: "Rejeitar",
            action: () => showConfirmation(request, 'rejeitado'),
            hidden: request.status !== 'pending'
        }
    ];

    
    if (request.request_type === 'Exclusão de Planejamento' && request.lesson_plan?.id) {
        actions.push({
            label: "Visualizar Planejamento",
            action: () => handleViewLessonPlan(
                request.lesson_plan.id, 
                request.course?.name, 
                request.attendance?.date
            )
        });
    }

    if (request.request_type === 'Reabertura de Chamada' && request.attendance?.id) {
        actions.push({
            label: "Visualizar Relatório",
            action: () => handleViewReport(request.attendance.id)
        });
    }

    return actions.filter(action => !action.hidden);
};

  return (
    <div className="requests-container">
      <h2>Solicitações dos Professores</h2>

      <div className="filters-container">
        <div className="filter-group">
          <fieldset>
            <legend>Professor:</legend>
            <input
              type="text"
              placeholder="Nome do professor"
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
            />
          </fieldset>
        </div>

        <div className="filter-group">
          <fieldset>
            <legend>Status:</legend>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </fieldset>
        </div>

        <div className="filter-group">
          <fieldset>
            <legend>Turma:</legend>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">Todas as turmas</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        <div className="filter-group">
          <fieldset>
            <legend>Período:</legend>
            <div className="date-range">
              <CustomDatePicker
                value={startDate}
                onChange={(date) => handleDateChange(date, true)}
                placeholder="Inicial"
                className="date-picker-compact"
              />
              <span className="date-separator">até</span>
              <CustomDatePicker
                value={endDate}
                onChange={(date) => handleDateChange(date, false)}
                placeholder="Final"
                className="date-picker-compact"
              />
            </div>
            {dateError && <div className="date-error">{dateError}</div>}
          </fieldset>
        </div>

        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="20px" /> : <><FaSync /> Atualizar</>}
        </button>
      </div>

      <Table
        data={requests}
        columns={columns}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        isSortable={true}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        handleSort={handleSort}
        loading={isLoading}
        error={error}
        getActionItems={getActionItems}
        menuHeight={120}
      />

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage <= 1}
        >
          {"<<"}
        </button>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          {"<"}
        </button>
        <span>
          Página {currentPage} de {pagination.totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= pagination.totalPages}
        >
          {">"}
        </button>
        <button
          onClick={() => setCurrentPage(pagination.totalPages)}
          disabled={currentPage >= pagination.totalPages}
        >
          {">>"}
        </button>
      </div>

      <div className="items-per-page-selector">
        <label htmlFor="itemsPerPage">Itens por página: </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmação</h3>
            <p>
              Tem certeza que deseja {confirmAction === 'aprovado' ? 'aprovar' : 'rejeitar'}
              esta solicitação?
            </p>
            <div className="modal-buttons">
              <button onClick={handleConfirmAction}>Sim</button>
              <button onClick={() => setShowConfirmModal(false)}>Não</button>
            </div>
          </div>
        </div>
      )}

      {showLessonPlanModal && (
        <Modal
          isOpen={showLessonPlanModal}
          onRequestClose={() => setShowLessonPlanModal(false)}
          contentLabel="Planejamento de Aula"
          className="lesson-plan-modal"
          overlayClassName="lesson-plan-modal-overlay"
          parentSelector={() => modalRoot || document.body}
          ariaHideApp={false}
        >
          <h2>Planejamento de Aula</h2>
          <div className="lesson-info">
            <p><strong>Turma:</strong> {selectedLessonInfo?.courseName || 'N/A'}</p>
            <p><strong>Data da Aula:</strong> {selectedLessonInfo?.date || 'N/A'}</p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: selectedLessonPlanContent }} />
          <button onClick={() => setShowLessonPlanModal(false)}>Fechar</button>
        </Modal>
      )}

      {showPdfModal && pdfUrl && (
        <Modal
            isOpen={showPdfModal}
            onRequestClose={() => {
                setShowPdfModal(false);
                setPdfUrl(null);
            }}
            contentLabel="Relatório de Chamada"
            className="pdf-modal"
            overlayClassName="modal-overlay"
            parentSelector={() => modalRoot || document.body}
            ariaHideApp={false}
            style={{
                content: {
                    width: '80%',
                    height: '90%',
                    margin: 'auto',
                    padding: '20px',
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            }}
        >
            <iframe 
                src={pdfUrl} 
                title="Relatório de Chamada" 
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
            />
        </Modal>
      )}
    </div>
  );
}

export default ListRequest;