import React, { useState, useRef } from 'react';
import AttendanceReport from './Attendance/AttendanceReport/AttendanceReport';
import GradesReport from './GradesReport/GradesReport';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './ReportPage.css';

function ReportPage() {
  const [reportType, setReportType] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);

  const reportRefs = {
    'student-attendance': useRef(),
    'student-grades': useRef(),
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    if (reportRefs[reportType]?.current) {
      console.log('Generating report...');
      await reportRefs[reportType].current.generateReport();
    }
    setLoading(false);
  };

  const handleReportGenerated = (url) => {
    console.log('Report generated');
    setPdfUrl(url);
    setShowPdf(true);

    if (autoDownload) {
      // Baixa o arquivo automaticamente
      const reportName = reportType === 'student-attendance' ? 'Relatorio-de-Presenca' :
        reportType === 'student-grades' ? 'Relatorio-de-Notas' :
          'Relatorio';
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName}-${new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]}.pdf`;
      link.click();
    }
  };

  const handleClearReport = () => {
    console.log('Clearing report');
    setPdfUrl(null);
    setShowPdf(false);
  };

  const handleClearFilters = () => {
    console.log('Clearing filters');
    if (reportRefs[reportType]?.current) {
      reportRefs[reportType].current.clearFilters();
    }
  };

  const renderReportFilters = () => {
    switch (reportType) {
      case 'student-attendance':
        return (
          <AttendanceReport
            ref={reportRefs['student-attendance']}
            onGenerateReport={handleReportGenerated}
          />
        );
      case 'student-grades':
        return (
          <GradesReport
            ref={reportRefs['student-grades']}
            onGenerateReport={handleReportGenerated}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="report-page-container">

      <div className="filters-area">
        <h2>Filtros</h2>
        <div className="auto-download-toggle">
          <label>
            <div className="switch">
              <input
                type="checkbox"
                checked={autoDownload}
                onChange={() => setAutoDownload(!autoDownload)}
              />
              <span className="slider"></span>
            </div>
            Baixar automaticamente
          </label>
        </div>
        <div className="filters-report-container">
          <label>
            Módulo:
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="">Selecione</option>
              <optgroup label="Alunos">
                <option value="student-attendance">Relatório de Presença</option>
                <option value="student-grades">Relatório de Notas</option>
              </optgroup>
              <optgroup label="Turmas">
                <option value="class-attendance">Relatório de Presença</option>
                <option value="class-performance">Relatório de Desempenho</option>
              </optgroup>
            </select>
          </label>
          {renderReportFilters()}

        </div>
      </div>
      <div className="report-display-area">
        {loading ? (
          <LoadingSpinner />
        ) : showPdf && pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Relatório"
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        ) : (
          <div className="no-report">Nenhum relatório exibido</div>
        )}
      </div>
      <div className='report-buttons-actions'>
        <button className='clear-filters-button' onClick={handleClearFilters}>Limpar Filtros</button>
        <button className='generate-report-button' onClick={handleGenerateReport}>Gerar Relatório</button>
        {showPdf && pdfUrl && (
          <button onClick={handleClearReport} className="clear-report-button">Limpar Relatório</button>
        )}
      </div>
    </div>
  );
}

export default ReportPage;
