/**
 * Componente LessonPlan
 * Gerencia o planejamento de aulas, permitindo criar e vincular planejamentos a chamadas.
 * Inclui editor de texto rico, controle de caracteres e listagem de chamadas disponíveis.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import api from '../../../services/api';
import { FaSync } from 'react-icons/fa';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import "./LessonPlan.css";


const LessonPlan = () => {
    const editorInstance = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [filterCourse, setFilterCourse] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [courses, setCourses] = useState([]);
    const isMounted = useRef(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const [charCount, setCharCount] = useState(0);
    const MAX_CHARS = 8000;
    const [availableCalls, setAvailableCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCalls, setSelectedCalls] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 4
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Formata a data do formato ISO para DD/MM/YYYY
     */
    const formatDate = (dateString) => {
        try {
            const [date,] = dateString.split('T');
            const [year, month, day] = date.split('-');
            return `${day}/${month}/${year} `;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dateString;
        }
    };

    const handleCallSelection = (callId) => {
        if (selectedCalls.includes(callId)) {
            setSelectedCalls(selectedCalls.filter(id => id !== callId));
        } else {
            setSelectedCalls([...selectedCalls, callId]);
        }
    };

    const handleNextPage = () => {
        if (currentPage < pagination.totalPages) {
            fetchCalls(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            fetchCalls(currentPage - 1);
        }
    };

    const handleFirstPage = () => {
        fetchCalls(1);
    };

    const handleLastPage = () => {
        fetchCalls(pagination.totalPages);
    };

    const handleRefresh = async () => {
        await fetchCalls(currentPage);
    };

    /**
     * Busca chamadas com filtros aplicados
     */
    const fetchCalls = useCallback(async (page = 1) => {
        try {
            if (!isMounted.current) return;
            setLoading(true);
            const params = {
                page,
                limit: 5,
            };
            if (filterCourse) {
                params.course_id = filterCourse;
                params.page = 1;
            }
            if (filterPlan === 'withPlan') {
                params.has_open_plan = true;
            } else if (filterPlan === 'withoutPlan') {
                params.has_open_plan = false;
            }
            const response = await api.get('/attendances/sessions', { params });

            let formattedCalls = response.data.data.map(session => ({
                id: session.id,
                name: session.course.name,
                date: session.date,
                courseName: session.course.name,
                status: session.status,
                startTime: session.start_time,
                endTime: session.end_time,
                checklist: true,
                has_open_plan: session.has_open_plan
            }));

            if (isMounted.current) {
                setAvailableCalls(formattedCalls);
                setLoading(false);
                setPagination(response.data.pagination);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Erro ao buscar chamadas:', error);
            setLoading(false);
        }
    }, [filterCourse, filterPlan]);

    // Efeito para buscar oficinas
    useEffect(() => {
        isMounted.current = true;
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses/index');
                if (isMounted.current) {
                    setCourses(response.data.data);
                }
            } catch (error) {
                console.error("Erro ao buscar turmas:", error);
            }
        };

        fetchCourses();
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Efeito para atualizar chamadas quando os filtros mudarem
    useEffect(() => {
        if (isMounted.current) {
            fetchCalls();
        }
    }, [fetchCalls]);

    useEffect(() => {
        let editor;

        const initializeEditor = () => {
            editor = new EditorJS({
                holder: 'editorjs',
                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: true,
                        config: {
                            placeholder: 'Cabeçalho',
                            levels: [2, 3, 4],
                            defaultLevel: 2
                        }
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                        config: {
                            placeholder: 'Lista'
                        }
                    }
                },
                data: {
                    blocks: [
                        {
                            type: "paragraph",
                            data: {
                            }
                        }
                    ]
                },
                onReady: () => {
                    // Remover qualquer formatação HTML residual
                    const editorElement = document.getElementById('editorjs');
                    if (editorElement) {
                        const paragraphs = editorElement.getElementsByTagName('p');
                        Array.from(paragraphs).forEach(p => {
                            p.innerHTML = p.textContent;
                        });
                    }
                },
                onChange: async () => {
                    try {
                        const savedData = await editor.save();
                        const text = savedData.blocks.reduce((acc, block) => {
                            return acc + (block.data.text || '') + ' ';
                        }, '');

                        // Se exceder o limite máximo
                        if (text.length > MAX_CHARS) {
                            // Encontra o último bloco que contém texto
                            const lastBlockWithText = [...savedData.blocks].reverse()
                                .find(block => block.data.text && block.data.text.length > 0);

                            if (lastBlockWithText) {
                                // Mantém o texto no limite exato de MAX_CHARS caracteres
                                const excessChars = text.length - MAX_CHARS;
                                const updatedBlocks = savedData.blocks.map(block => {
                                    if (block === lastBlockWithText) {
                                        return {
                                            ...block,
                                            data: {
                                                ...block.data,
                                                text: lastBlockWithText.data.text.slice(0, -(excessChars))
                                            }
                                        };
                                    }
                                    return block;
                                });

                                // Renderiza o conteúdo atualizado
                                editor.render({ blocks: updatedBlocks });
                                setCharCount(MAX_CHARS);
                            }
                        } else {
                            setCharCount(text.length);
                        }
                    } catch (error) {
                        console.error('Erro ao contar caracteres:', error);
                    }
                },
                placeholder: 'Comece a escrever seu planejamento...',
                i18n: {
                    messages: {
                        ui: {
                            blockTunes: {
                                toggler: {
                                    "Click to tune": "Clique para ajustar",
                                    "or drag to move": "ou arraste para mover"
                                },
                            },
                            inlineToolbar: {
                                converter: {
                                    "Convert to": "Converter para"
                                }
                            },
                            toolbar: {
                                toolbox: {
                                    Add: "Adicionar"
                                }
                            }
                        },
                        toolNames: {
                            Text: "Texto",
                            Heading: "Cabeçalho",
                            List: "Lista",
                            Warning: "Aviso",
                            Checklist: "Lista de Verificação",
                            Quote: "Citação",
                            Code: "Código",
                            Delimiter: "Delimitador",
                            Raw: "HTML Bruto",
                            Table: "Tabela",
                            Link: "Link",
                            Marker: "Marcador",
                            Bold: "Negrito",
                            Italic: "Itálico",
                            InlineCode: "Código Inline",
                            UnorderedList: "Lista não ordenada",
                            OrderedList: "Lista ordenada"
                        },
                        tools: {
                            warning: {
                                Title: "Título",
                                Message: "Mensagem"
                            },
                            link: {
                                "Add a link": "Adicionar um link"
                            },
                            stub: {
                                'The block can not be displayed correctly.': 'O bloco não pode ser exibido corretamente.'
                            }
                        },
                        blockTunes: {
                            delete: {
                                "Delete": "Excluir"
                            },
                            moveUp: {
                                "Move up": "Mover para cima"
                            },
                            moveDown: {
                                "Move down": "Mover para baixo"
                            }
                        }
                    }
                }
            });
            editorInstance.current = editor;
            setIsEditorReady(true);
        };

        const destroyEditor = () => {
            if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
                editorInstance.current.destroy();
                editorInstance.current = null;
                setIsEditorReady(false);
            }
        };

        const editorElement = document.getElementById('editorjs');

        if (editorElement) {
            if (!isEditorReady) {
                initializeEditor();
            }
        } else {
            const observer = new MutationObserver(() => {
                const editorElement = document.getElementById('editorjs');
                if (editorElement && !isEditorReady) {
                    initializeEditor();
                    observer.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            return () => observer.disconnect();
        }

        return destroyEditor;
    }, [isEditorReady]);

    /**
     * Salva o planejamento e vincula às chamadas selecionadas
     */
    const handleSavePlan = async () => {
        if (editorInstance.current) {
            try {
                // Obter o conteúdo do editor primeiro para validação
                const contentData = await editorInstance.current.save();
                
                // Verifica se há algum texto no planejamento
                const hasContent = contentData.blocks.some(block => 
                    block.data.text && block.data.text.trim().length > 0
                );

                if (!hasContent) {
                    setSaveMessage({
                        type: 'error',
                        text: 'Por favor, escreva o planejamento antes de vincular às chamadas.'
                    });
                    return;
                }

                setIsSaving(true);
                setSaveMessage(null);

                // Preparar o payload
                const payload = {
                    content: JSON.stringify(contentData),
                    char_count: charCount,
                    sessions: selectedCalls.map(callId => ({
                        attendance_session_id: callId
                    }))
                };

                console.log('Enviando planejamento:', payload);

                // Enviar para o backend
                const response = await api.post('/lesson-plans', payload);

                if (response.status === 201 || response.status === 200) {
                    setSaveMessage({
                        type: 'success',
                        text: `Planejamento vinculado com sucesso a ${selectedCalls.length} chamada(s)!`
                    });

                    // Limpar o editor e seleções
                    editorInstance.current.clear();
                    setSelectedCalls([]);
                    setCharCount(0);

                    // Atualizar a lista de chamadas
                    fetchCalls(currentPage);
                }

            } catch (error) {
                console.error('Erro ao salvar planejamento:', error);
                setSaveMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Erro ao vincular o planejamento. Tente novamente.'
                });
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div className="lesson-plan-container">
            <div className="lesson-plan-content">
                <div className="plan-area">
                    <div className="plan-header">
                        <div className="plan-header-left">
                            <h2>Planejamento de Aula</h2>
                            <div className="char-counter">
                                <span className={charCount > MAX_CHARS * 0.9 ? "char-warning" : ""}>
                                    {charCount}/{MAX_CHARS} caracteres
                                </span>
                            </div>
                        </div>
                        <div className="plan-actions">
                            <button
                                className="save-plan-button"
                                onClick={handleSavePlan}
                                disabled={isSaving || selectedCalls.length === 0 || charCount === 0}
                            >
                                {isSaving ? 'Salvando...' : 'Vincular Planejamento'}
                            </button>
                        </div>
                    </div>
                    {saveMessage && (
                        <div className={`save-message ${saveMessage.type}`}>
                            {saveMessage.text}
                        </div>
                    )}
                    <div id="editorjs" className="editor-container" placeholder="Comece a escrever seu planejamento..."></div>
                    {charCount > MAX_CHARS * 0.9 && (
                        <div className="char-limit-warning">
                            {charCount >= MAX_CHARS
                                ? "Limite máximo de caracteres atingido!"
                                : "Próximo ao limite máximo de caracteres!"}
                        </div>
                    )}
                </div>

                {/* Right Side - Filters and Calls List */}
                <div className="sidebar-area">
                    <div className="filters-refresh-container">
                        <div className="filters-container">
                            <div className="filter-group mobile-full-width">
                                <fieldset>
                                    <legend>Turma:</legend>
                                    <select
                                        id="filter-course"
                                        value={filterCourse}
                                        onChange={(e) => setFilterCourse(e.target.value)}
                                    >
                                        <option value="">Todas as turmas</option>
                                        {Array.isArray(courses) && courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>

                            <div className="filter-group mobile-full-width">
                                <fieldset>
                                    <legend>Planejamento:</legend>
                                    <select
                                        id="filter-plan"
                                        value={filterPlan}
                                        onChange={(e) => setFilterPlan(e.target.value)}
                                    >
                                        <option value="all">Todos</option>
                                        <option value="withPlan">Com planejamento</option>
                                        <option value="withoutPlan">Sem planejamento</option>
                                    </select>
                                </fieldset>
                            </div>
                            <button
                                className="refresh-button mobile-full-width"
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                {loading ? 'Carregando...' : <><FaSync /> Atualizar</>}
                            </button>
                        </div>
                    </div>

                    <div className="calls-area">
                        <h2>Vincular Chamadas</h2>
                        {loading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                {availableCalls.length > 0 ? (
                                    <div className="calls-list">
                                        {availableCalls.map(call => (
                                            <div key={call.id} className={`call-item ${call.has_open_plan ? 'call-item-disabled' : ''}`}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCalls.includes(call.id)}
                                                        onChange={() => handleCallSelection(call.id)}
                                                        disabled={call.has_open_plan}
                                                    />
                                                    <div className="call-info">
                                                        <div className="call-header">
                                                            <span className={`course-name ${call.has_open_plan ? 'strikethrough' : ''}`}>
                                                                {call.name}
                                                            </span>
                                                        </div>
                                                        <div className="call-details">
                                                            <span className={`call-date ${call.has_open_plan ? 'strikethrough' : ''}`}>
                                                                {formatDate(call.date)}
                                                            </span>
                                                            <span className={`call-time ${call.has_open_plan ? 'strikethrough' : ''}`}>
                                                                {call.startTime} - {call.endTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-calls">Nenhuma chamada aberta disponível</div>
                                )}

                                {pagination.totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="pagination-button"
                                            onClick={handleFirstPage}
                                            disabled={currentPage === 1}
                                        >
                                            {"<<"}
                                        </button>
                                        <button
                                            className="pagination-button"
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                        >
                                            {"<"}
                                        </button>
                                        <span className="page-info">
                                            Página {currentPage} de {pagination.totalPages}
                                        </span>
                                        <button
                                            className="pagination-button"
                                            onClick={handleNextPage}
                                            disabled={currentPage === pagination.totalPages}
                                        >
                                            {">"}
                                        </button>
                                        <button
                                            className="pagination-button"
                                            onClick={handleLastPage}
                                            disabled={currentPage === pagination.totalPages}
                                        >
                                            {">>"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlan;