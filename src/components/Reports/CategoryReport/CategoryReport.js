import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import jsPDF from 'jspdf';
import generatePDF from '../../Shared/ReportGenerator';

function CategoryReport({ onGenerateReport }) {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/index');
      setCategories(response.data.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleGenerateReport = async () => {
    try {
      const response = await api.get('/reports/category', { params: { category } });
      const reportData = response.data;

      const userName = "Nome do Usuário"; 
      const doc = new jsPDF({ format: 'a4' });
      generatePDF(doc, 'Relatório de Categoria', userName);

      doc.autoTable({
        head: [['Categoria', 'Descrição']],
        body: reportData.map(item => [item.name, item.description]),
        startY: doc.lastAutoTable.finalY + 10
      });

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
    <div className="category-report-filters">
      <label>
        Categoria:
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Selecione</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <button onClick={handleGenerateReport}>Gerar Relatório</button>
    </div>
  );
}

export default CategoryReport;
