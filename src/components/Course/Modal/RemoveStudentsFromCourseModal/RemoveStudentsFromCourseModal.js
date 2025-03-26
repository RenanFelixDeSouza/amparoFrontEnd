/**
 * Componente RemoveStudentsFromCourseModal
 * Modal para remover alunos de uma turma
 */

import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import "./RemoveStudentsFromCourseModal.css";

function RemoveStudentsFromCourseModal({ course, onClose, onSave }) {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  });

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

  /**
   * Remove alunos selecionados da turma
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.delete(`/courses/${course.id}/remove-students`, {
        data: {
          student_ids: selectedStudents.map((student) => student.id),
        },
      });
      onSave(selectedStudents);
      onClose();
    } catch (error) {
      console.error("Erro ao remover alunos:", error);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const paginateData = (data) => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const filteredStudents = course.students.filter(student =>
    `${student.first_name} ${student.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / pagination.itemsPerPage);
  const paginatedStudents = paginateData(filteredStudents);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalPages: totalPages,
      totalItems: filteredStudents.length
    })); 
  }, [filteredStudents.length, totalPages]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-button" onClick={onClose}>&times;</button>
          <h2>Remover Alunos</h2>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="search-container">
              <input
                type="text"
                placeholder="Pesquisar alunos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>

            <div className="form-group">
              <label>Alunos: </label>
              <div className="students-list">
                {paginatedStudents.map((student) => (
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

            <div className="pagination">
              <button type="button" onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1}>{"<<"}</button>
              <button type="button" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>{"<"}</button>
              <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
              <button type="button" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === totalPages}>{">"}</button>
              <button type="button" onClick={() => handlePageChange(totalPages)} disabled={pagination.currentPage === totalPages}>{">>"}</button>
            </div>

            <div className="modal-buttons">
              <button type="button" onClick={onClose}>Cancelar</button>
              <button type="submit" disabled={selectedStudents.length === 0}>Remover</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RemoveStudentsFromCourseModal;