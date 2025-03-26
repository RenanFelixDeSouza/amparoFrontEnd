/**
 * Componente AddCourse
 * Gerencia a criação de novas turmas com seleção de professores e alunos
 */

import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import {
  FaChalkboardTeacher,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import "./AddCourse.css";

function AddCourse() {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedProfessors, setSelectedProfessors] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(15);
  const [totalStudents, setTotalStudents] = useState(0);
  const [FilteredStudentsByCategory, setFilteredStudentsByCategory] = useState([]); // eslint-disable-line
  const [selectedProfessorCategories, setSelectedProfessorCategories] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);

  const daysOfWeek = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
  const daysOfWeekMapping = {
    "Segunda-feira": 1,
    "Terça-feira": 2,
    "Quarta-feira": 3,
    "Quinta-feira": 4,
    "Sexta-feira": 5,
    "Sábado": 6,
    "Domingo": 7,
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    setFilteredStudentsByCategory(
      students.filter((student) =>
        `${student.first_name} ${student.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [students, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /**
   * Busca dados iniciais (professores e alunos)
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [, professorsResponse, studentsResponse] = await Promise.all([
          api.get("/categories/index"),
          api.get("/users/index-with-categories?type=professor"),
          api.get("/students/index-with-categories", {
            params: {
              page: currentPage,
              per_page: studentsPerPage,
              search: searchTerm,
              category_id: categoryId || undefined,
            },
          }),
        ]);

        setProfessors(professorsResponse.data);
        setStudents(studentsResponse.data.data);
        setTotalStudents(studentsResponse.data.meta.total);
        setError("");
      } catch (error) {
        setError("Erro ao carregar dados do formulário.");
      }
    };

    loadData();
  }, [currentPage, studentsPerPage, searchTerm, categoryId]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    // Filter students based on search term (now applied to the already category-filtered data)
    const filteredBySearch = students.filter((student) => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
    setFilteredStudentsByCategory(filteredBySearch);
  }, [students, searchTerm]);

  const loadCategoriesForProfessor = React.useCallback(async (professorId) => {
    try {
      const response = await api.get(`/professors/${professorId}/categories`);
      // Criar um Map para armazenar categorias únicas
      const uniqueCategoriesMap = new Map();
      
      response.data.forEach(category => {
        if (!uniqueCategoriesMap.has(category.id)) {
          uniqueCategoriesMap.set(category.id, {
            id: category.id,
            name: category.name
          });
        }
      });

      const uniqueCategories = Array.from(uniqueCategoriesMap.values());

      setSelectedProfessorCategories(prevCategories => ({
        ...prevCategories,
        [professorId]: uniqueCategories
      }));

      if (uniqueCategories.length > 0 && !categoryId) {
        setCategoryId(uniqueCategories[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias do professor:", error);
    }
  }, [categoryId]);

  useEffect(() => {
    selectedProfessors.forEach((professorId) => {
      loadCategoriesForProfessor(professorId);
    });
  }, [selectedProfessors, loadCategoriesForProfessor]);

  const handleProfessorChange = (professorId) => {
    setSelectedProfessors((prevSelected) => {
      if (prevSelected.includes(professorId)) {
        // Remove professor e suas categorias
        const updatedCategories = { ...selectedProfessorCategories };
        delete updatedCategories[professorId];
        setSelectedProfessorCategories(updatedCategories);
        return prevSelected.filter((id) => id !== professorId);
      } else {
        // Adiciona professor e carrega suas categorias
        loadCategoriesForProfessor(professorId);
        return [...prevSelected, professorId];
      }
    });
  };

  const handleStudentChange = (student) => {
    setSelectedStudents((prevSelected) => {
      const alreadySelected = prevSelected.some((s) => s.id === student.id);
      if (alreadySelected) {
        return prevSelected.filter((s) => s.id !== student.id);
      } else {
        return [...prevSelected, student];
      }
    });
  };

  const handleDayChange = (day) => {
    setSelectedDays((prevSelected) => {
      if (prevSelected.includes(day)) {
        return prevSelected.filter((d) => d !== day);
      } else {
        return [...prevSelected, day];
      }
    });
  };

  /**
   * Salva nova turma
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProfessors.length === 0) {
      setError("Selecione pelo menos um professor.");
      return;
    }

    try {
      const response = await api.post("/courses/store", {
        name: name,
        category_id: categoryId,
        professor_ids: selectedProfessors,
        student_ids: selectedStudents.map(student => student.id),
        week_id: selectedDays.map(day => daysOfWeekMapping[day]), 
      });

      if (response.status === 201) {
        setSuccess("Oficina criada com sucesso!");
        resetForm();
      } else {  
        // Check if the response has a message property
        if (response.data && response.data.message) {
          setError(response.data.message);
        } else if (typeof response.data === 'string') { 
          setError(response.data);
        } else {
          setError("Erro ao criar oficina. Resposta do servidor inválida.");
        }
      }
      window.scrollTo(0, 0);
    } catch (error) {
      window.scrollTo(0, 0);
      console.error("Erro ao criar oficina:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.response && typeof error.response.data === 'string') {
        setError(error.response.data);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Erro ao criar oficina. Verifique os dados e tente novamente.");
      }
    }
  };

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setSelectedProfessors([]);
    setSelectedStudents([]);
    setSelectedProfessorCategories({});
    setSearchTerm("");
    setSelectedDays([]);
    setSuccess("");
  };

  const removeStudentFromPreview = (studentId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.filter((student) => student.id !== studentId)
    );
  };

  const handleDeselectAllStudents = () => {
    setSelectedStudents([]);
  };

  return (
    <div className="create-course-container">
      <h2>Criar Nova Turma</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="course-name">Nome da Oficina:</label>
            <input
              type="text"
              id="course-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Oficina:</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setCurrentPage(1);
              }}
              required
            >
              <option value="">Selecione uma Oficina</option>
              {Array.from(new Set(
                selectedProfessors.flatMap(professorId =>
                  selectedProfessorCategories[professorId]?.map(category => 
                    JSON.stringify({id: category.id, name: category.name})
                  ) || []
                )
              )).map(categoryStr => {
                const category = JSON.parse(categoryStr);
                return (
                  <option key={`cat-${category.id}`} value={category.id}>
                    {category.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="form-group">
          <fieldset>
            <legend className="color:black;">
              {" "}
              <FaChalkboardTeacher /> Professores:
            </legend>
            <div className="checkbox-group" style={{ textAlign: "center" }}>
              {professors.map((professor) => (
                <div key={professor.professor.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedProfessors.includes(
                        professor.professor.id
                      )}
                      onChange={() =>
                        handleProfessorChange(professor.professor.id)
                      }
                    />
                    {professor.user_name}
                  </label>

                  {/* Render categories only if professor is selected */}

                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset>
          <legend>Dias da Semana:</legend>
          <div className="category-checkbox-item">
            {daysOfWeek.map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </fieldset>
        
        <fieldset>
          <div className="form-group">
            <legend>
              <FaUsers /> Alunos:
            </legend>
            <label htmlFor="student-search">Buscar Aluno:</label>
            <input
              type="text"
              id="student-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para buscar..."
            />
          </div>

          <div className="form-group">
            <label>Alunos:</label>
            <div className="students-list">
              {filteredStudents.map((student) => (
                <label key={student.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStudents.some((s) => s.id === student.id)}
                    onChange={() => handleStudentChange(student)}
                  />
                  {student.first_name} {student.last_name}
                </label>
              ))}
            </div>
          </div>

          {/* Controles de Paginação */}
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage <= 1}
              className="pagination-button"
              type="button"
            >
              {"<"}
            </button>
            <span>
              Página {currentPage} de {Math.ceil(totalStudents / studentsPerPage)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalStudents / studentsPerPage)}
              className="pagination-button"
              type="button"
            >
              {">"}
            </button>
          </div>

          <div className="items-per-page-selector">
            <label htmlFor="itemsPerPage">Itens por página: </label>
            <select
              id="itemsPerPage"
              value={studentsPerPage}
              onChange={(e) => setStudentsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          {/* Selected Students Preview */}
          <div className="form-group">
            <div className="modal-buttons">
            <button type="button" onClick={handleDeselectAllStudents}>
              Remover Todos
            </button>
            </div>
            <label>Alunos Selecionados:</label>
            <div className="selected-students-preview-create">
              {selectedStudents.length > 0 ? (
                selectedStudents.map((student) => (
                  <div key={student.id} className="student-name">
                    <span>
                      {student.first_name} {student.last_name}
                    </span>
                    <button
                      className="remove-student"
                      onClick={() => removeStudentFromPreview(student.id)}
                    >
                      Remover <FaTimes />
                    </button>
                  </div>
                ))
              ) : (
                <p>Nenhum aluno selecionado.</p>
              )}
            </div>
          </div>
        </fieldset>

        <button type="submit">Criar Oficina</button>
      </form>
    </div>
  );
}

export default AddCourse;