import React, { useState } from 'react';
import api from '../../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function CourseReport({ onGenerateReport }) {
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/index');
      setCourses(response.data.data);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    }
  };

  useState(() => {
    fetchCourses();
  }, []);

  const handleGenerateReport = async () => {
    try {
      const response = await api.get('/reports/course', { params: { course } });
      const reportData = response.data;

      const doc = new jsPDF({ format: 'a4' });
      // Adicionar conteúdo ao PDF com base no reportData
      // ...

      const pdfBytes = doc.output('arraybuffer');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      onGenerateReport(url);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Por favor, tente novamente mais tarde.");
    }
  };

  return (
    <div className="course-report-filters">
      <label>
        Curso:
        <select value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">Selecione</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </label>
      <button onClick={handleGenerateReport}>Gerar Relatório</button>
    </div>
  );
}

export default CourseReport;
