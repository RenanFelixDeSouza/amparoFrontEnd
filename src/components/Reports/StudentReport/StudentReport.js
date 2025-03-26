import React, { useState } from 'react';
import api from '../../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function StudentReport({ onGenerateReport }) {
  const [student, setStudent] = useState('');
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/index');
      setStudents(response.data.data);
    } catch (error) {
      console.error("Erro ao buscar estudantes:", error);
    }
  };

  useState(() => {
    fetchStudents();
  }, []);

  const handleGenerateReport = async () => {
    try {
      const response = await api.get('/reports/student', { params: { student } });
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
    <div className="student-report-filters">
      <label>
        Estudante:
        <select value={student} onChange={(e) => setStudent(e.target.value)}>
          <option value="">Selecione</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>{student.name}</option>
          ))}
        </select>
      </label>
      <button onClick={handleGenerateReport}>Gerar Relatório</button>
    </div>
  );
}

export default StudentReport;
