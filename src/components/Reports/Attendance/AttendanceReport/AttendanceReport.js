import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '../../../../services/api';
import jsPDF from 'jspdf';
import CustomDatePicker from '../../../Shared/CustomDatePicker/CustomDatePicker';
import { addPagination } from '../../../Shared/ReportGeneratorLandscape';

/**
* Componente para gerar relatórios de presença.
* @param {Object} props - Propriedades do componente.
* @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
* @param {Object} props.filters - Filtros aplicados.
* @param {Function} props.setFilters - Função para definir os filtros.
*/
const AttendanceReport = forwardRef(({ onGenerateReport }, ref) => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    student: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    studentNameFilter: '',
    category: '',
    professor: '',
    course: ""
  });
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [professors, setProfessors] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
    fetchProfessors();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/index');
      setCourses(response.data.data);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/index');
      setCategories(response.data.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await api.get('/professors/index');
      setProfessors(response.data);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    }
  };

  const handleDateChange = (date, isStartDate) => {
    if (!date) return;

    const parts = date.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const selectedDate = new Date(year, month, day);

    let startMonth, endMonth;
    let startDateObj, endDateObj;

    if (filters.startDate) {
      const startParts = filters.startDate.split('-');
      startMonth = parseInt(startParts[1], 10) - 1;
      startDateObj = new Date(parseInt(startParts[0], 10), startMonth, parseInt(startParts[2], 10));
    }
    if (filters.endDate) {
      const endParts = filters.endDate.split('-');
      endMonth = parseInt(endParts[1], 10) - 1;
      endDateObj = new Date(parseInt(endParts[0], 10), endMonth, parseInt(endParts[2], 10));
    }

    if (isStartDate) {
      if (endDateObj && selectedDate > endDateObj) {
        setDateError('A data inicial não pode ser maior que a data final');
        return;
      }
      if (endDateObj && selectedDate.getMonth() !== endMonth) {
        setDateError('A data inicial e final devem estar no mesmo mês');
        return;
      }
      setFilters({ ...filters, startDate: date });
    } else {
      if (startDateObj && selectedDate < startDateObj) {
        setDateError('A data final não pode ser menor que a data inicial');
        return;
      }
      if (startDateObj && selectedDate.getMonth() !== startMonth) {
        setDateError('A data inicial e final devem estar no mesmo mês');
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
      endTime: '',
      studentNameFilter: '',
      category: '',
      professor: '',
      course: ""
    });
    setDateError('');
    setTimeError('');
    setFilteredStudents([]);
  };

  const generateTable = async (doc, reportData, userName, filters, recordCount, reportTitle) => {
    const groupedData = reportData.reduce((acc, item) => {
      if (!acc[item.course]) {
        acc[item.course] = [];
      }
      acc[item.course].push(item);
      return acc;
    }, {});

    let startY = 50; 

    Object.keys(groupedData).forEach((className) => {
      const classData = groupedData[className];

      // Ordena os estudantes por nome em ordem alfabética
       classData.sort((a, b) => a.name.localeCompare(b.name));

      const dates = classData[0].dates;
      const professor = classData[0].professor;
      const category = classData[0].category;
      let headers = ['#', 'Nome do Aluno', ...dates, 'Total P', 'Total PA', 'Total F', 'Total FJ'];

      const body = classData.map((item, index) => {
        const status = item.status.concat(Array(dates.length - item.status.length).fill(''));
        return [index + 1, item.name, ...status, item.totalP, item.totalPA, item.totalF, item.totalFJ];
      });

      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(`Turma: ${className} | Professor: ${professor} | Categoria: ${category}`, 14, startY);
      startY += 2

      doc.autoTable({
        head: [headers],
        body: body,
        startY: startY,
        margin: { top: 40 },
        styles: { fontSize: 8, cellPadding: 0.5, valign: 'middle' },
        headStyles: {
          fillColor: [48, 65, 98], // (RGB  #e68c3a)
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center', 
        },

        columnStyles: {
          0: {
            cellWidth: 10,
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          1: {
            cellWidth: 30,
            halign: 'left',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          ...dates.reduce((acc, _, index) => {
            acc[index + 2] = {
              halign: 'center',
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            };
            return acc;
          }, {}),
          [dates.length + 2]: {
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          [dates.length + 3]: {
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          [dates.length + 4]: {
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          [dates.length + 5]: {
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        didDrawCell: function (data) {
          const doc = data.doc;
          const cell = data.cell;

          // Desenha bordas laterais
          doc.setLineWidth(0.1);
          doc.setDrawColor(0, 0, 0);
          doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
          doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        },
        didParseCell: function (data) {
          if (data.row.section === 'head') {
            if (data.column.index === 0) {
              data.cell.styles.halign = 'center';
            } else if (data.column.index === 1) {
              data.cell.styles.halign = 'left';
            } else {
              data.cell.styles.halign = 'center';
            }
          }
        },
      });
      startY = doc.autoTable.previous.finalY + 25;
    });
  };

  const generateReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      setDateError("Por favor, preencha o período de datas antes de gerar o relatório.");
      return;
    }
    try {
      const doc = new jsPDF({ format: 'a4', orientation: 'landscape' });
      const reportData = await getReportData();
      const userName = "Nome do Usuário";
      const filtersString = getFilters();
      const recordCount = reportData.length;
      const totalPagesExp = "{total_pages_count_string}";

      // Gera a tabela que será replicada em todas as páginas
      await generateTable(doc, reportData, userName, filtersString, recordCount, 'Relatório de Presença');

      // Adiciona a paginação em todas as páginas
      addPagination(doc, userName, filtersString, recordCount, 'Relatório de Presença', totalPagesExp);

      // Atualiza o total de páginas no final
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      
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

  const getReportData = async () => {
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        startTime: filters.startTime,
        endTime: filters.endTime,
        student: filters.student,
        category: filters.category,
        professor: filters.professor,
        course: filters.course,
      };


      const response = await api.get(`/reports/attendance-report-by-month`, { params });

      if (response && response.data && response.data.course) {
        const reportData = response.data.course.flatMap(course =>
          course.students.map(student => ({
            course: course.course,
            professor: course.professor,
            category: course.category,
            name: student.name,
            status: student.status,
            dates: course.dates, 
            totalP: student.total.P,
            totalF: student.total.F,
            totalPA: student.total.PA,
            totalFJ: student.total.FJ,
          }))
        );

        return reportData;
      } else {
        console.error("Dados do curso não encontrados na resposta da API.");
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar dados do relatório:", error);
      return [];
    }
  };


  /**
   * Retorna os filtros aplicados.
   * @returns {string} - Filtros aplicados.
   */
  /**
   * Retorna os filtros aplicados.
   * @returns {string} - Filtros aplicados.
   */
  const getFilters = () => {
    const formatDate = (date) => {
      if (!date) return '';
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    };

    const formattedStartDate = formatDate(filters.startDate);
    const formattedEndDate = formatDate(filters.endDate);

    const filtersArray = [];

    if (filters.student) filtersArray.push(`Estudante: ${filters.studentNameFilter}`);
    if (formattedStartDate) filtersArray.push(`Data Inicial: ${formattedStartDate}`);
    if (formattedEndDate) filtersArray.push(`Data Final: ${formattedEndDate}`);
    if (filters.startTime) filtersArray.push(`Hora Inicial: ${filters.startTime}`);
    if (filters.endTime) filtersArray.push(`Hora Final: ${filters.endTime}`);

    return filtersArray.join(', ');
  };

  const handleStudentNameFilterChange = async (e) => {
    const studentNameFilter = e.target.value;
    setFilters({ ...filters, studentNameFilter });
    if (studentNameFilter.length >= 3) {
      try {
        const response = await api.get(`/students/index?full_name=${studentNameFilter}`);
        setFilteredStudents(response.data.data);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        setFilteredStudents([]);
      }
    } else {
      setFilteredStudents([]);
    }
  };

  const handleStudentSelect = (student) => {
    setFilters({ ...filters, student: student.id, studentNameFilter: `${student.first_name} ${student.last_name}` });
    setFilteredStudents([]);
  };


  return (
    <div className="report-filters">
      <div className="filter-group">
        <div className="filter-group">
          <fieldset>
            <legend>Aluno:</legend>
            <input
              type="text"
              placeholder="Nome do Aluno"
              value={filters.studentNameFilter}
              onChange={handleStudentNameFilterChange}
            />
            {filteredStudents.length > 0 && (
              <ul className="student-list">
                {filteredStudents.map((student) => (
                  <li key={student.id} onClick={() => handleStudentSelect(student)}>
                    {`${student.first_name} ${student.last_name}`}
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
        </div>
        <div className="filter-group">
          <fieldset>
            <legend>
              turma:
            </legend>
            <select value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
              <option value="">Selecione</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </fieldset>

        </div>
      </div>
      <div className="filter-group" >
        <fieldset>
          <legend>Período: *</legend>
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

      <div className='filter-group'>
        <div className="filter-group">
          <fieldset>
            <legend>Categoria:</legend>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Selecione</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Carregando categorias...</option>
              )}
            </select>
          </fieldset>
        </div>
        <div className="filter-group">
          <fieldset>
            <legend>Professor:</legend>
            <select
              value={filters.professor}
              onChange={(e) => setFilters({ ...filters, professor: e.target.value })}
            >
              <option value="">Selecione</option>
              {professors && professors.length > 0 ? (
                professors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Carregando professores...</option>
              )}
            </select>
          </fieldset>
        </div>
      </div>
    </div>
  );
});

export default AttendanceReport;