import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ProfessorReport({ onGenerateReport }) {
  const [professor, setProfessor] = useState('');
  const [professors, setProfessors] = useState([]);

  const fetchProfessors = async () => {
    try {
      const response = await api.get('/professors/index');
      setProfessors(response.data.data);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleGenerateReport = async () => {
    try {
      const response = await api.get('/reports/professor', { params: { professor } });
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
    <div className="professor-report-filters">
      <label>
        Professor:
        <select value={professor} onChange={(e) => setProfessor(e.target.value)}>
          <option value="">Selecione</option>
          {professors && professors.map((professor) => (
            <option key={professor.id} value={professor.id}>{professor.name}</option>
          ))}
        </select>
      </label>
      <button onClick={handleGenerateReport}>Gerar Relatório</button>
    </div>
  );
}

export default ProfessorReport;
