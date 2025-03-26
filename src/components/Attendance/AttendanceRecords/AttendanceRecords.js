/**
 * Componente AttendanceRecords
 * Responsável pela gestão completa dos registros de chamada.
 * Funcionalidades principais:
 * - Listagem de chamadas com filtros avançados
 * - Edição de registros de presença
 * - Geração de relatórios em PDF
 * - Gestão de solicitações de reabertura
 * - Integração com planejamentos de aula
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import './AttendanceRecords.css';
import EditAttendanceModal from '../Modal/EditAttendanceModal/EditAttendanceModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Table from '../../Shared/Table.js';
import { FaSync } from 'react-icons/fa';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import CustomDatePicker from '../../Shared/CustomDatePicker/CustomDatePicker';
import Modal from 'react-modal';
import Cookies from 'js-cookie';

// Adicione esta função utilitária no início do componente
const formatDateToBR = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

function AttendanceRecords() {
    const [attendanceSessions, setAttendanceSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([]);
    const [filterCourse, setFilterCourse] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [sortColumn, setSortColumn] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });
    const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
    const [selectedLessonPlanContent, setSelectedLessonPlanContent] = useState('');
    const [selectedLessonInfo, setSelectedLessonInfo] = useState(null);
    const [isPaginationVisible, setIsPaginationVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showDeletePlanRequestModal, setShowDeletePlanRequestModal] = useState(false);
    const [requestComment, setRequestComment] = useState('');
    const [selectedSessionForRequest, setSelectedSessionForRequest] = useState(null);
    const [modalRoot, setModalRoot] = useState(null);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterStartTime, setFilterStartTime] = useState('');
    const [filterEndTime, setFilterEndTime] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterTeacher, setFilterTeacher] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [deletePlanContent, setDeletePlanContent] = useState('');
    const [activeTab, setActiveTab] = useState('request');
    const [dateError, setDateError] = useState('');
    const [timeError, setTimeError] = useState('');
    const [showPlanRequestHistoryModal, setShowPlanRequestHistoryModal] = useState(false);
    const [selectedPlanRequests, setSelectedPlanRequests] = useState([]);
    const [showReopenRequestHistoryModal, setShowReopenRequestHistoryModal] = useState(false);
    const [selectedReopenRequests, setSelectedReopenRequests] = useState([]);

    useEffect(() => {
        // Configurar o elemento root do modal após o componente montar
        const root = document.getElementById('modal-root') || document.createElement('div');
        if (!root.id) {
            root.id = 'modal-root';
            document.body.appendChild(root);
        }
        Modal.setAppElement('#modal-root');
        setModalRoot(root);

        return () => {
            // Cleanup ao desmontar
            if (root.id === 'modal-root' && !document.getElementById('modal-root')) {
                document.body.removeChild(root);
            }
        };
    }, []);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await api.get('/professors/index');
                setTeachers(response.data);
            } catch (error) {
                console.error("Erro ao buscar professores:", error);
            }
        };

        fetchTeachers();
    }, []);

    /**
     * Busca chamadas com filtros aplicados
     */
    const fetchAttendanceSessions = useCallback(async () => {
        // Impedir requisição se houver erro
        if (dateError || timeError) {
            return;
        }

        // Se houver um horário sendo digitado, aguarda ter 4 dígitos
        if (filterStartTime || filterEndTime) {
            const startDigits = filterStartTime.replace(/\D/g, '').length;
            const endDigits = filterEndTime.replace(/\D/g, '').length;
            
            if ((filterStartTime && startDigits < 4) || (filterEndTime && endDigits < 4)) {
                return;
            }
        }

        setIsLoading(true);
        setError(null);
        try {
            const params = {};

            // Adiciona os filtros apenas se tiverem valor
            if (filterCourse) params.course_id = filterCourse;
            if (filterTeacher) params.teacher_id = filterTeacher;
            if (filterStartDate) params.start_date = filterStartDate;
            if (filterEndDate) params.end_date = filterEndDate;
            if (filterStartTime) params.start_time = filterStartTime;
            if (filterEndTime) params.end_time = filterEndTime;
            if (filterStatus) params.status = filterStatus;

            // Adiciona paginação e ordenação
            params.page = pagination.currentPage;
            params.limit = pagination.itemsPerPage;
            params.sort_column = sortColumn;
            params.sort_order = sortOrder;

            console.log('Params enviados:', params);

            const response = await api.get('/attendances/sessions', { params });
            const attendanceSessionsWithChecklist = response.data.data.map(session => ({
                ...session,
                checklist: session.status === "Closed" ? false : true
            }));
            setAttendanceSessions(attendanceSessionsWithChecklist);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Erro ao buscar sessões de chamadas:", error);
            setError("Erro ao carregar os registros de chamadas.");
        } finally {
            setIsLoading(false);
        }
    }, [filterCourse, filterTeacher, filterStartDate, filterEndDate,
        filterStartTime, filterEndTime, filterStatus, dateError, timeError,
        pagination.currentPage, pagination.itemsPerPage, sortColumn, sortOrder]);

    // Atualizar os useEffect para reagir às mudanças nos filtros
    useEffect(() => {
        fetchAttendanceSessions();
    }, [fetchAttendanceSessions]);

    // Adicionar efeito para resetar a página quando os filtros mudarem
    useEffect(() => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, [filterCourse, filterTeacher, filterStartDate, filterEndDate,
        filterStartTime, filterEndTime, filterStatus]);

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
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleOpenModal = (session) => {
        // Remove a verificação anterior e simplifica
        setSelectedSession(session);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSession(null);
        if (isMobile) {
            setIsPaginationVisible(true);
        }
    };

    const handleGenerateReport = async (session) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get(`/attendances/session/${session.id}/lesson-report`);
            const reportData = response.data.data;

            if (!reportData || !reportData.course_name || !Array.isArray(reportData.attendances)) {
                throw new Error("Dados inválidos para gerar o relatório.");
            }

            const doc = new jsPDF({ format: 'a4' });
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();

            // Função para adicionar cabeçalho em cada página
            const addHeader = (pageNumber) => {
                doc.setFillColor(primaryColor);
                doc.rect(0, 0, doc.internal.pageSize.width, 15, 'F');
                doc.setTextColor('#f4f2efFFF');
                doc.setFontSize(8);
                const formattedDate = formatDateToBR(reportData.date);
                doc.text(`Turma: ${reportData.course_name} | Data: ${formattedDate} | Página ${pageNumber}`, 5, 10);
            };

            // Ordenar alunos alfabeticamente pelo nome completo
            const sortedAttendances = reportData.attendances.sort((a, b) => {
                const fullNameA = `${a.student_first_name} ${a.student_last_name}`.toLowerCase();
                const fullNameB = `${b.student_first_name} ${b.student_last_name}`.toLowerCase();
                return fullNameA.localeCompare(fullNameB, 'pt-BR');
            });

            // Dados da tabela - formato mais compacto
            const tableData = sortedAttendances.map(attendance => [
                `${attendance.student_first_name} ${attendance.student_last_name}`,
                attendance.status === 'P' ? 'P' :
                    attendance.status === 'F' ? 'F' :
                        attendance.status === 'FJ' ? 'FJ' :
                            attendance.status === 'PA' ? 'PA' : '-',
                attendance.comments || ''
            ]);

            // Configuração da tabela mais compacta
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
            setIsLoading(false);
        }
    };

    const closePdfModal = () => {
        setPdfUrl(null);
        setShowPdfModal(false);
        setIsLoading(false);
    };

    const handleReopen = async (sessionId) => {
        const adminPassword = prompt("Digite a senha do administrador para confirmar a reabertura:");
        if (adminPassword) {
            try {
                const response = await api.post(`/attendances/session/${sessionId}/restore`, {
                    data: { admin_password: adminPassword, id: sessionId }
                });

                if (response.status === 200) {
                    alert("Chamada reaberta com sucesso!");
                    handleRefresh();
                } else {
                    setError("Erro ao reabrir a chamada. Verifique a senha do administrador.");
                }
            } catch (error) {
                console.error("Erro ao reabrir a chamada:", error);
                setError(error.response?.data?.message || "Erro ao reabrir a chamada. Tente novamente.");
            }
        }
    };

    const handleRequestReopen = async (sessionId, comment) => {
        // Verificar se existe solicitação pendente
        const session = attendanceSessions.find(s => s.id === sessionId);
        const hasPendingRequest = session?.reopen_attendance_request?.some(
            request => request.status === 'pending'
        );

        if (hasPendingRequest) {
            alert("Não é possível criar nova solicitação enquanto houver uma solicitação pendente.");
            setShowRequestModal(false);
            setShowReopenRequestHistoryModal(false);
            return;
        }

        try {
            await api.post(`/attendances/session/${sessionId}/reopen-request`, {
                comment: comment
            });
            alert("Solicitação de reabertura enviada com sucesso!");
            setShowRequestModal(false);
            setShowReopenRequestHistoryModal(false);
            setRequestComment('');
            setSelectedSessionForRequest(null);
            handleRefresh();
        } catch (error) {
            console.error("Erro ao enviar solicitação:", error);
            alert("Erro ao enviar solicitação. Tente novamente.");
        }
    };

    const handleDeletePlanRequest = async (sessionId, comment) => {
        // Verificar se existe solicitação pendente
        const session = attendanceSessions.find(s => s.id === sessionId);
        const hasPendingRequest = session?.delete_planning_request?.some(
            request => request.status === 'pending'
        );

        if (hasPendingRequest) {
            alert("Não é possível criar nova solicitação enquanto houver uma solicitação pendente.");
            setShowDeletePlanRequestModal(false);
            setShowPlanRequestHistoryModal(false);
            return;
        }

        try {
            await api.post(`/lesson-plans/${sessionId}/request-delete`, {
                comment: comment
            });
            alert("Solicitação de exclusão enviada com sucesso!");
            setShowDeletePlanRequestModal(false);
            setShowPlanRequestHistoryModal(false);
            setRequestComment('');
            setSelectedSessionForRequest(null);
            handleRefresh();
        } catch (error) {
            console.error("Erro ao enviar solicitação:", error);
            alert("Erro ao enviar solicitação. Tente novamente.");
        }
    };

    const handleDeletePlan = async (sessionId) => {
        const adminPassword = prompt("Digite a senha do administrador para confirmar a exclusão:");
        if (adminPassword) {
            try {
                await api.delete(`/lesson-plan/${sessionId}/delete`, {
                    data: { admin_password: adminPassword }
                });
                alert("Planejamento excluído com sucesso!");
                handleRefresh();
            } catch (error) {
                console.error("Erro ao excluir planejamento:", error);
                alert("Erro ao excluir planejamento. Verifique a senha do administrador.");
            }
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

    const handleOpenLessonPlanModal = async (sessionId, courseName, date) => {
        try {
            const response = await api.get(`/lesson-plans/${sessionId}`);

            setSelectedLessonInfo({
                courseName: courseName,
                date: formatDateToBR(date)
            });

            // Acessar o content dentro do response.data
            const lessonPlanContent = JSON.parse(response.data.content);
            const formattedContent = processLessonPlanContent(JSON.stringify(lessonPlanContent));
            setSelectedLessonPlanContent(formattedContent);
            setShowLessonPlanModal(true);
        } catch (error) {
            console.error('Erro ao abrir o planejamento de aula:', error);
            alert('Erro ao carregar o planejamento de aula');
        }
    };

    const handleCloseLessonPlanModal = () => {
        setShowLessonPlanModal(false);
        setSelectedLessonPlanContent('');
    };

    const handlePrintLessonPlan = () => {
        // Criar um iframe invisível
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';

        document.body.appendChild(printFrame);

        const printContent = `
            <html>
                <head>
                    <title>Planejamento de Aula</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                        }
                        .header { margin-bottom: 20px; }
                        .lesson-info { 
                            background-color: #f5f5f5;
                            padding: 10px;
                            border-radius: 5px;
                            margin-bottom: 20px;
                        }
                        .content { margin-top: 20px; }
                        ul { list-style-type: disc; padding-left: 20px; }
                        ol { list-style-type: decimal; padding-left: 20px; }
                        li { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Planejamento de Aula</h1>
                    </div>
                    <div class="lesson-info">
                        <p><strong>Turma:</strong> ${selectedLessonInfo?.courseName || 'N/A'}</p>
                        <p><strong>Data da Aula:</strong> ${selectedLessonInfo?.date || 'N/A'}</p>
                    </div>
                    <div class="content">
                        ${selectedLessonPlanContent}
                    </div>
                </body>
            </html>
        `;

        // Escrever o conteúdo no iframe
        printFrame.contentWindow.document.open();
        printFrame.contentWindow.document.write(printContent);
        printFrame.contentWindow.document.close();

        // Esperar o carregamento do conteúdo
        printFrame.onload = () => {
            try {
                printFrame.contentWindow.print();
            } catch (error) {
                console.error('Erro ao imprimir:', error);
            } finally {
                // Remover o iframe após um curto delay
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                }, 100);
            }
        };
    };

    const handleShowDeletePlanModal = async (session) => {
        // Se não for admin e tiver solicitações, mostrar histórico
        if (Cookies.get('userType') !== 'admin' && session.delete_planning_request?.length > 0) {
            setSelectedPlanRequests(session.delete_planning_request);
            setSelectedSessionForRequest(session);
            setShowPlanRequestHistoryModal(true);
            return;
        }

        // Comportamento original para admin ou sem solicitações
        setSelectedSessionForRequest(session);
        setShowDeletePlanRequestModal(true);
        try {
            const response = await api.get(`/lesson-plans/${session.id}`);
            const lessonPlanContent = JSON.parse(response.data.content);
            const formattedContent = processLessonPlanContent(JSON.stringify(lessonPlanContent));
            setDeletePlanContent(formattedContent);
        } catch (error) {
            console.error('Erro ao carregar planejamento:', error);
            setDeletePlanContent('<p>Erro ao carregar o planejamento</p>');
        }
    };

    const getActionItems = (itemId, item) => {
        const actions = [];
        const isMobileView = window.innerWidth <= 768;
        // Alterar para pegar do Cookie ao invés do localStorage
        const userType = Cookies.get('userType');

        if (isMobileView) {
            actions.push({
                label: 'Fazer Chamada',
                action: () => {
                    if (item.status === "Closed") {
                        // Em mobile, se estiver fechada, verifica se é admin
                        if (userType === 'admin') {
                            handleReopen(itemId);
                        } else {
                            setSelectedSessionForRequest(item);
                            setShowRequestModal(true);
                        }
                    } else {
                        handleOpenModal(item);
                    }
                }
            });
        }

        if (item.status !== "Closed" && !isMobileView) {
            actions.push({
                label: 'Fazer Chamada',
                action: () => handleOpenModal(item)
            });
        }

        actions.push({
            label: 'Gerar Relatório',
            action: () => handleGenerateReport(item)
        });

        if (item.status === "Closed") {
            // Verifica se é admin usando o cookie
            if (userType === 'admin') {
                actions.unshift({
                    label: "Reabrir Chamada",
                    action: () => handleReopen(itemId)
                });
            } else {
                actions.unshift({
                    label: "Solicitar Reabertura",
                    action: () => {
                        // Verifica se tem histórico de solicitações
                        if (item.reopen_attendance_request?.length > 0) {
                            setSelectedReopenRequests(item.reopen_attendance_request);
                            setSelectedSessionForRequest(item);
                            setShowReopenRequestHistoryModal(true);
                        } else {
                            setSelectedSessionForRequest(item);
                            setShowRequestModal(true);
                        }
                    }
                });
            }
        }

        if (item.has_open_plan) {
            actions.push({
                label: 'Planejamento de Aula',
                action: () => handleOpenLessonPlanModal(itemId, item.course.name, item.date)
            });

            if (userType === 'admin') {
                actions.push({
                    label: 'Excluir Planejamento',
                    action: () => handleDeletePlan(itemId)
                });
            } else {
                actions.push({
                    label: 'Solicitar Exclusão do Planejamento',
                    action: () => handleShowDeletePlanModal(item)
                });
            }
        }

        return actions;
    };

    const columns = [
        { key: 'id', label: 'ID', type: 'number', sortable: true },
        { key: 'course', label: 'turma', type: 'string', render: (course) => course ? course.name : 'N/A', sortable: false },
        {
            key: 'date',
            label: 'Data',
            type: 'time',
            render: (date) => formatDateToBR(date),
            sortable: true
        },
        {
            key: 'start_time',
            label: 'Hora do inicio',
            type: 'time',
            render: (start_time) => {
                if (!start_time) return "N/A"
                const [hours, minutes, seconds] = start_time.split(':');
                const now = new Date();
                const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            },
            sortable: true
        },
        {
            key: 'end_time',
            label: 'Hora do término',
            type: 'time',
            render: (end_time) => {
                if (!end_time) return "N/A"
                const [hours, minutes, seconds] = end_time.split(':');
                const now = new Date();
                const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            },
            sortable: true
        },
        {
            key: "checklist",
            label: "Aberto",
            render: (value) => (
                <input
                    type="checkbox"
                    checked={!!value}
                    readOnly
                    disabled
                />
            )
        },
    ];

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

    const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

    const handlePageChange = (page) => {
        setPagination({ ...pagination, currentPage: page });
    };

    const handleItemsPerPageChange = (event) => {
        setPagination({ ...pagination, itemsPerPage: Number(event.target.value), currentPage: 1 });
    };

    const handleRefresh = useCallback(async () => {
        // Reset completo do estado para nova busca
        setFilterCourse('');
        setFilterTeacher('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterStartTime('');
        setFilterEndTime('');
        setFilterStatus('');
        setDateError('');  
        setTimeError('');  
        
        await fetchAttendanceSessions();
    }, [fetchAttendanceSessions]);

    const handleModalStateChange = (isOpen) => {
        if (isMobile) {
            setIsPaginationVisible(!isOpen);
        }
    };


    const validateDateRange = (start, end) => {
        if (!start || !end) return true;
        const [startYear, startMonth, startDay] = start.split('-');
        const [endYear, endMonth, endDay] = end.split('-');
        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        return startDate <= endDate;
    };



    const handleDateChange = (date, isStartDate) => {
        if (isStartDate) {
            if (filterEndDate && !validateDateRange(date, filterEndDate)) {
                setDateError('A data inicial não pode ser maior que a data final');
                return;
            }
            setFilterStartDate(date);
        } else {
            if (filterStartDate && !validateDateRange(filterStartDate, date)) {
                setDateError('A data final não pode ser menor que a data inicial');
                return;
            }
            setFilterEndDate(date);
        }
        setDateError('');
    };

    // Validação customizada para garantir que apenas horários válidos sejam digitados
    const handleTimeChange = (time, isStartTime) => {
        const newValue = time.replace(/[^\d]/g, '');
        let formattedValue = '';

        // Sistema de validação progressiva dos horários
        if (newValue.length > 0) {
            // Primeiro dígito: 0-2 apenas (primeiras 24h do dia)
            const firstDigit = newValue[0];
            if (!'012'.includes(firstDigit)) return;
            formattedValue = firstDigit;

            if (newValue.length > 1) {
                // Segundo dígito: 0-9 ou 0-3 se primeira hora for 2
                const secondDigit = newValue[1];
                if (firstDigit === '2' && Number(secondDigit) > 3) return;
                formattedValue += secondDigit;

                if (newValue.length > 2) {
                    // Terceiro dígito: 0-5 apenas (minutos válidos)
                    const thirdDigit = newValue[2];
                    if (Number(thirdDigit) > 5) return;
                    formattedValue = `${formattedValue}:${thirdDigit}`;

                    if (newValue.length > 3) {
                        // Quarto dígito: 0-9 (qualquer minuto)
                        formattedValue += newValue[3];
                    }
                }
            }
        }

        // Atualiza estado e valida intervalo quando horário estiver completo
        if (isStartTime) {
            setFilterStartTime(formattedValue);
        } else {
            setFilterEndTime(formattedValue);
            
            if (formattedValue.replace(/\D/g, '').length === 4 && filterStartTime) {
                const [startHour, startMinute] = filterStartTime.split(':').map(Number);
                const [endHour, endMinute] = formattedValue.split(':').map(Number);

                const startMinutes = startHour * 60 + startMinute;
                const endMinutes = endHour * 60 + endMinute;

                if (endMinutes < startMinutes) {
                    setTimeError('O horário final não pode ser menor que o horário inicial');
                } else {
                    setTimeError('');
                }
            }
        }
    };

    return (
        <div className="list-containet-tab">
            <h2>Lista de Chamadas</h2>

            <div className="filters-container">
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
                        <legend>Professor:</legend>
                        <select
                            value={filterTeacher}
                            onChange={(e) => setFilterTeacher(e.target.value)}
                        >
                            <option value="">Todos os professores</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
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
                            <option value="open">Aberto</option>
                            <option value="closed">Fechado</option>
                        </select>
                    </fieldset>
                </div>



                <div className="filter-group">
                    <fieldset>
                        <legend>Horário:</legend>
                        <div className="time-filters">
                            <input
                                type="text"
                                maxLength="5"
                                placeholder="00:00"
                                value={filterStartTime}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleTimeChange(value, true);
                                }}
                            />
                            <span>até</span>
                            <input
                                type="text"
                                maxLength="5"
                                placeholder="00:00"
                                value={filterEndTime}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleTimeChange(value, false);
                                }}
                            />
                        </div>
                        {timeError && <div className="date-error">{timeError}</div>}
                    </fieldset>
                </div>


                <div className="filter-group">
                    <fieldset>
                        <legend>Período:</legend>
                        <div className="date-range">
                            <CustomDatePicker
                                value={filterStartDate}
                                onChange={(date) => handleDateChange(date, true)}
                                placeholder="Inicial"
                                className="date-picker-compact"
                            />
                            <span className="date-separator">até</span>
                            <CustomDatePicker
                                value={filterEndDate}
                                onChange={(date) => handleDateChange(date, false)}
                                placeholder="Final"
                                className="date-picker-compact"
                            />
                        </div>
                        {dateError && <div className="date-error">{dateError}</div>}
                    </fieldset>
                </div>

                <div>
                    <button
                        className="refresh-button"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingSpinner size="20px" /> : <><FaSync /> Atualizar</>}
                    </button>
                </div>

            </div>

            {error && <div className="error-message">{error}</div>}

            <Table
                data={attendanceSessions}
                columns={columns}
                itemsPerPage={pagination.itemsPerPage}
                isSortable={true}
                loading={isLoading}
                error={error}
                getActionItems={(itemId, item) => getActionItems(itemId, item)}
                handleSort={handleSort}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onModalStateChange={handleModalStateChange}
            />

            {isPaginationVisible && (
                <>
                    <div className="pagination">
                        <button onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1}>{"<<"}</button>
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>{"<"}</button>
                        <span>Página {pagination.currentPage} de {totalPages}</span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === totalPages}>{">"}</button>
                        <button onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.currentPage === totalPages}>{">>"}</button>
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
                </>
            )}

            {showModal && selectedSession && (
                <EditAttendanceModal
                    session={selectedSession.id}
                    onClose={handleCloseModal}
                    onSave={(updatedData) => {
                        setAttendanceSessions(
                            attendanceSessions.map((s) =>
                                s.id === selectedSession.id ? { ...s, ...updatedData } : s
                            )
                        );
                        handleCloseModal();
                        handleRefresh();
                    }}
                    appElement={modalRoot}
                />
            )}
            {showPdfModal && pdfUrl && (
                <Modal
                    isOpen={showPdfModal}
                    onRequestClose={closePdfModal}
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
            {showLessonPlanModal && (
                <Modal
                    isOpen={showLessonPlanModal}
                    onRequestClose={handleCloseLessonPlanModal}
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
                    <button onClick={handlePrintLessonPlan} className="print-button">Imprimir</button>
                </Modal>
            )}
            {showRequestModal && (
                <Modal
                    isOpen={showRequestModal}
                    onRequestClose={() => {
                        setShowRequestModal(false);
                        setRequestComment('');
                        setSelectedSessionForRequest(null);
                    }}
                    contentLabel="Solicitar Reabertura de Chamada"
                    className="request-modal"
                    overlayClassName="request-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Solicitar Reabertura de Chamada</h2>
                    <div className="session-info">
                        <p><strong>Turma:</strong> {selectedSessionForRequest?.course?.name || 'N/A'}</p>
                        <p><strong>Data:</strong> {formatDateToBR(selectedSessionForRequest?.date)}</p>
                        {selectedSessionForRequest?.start_time && (
                            <p><strong>Horário:</strong> {selectedSessionForRequest.start_time} - {selectedSessionForRequest.end_time}</p>
                        )}
                    </div>
                    <textarea
                        value={requestComment}
                        onChange={(e) => setRequestComment(e.target.value)}
                        placeholder="Comentário (opcional)"
                    />
                    {!selectedSessionForRequest?.reopen_attendance_request?.some(request => request.status === 'pending') && (
                        <div className="modal-buttons">
                            <button onClick={() => handleRequestReopen(selectedSessionForRequest.id, requestComment)}>
                                Enviar Solicitação
                            </button>
                            <button onClick={() => setShowRequestModal(false)}>Cancelar</button>
                        </div>
                    )}
                </Modal>
            )}

            {showDeletePlanRequestModal && (
                <Modal
                    isOpen={showDeletePlanRequestModal}
                    onRequestClose={() => {
                        setShowDeletePlanRequestModal(false);
                        setRequestComment('');
                        setSelectedSessionForRequest(null);
                        setDeletePlanContent('');
                        setActiveTab('request');
                    }}
                    contentLabel="Solicitar Exclusão do Planejamento"
                    className="request-modal delete-plan-modal"
                    overlayClassName="request-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Solicitar Exclusão do Planejamento</h2>
                    <div className="session-info">
                        <p><strong>Turma:</strong> {selectedSessionForRequest?.course?.name || 'N/A'}</p>
                        <p><strong>Data:</strong> {formatDateToBR(selectedSessionForRequest?.date)}</p>
                        {selectedSessionForRequest?.start_time && (
                            <p><strong>Horário:</strong> {selectedSessionForRequest.start_time} - {selectedSessionForRequest.end_time}</p>
                        )}
                    </div>
                    
                    <div className="tabs">
                        <button 
                            className={`tab-button ${activeTab === 'request' ? 'active' : ''}`}
                            onClick={() => setActiveTab('request')}
                        >
                            Solicitação
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preview')}
                        >
                            Visualizar Planejamento
                        </button>
                    </div>

                    {activeTab === 'request' ? (
                        <div className="tab-content">
                            <textarea
                                value={requestComment}
                                onChange={(e) => setRequestComment(e.target.value)}
                                placeholder="Comentário (opcional)"
                            />
                            <div className="modal-buttons">
                                <button onClick={() => handleDeletePlanRequest(selectedSessionForRequest.id, requestComment)}>
                                    Enviar Solicitação
                                </button>
                                <button onClick={() => setShowDeletePlanRequestModal(false)}>Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="tab-content preview-content">
                            <div dangerouslySetInnerHTML={{ __html: deletePlanContent }} />
                        </div>
                    )}
                </Modal>
            )}

            {showPlanRequestHistoryModal && (
                <Modal
                    isOpen={showPlanRequestHistoryModal}
                    onRequestClose={() => setShowPlanRequestHistoryModal(false)}
                    contentLabel="Histórico de Solicitações"
                    className="request-modal"
                    overlayClassName="request-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Histórico de Solicitações de Exclusão</h2>
                    <div className="session-info">
                        <p><strong>Turma:</strong> {selectedSessionForRequest?.course?.name || 'N/A'}</p>
                        <p><strong>Data:</strong> {formatDateToBR(selectedSessionForRequest?.date)}</p>
                    </div>
                    
                    <div className="requests-history">
                        {selectedPlanRequests.map((request, index) => (
                            <div key={index} className="request-item">
                                <p><strong>Status:</strong> {
                                    request.status === 'pending' ? 'Pendente' :
                                    request.status === 'approved' ? 'Aprovado' :
                                    request.status === 'rejected' ? 'Rejeitado' : 'Desconhecido'
                                }</p>
                                <p><strong>Data da Solicitação:</strong> {new Date(request.created_at).toLocaleString('pt-BR')}</p>
                                {request.updated_at !== request.created_at && (
                                    <p><strong>{request.status === 'rejected' ? 'Data da rejeição' : 'Data da resposta'}:</strong> {new Date(request.updated_at).toLocaleString('pt-BR')}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Só mostra seção de nova solicitação se não houver solicitações pendentes */}
                    {selectedPlanRequests.some(request => request.status === 'rejected') && 
                     !selectedPlanRequests.some(request => request.status === 'pending') && (
                        <div className="new-request-section">
                            <h3>Fazer Nova Solicitação</h3>
                            <textarea
                                value={requestComment}
                                onChange={(e) => setRequestComment(e.target.value)}
                                placeholder="Comentário para nova solicitação"
                            />
                            <div className="modal-buttons">
                                <button onClick={() => {
                                    handleDeletePlanRequest(selectedSessionForRequest.id, requestComment);
                                    setShowPlanRequestHistoryModal(false);
                                }}>
                                    Enviar Nova Solicitação
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            {showReopenRequestHistoryModal && (
                <Modal
                    isOpen={showReopenRequestHistoryModal}
                    onRequestClose={() => setShowReopenRequestHistoryModal(false)}
                    contentLabel="Histórico de Solicitações de Reabertura"
                    className="request-modal"
                    overlayClassName="request-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Histórico de Solicitações de Reabertura</h2>
                    <div className="session-info">
                        <p><strong>Turma:</strong> {selectedSessionForRequest?.course?.name || 'N/A'}</p>
                        <p><strong>Data:</strong> {formatDateToBR(selectedSessionForRequest?.date)}</p>
                        {selectedSessionForRequest?.start_time && (
                            <p><strong>Horário:</strong> {selectedSessionForRequest.start_time} - {selectedSessionForRequest.end_time}</p>
                        )}
                    </div>
                    
                    <div className="requests-history">
                        {selectedReopenRequests.map((request, index) => (
                            <div key={index} className="request-item">
                                <p><strong>Status:</strong> {
                                    request.status === 'pending' ? 'Pendente' :
                                    request.status === 'approved' ? 'Aprovado' :
                                    request.status === 'rejected' ? 'Rejeitado' : 'Desconhecido'
                                }</p>
                                <p><strong>Data da Solicitação:</strong> {new Date(request.created_at).toLocaleString('pt-BR')}</p>
                                {request.updated_at !== request.created_at && (
                                    <p><strong>{request.status === 'rejected' ? 'Data da rejeição' : 'Data da resposta'}:</strong> {new Date(request.updated_at).toLocaleString('pt-BR')}</p>
                                )}
                                {request.comment && (
                                    <p><strong>Comentário:</strong> {request.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Só mostra seção de nova solicitação se não houver solicitações pendentes */}
                    {selectedReopenRequests.some(request => request.status === 'rejected') && 
                     !selectedReopenRequests.some(request => request.status === 'pending') && (
                        <div className="new-request-section">
                            <h3>Fazer Nova Solicitação</h3>
                            <textarea
                                value={requestComment}
                                onChange={(e) => setRequestComment(e.target.value)}
                                placeholder="Comentário para nova solicitação"
                            />
                            <div className="modal-buttons">
                                <button onClick={() => {
                                    handleRequestReopen(selectedSessionForRequest.id, requestComment);
                                    setShowReopenRequestHistoryModal(false);
                                }}>
                                    Enviar Nova Solicitação
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}

export default AttendanceRecords;