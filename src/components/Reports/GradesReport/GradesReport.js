import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '../../../services/api';
import jsPDF from 'jspdf';
import generatePDF, { finalizePDF } from '../../Shared/ReportGenerator';
import CustomDatePicker from '../../Shared/CustomDatePicker/CustomDatePicker';

/**
 * Componente para gerar relatórios de notas.
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
 */
const GradesReport = forwardRef(({ onGenerateReport }, ref) => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    student: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/index');
      setCourses(response.data.data);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    }
  };

  const handleDateChange = (date, isStartDate) => {
    if (isStartDate) {
      if (filters.endDate && date > filters.endDate) {
        setDateError('A data inicial não pode ser maior que a data final');
        return;
      }
      setFilters({ ...filters, startDate: date });
    } else {
      if (filters.startDate && date < filters.startDate) {
        setDateError('A data final não pode ser menor que a data inicial');
        return;
      }
      setFilters({ ...filters, endDate: date });
    }
    setDateError('');
  };

  const handleTimeChange = (time, isStartTime) => {
    const newValue = time.replace(/[^\d]/g, '');
    let formattedValue = '';

    if (newValue.length > 0) {
      const firstDigit = newValue[0];
      if (!'012'.includes(firstDigit)) return;
      formattedValue = firstDigit;

      if (newValue.length > 1) {
        const secondDigit = newValue[1];
        if (firstDigit === '2' && Number(secondDigit) > 3) return;
        formattedValue += secondDigit;

        if (newValue.length > 2) {
          const thirdDigit = newValue[2];
          if (Number(thirdDigit) > 5) return;
          formattedValue += thirdDigit;

          if (newValue.length > 3) {
            formattedValue += newValue[3];
          }
        }
      }
    }

    if (isStartTime) {
      setFilters({ ...filters, startTime: formattedValue });
    } else {
      setFilters({ ...filters, endTime: formattedValue });

      if (formattedValue.replace(/\D/g, '').length === 4 && filters.startTime) {
        const [startHour, startMinute] = filters.startTime.split(':').map(Number);
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

  const handleClearFilters = () => {
    setFilters({
      student: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: ''
    });
    setDateError('');
    setTimeError('');
  };

  const generateTable = (doc, reportData, userName, filters, recordCount, reportTitle) => {
    const headers = ['Data', 'Status'];
    const body = reportData.map(item => [item.date, item.status]);

    doc.autoTable({
      head: [headers],
      body: body,
      startY: 40,
      margin: { top: 40 },
      didDrawPage: function (data) {
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        const totalPages = doc.internal.getNumberOfPages();
        const headerHeight = generatePDF(doc, reportTitle, userName, filters, recordCount, pageNumber, totalPages);

        if (pageNumber > 1) {
          data.settings.startY = headerHeight + 8;
        }
      }
    });
  };

  const generateReport = async () => {
    try {
      const reportData = getReportData();
      const userName = "Nome do Usuário";
      const filtersString = getFilters();
      const recordCount = reportData.length;
      const doc = new jsPDF({ format: 'a4' });

      generateTable(doc, reportData, userName, filtersString, recordCount, 'Relatório de Notas');
      finalizePDF(doc, userName, filtersString, recordCount, 'Relatório de Notas');

      const pdfBytes = doc.output('arraybuffer');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      onGenerateReport(url);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Por favor, tente novamente mais tarde.");
    } 
  };

  useImperativeHandle(ref, () => ({
    generateReport,
    clearFilters: handleClearFilters,
  }));

  const getReportData = () => {
    return [
      { date: '2023-10-01', status: 'P' },
      { date: '2023-10-02', status: 'F' },
      { date: '2023-10-03', status: 'FJ' },
      { date: '2023-10-04', status: 'PA' },
      { date: '2023-10-05', status: 'P' },
      { date: '2023-10-06', status: 'P' },
      { date: '2023-10-07', status: 'F' },
      { date: '2023-10-08', status: 'FJ' },
      { date: '2023-10-09', status: 'PA' },
      { date: '2023-10-10', status: 'P' },
      { date: '2023-10-11', status: 'P' },
      { date: '2023-10-12', status: 'F' },
      { date: '2023-10-13', status: 'FJ' },
      { date: '2023-10-14', status: 'PA' },
      { date: '2023-10-15', status: 'P' },
      { date: '2023-10-16', status: 'P' },
      { date: '2023-10-17', status: 'F' },
      { date: '2023-10-18', status: 'FJ' },
      { date: '2023-10-19', status: 'PA' },
      { date: '2023-10-20', status: 'P' },
      { date: '2023-10-21', status: 'P' },
      { date: '2023-10-22', status: 'F' },
      { date: '2023-10-23', status: 'FJ' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-24', status: 'PA' },
      { date: '2023-10-25', status: 'P' },
      { date: '2023-10-26', status: 'P' },
      { date: '2023-10-27', status: 'F' },
      { date: '2023-10-28', status: 'FJ' },
      { date: '2023-10-29', status: 'PA' },
      { date: '2023-10-29', status: 'PA' },
      { date: '2023-10-29', status: 'PA' },
      { date: '2023-10-29', status: 'PA' },
      { date: '2023-10-29', status: 'PA' },
      { date: '2023-10-30', status: 'P' },
      { date: '2023-10-31', status: 'P' }
    ];
  };

  const getFilters = () => {
    return `Estudante: ${filters.student}, Data Inicial: ${filters.startDate}, Data Final: ${filters.endDate}, Hora Inicial: ${filters.startTime}, Hora Final: ${filters.endTime}`;
  };

  return (
    <div className="attendance-report-filters">
      <div className="filter-group">
        <label>
          turma:
          <select value={filters.student} onChange={(e) => setFilters({ ...filters, student: e.target.value })}>
            <option value="">Selecione</option>
            {courses.map((student) => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="filter-group">
        <fieldset>
          <legend>Período:</legend>
          <div className="date-range">
            <CustomDatePicker
              value={filters.startDate}
              onChange={(date) => handleDateChange(date, true)}
              placeholder="Inicial"
              className="date-picker-compact"
            />
            <span className="date-separator">até</span>
            <CustomDatePicker
              value={filters.endDate}
              onChange={(date) => handleDateChange(date, false)}
              placeholder="Final"
              className="date-picker-compact"
            />
          </div>
          {dateError && <div className="date-error">{dateError}</div>}
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
              value={filters.startTime}
              onChange={(e) => handleTimeChange(e.target.value, true)}
            />
            <span>até</span>
            <input
              type="text"
              maxLength="5"
              placeholder="00:00"
              value={filters.endTime}
              onChange={(e) => handleTimeChange(e.target.value, false)}
            />
          </div>
          {timeError && <div className="date-error">{timeError}</div>}
        </fieldset>
      </div>
    </div>
  );
});

export default GradesReport;
