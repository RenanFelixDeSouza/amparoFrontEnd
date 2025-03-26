/**
 * Componente EditCourseModal
 * Modal para edição de dados de uma turma
 */

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { FaChalkboardTeacher } from 'react-icons/fa';
import './EditCourseModal.css';

function EditCourseModal({ course, onClose, onSave, fetchCourses }) {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [selectedProfessors, setSelectedProfessors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [error, setError] = useState('');
    const [professorCategories, setProfessorCategories] = useState({}); // eslint-disable-line

    /**
     * Carrega dados iniciais para edição
     */
    useEffect(() => {
        const loadData = async () => {
            try {
                const [categoriesResponse, professorsResponse] = await Promise.all([
                    api.get("/categories/index"),
                    api.get("/users/index-with-categories?type=professor", {
                        params: {
                            category_id: categoryId,
                        },
                    }),
                ]);

                setCategories(categoriesResponse.data.data);
                setProfessors(professorsResponse.data);
                setError("");
            } catch (error) {
                setError("Erro ao carregar dados do formulário.");
            }
        };

        loadData();
    }, [ categoryId]);

    useEffect(() => {
        if (course && course.id) {
            setName(course.name);
            setCategoryId(course.category ? course.category.id : '');
            setSelectedProfessors(Array.isArray(course.professors) ? course.professors.map(p => p.id) : []);

            const loadProfessorCategories = () => {
                const categories = {};

                for (const professor of course.professors) {
                    if (professor.categories && professor.categories.length > 0) {
                        categories[professor.id] = professor.categories.map(cat => cat.id);
                    } else {
                        categories[professor.id] = [];
                    }
                }

                setProfessorCategories(categories);
            };

            loadProfessorCategories();
        }
    }, [course]);

    const handleProfessorChange = professorId => {
        setSelectedProfessors(prevSelected => {
            if (prevSelected.includes(professorId)) {
                return prevSelected.filter(id => id !== professorId);
            } else {
                return [...prevSelected, professorId];
            }
        });
    };

    /**
     * Atualiza dados da turma
     */
    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        if (selectedProfessors.length < 1) {
            setError('Oficina não pode ser editada sem professores.');
            return;
        }
        try {
            const response = await api.put(`/courses/${course.id}/update`, {
                name: name,
                category_id: categoryId,
                professor_ids: selectedProfessors,
            });

            if (response.status === 200) {
                alert('Oficina atualizada com sucesso!');
                onSave(response.data);
                onClose();
                fetchCourses();
            } else {
                const errorData = response.data;
                if (errorData && errorData.message) {
                    setError(errorData.message);
                } else if (errorData) {
                    const errorKeys = Object.keys(errorData);
                    const errorMessages = errorKeys.map(key => errorData[key].join('\n'));
                    setError(errorMessages.join('\n'));
                } else {
                    setError('Erro ao atualizar a oficina.');
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar a oficina:', error);
            setError('Erro ao atualizar a oficina. Verifique os dados ou a conexão.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal">
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <button className="close-button" onClick={onClose}>
                            &times;
                        </button>
                        <h2 style={{ textAlign: "center" }}>Editar oficina</h2>
                    </div>

                    <div className="modal-body">
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group-inline">
                                <div className="form-group">
                                    <label htmlFor="course-name">Nome da oficina:</label>
                                    <input
                                        type="text"
                                        id="course-name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Oficina:</label>
                                    <select
                                        id="category"
                                        value={categoryId}
                                        disabled
                                        required
                                    >
                                        <option value="">Selecione uma Oficina</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <fieldset>
                                    <legend>
                                        <FaChalkboardTeacher /> Professores:
                                    </legend>
                                    <div className="category-checkbox-group">
                                        {professors.map(professor => (
                                            <label
                                            className='category-checkbox-item'
                                            key={professor.professor.id} style={{ alignItems: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    disabled
                                                    checked={selectedProfessors.includes(professor.professor.id)}
                                                    onChange={() => handleProfessorChange(professor.professor.id)}
                                                />
                                                {professor.user_name}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditCourseModal;