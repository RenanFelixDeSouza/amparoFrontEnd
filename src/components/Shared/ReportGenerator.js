import 'jspdf-autotable';

/**
 * Gera o cabeçalho do PDF com informações do usuário, data, hora e número de páginas.
 * @param {Object} doc - Instância do jsPDF.
 * @param {string} reportTitle - Título do relatório.
 * @param {string} userName - Nome do usuário.
 * @param {string} filters - Filtros aplicados no relatório.
 * @param {number} recordCount - Número total de registros.
 * @param {number} pageNumber - Número da página atual.
 * @param {number} totalPages - Número total de páginas.
 * @returns {number} - Altura do cabeçalho.
 */
const generatePDF = (doc, reportTitle, userName, filters, recordCount, pageNumber, totalPages) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = new Date().toLocaleTimeString('pt-BR');

  const addHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Usuário: ${userName}`, 14, 10);
    doc.text(`Data/Hora: ${currentDate} ${currentTime}`, doc.internal.pageSize.width - 20, 16, { align: 'right' });
    doc.setLineWidth(0.1);
    doc.text(`Página ${pageNumber} de ${totalPages}`, doc.internal.pageSize.width - 20, 10, { align: 'right' });
    doc.line(14, 24, doc.internal.pageSize.width - 14, 24);
  };

  const addTitle = () => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, doc.internal.pageSize.width / 2, 10, { align: 'center' });
  };

  const addFiltersAndRecordCount = () => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Filtros: ${filters}`, 10, 20);
    doc.text(`Página ${pageNumber} de ${totalPages}`, 14, 28);
    doc.text(`Total de Registros: ${recordCount}`, 14, 32);
  };

  addHeader();
  addTitle();
  addFiltersAndRecordCount();

  return 32; 
};

/**
 * Finaliza o PDF adicionando cabeçalhos em todas as páginas.
 * @param {Object} doc - Instância do jsPDF.
 * @param {string} userName - Nome do usuário.
 * @param {string} filters - Filtros aplicados.
 * @param {number} recordCount - Número total de registros.
 * @param {string} reportTitle - Título do relatório.
 */
const finalizePDF = (doc, userName, filters, recordCount, reportTitle) => {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    generatePDF(doc, reportTitle, userName, filters, recordCount, i, totalPages);
  }
};

export { generatePDF, finalizePDF };
export default generatePDF;