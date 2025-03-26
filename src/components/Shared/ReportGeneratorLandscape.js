import 'jspdf-autotable';

/**
 * Gera o cabeçalho do PDF com informações do usuário, data, hora e número de páginas.
 * @param {Object} doc - Instância do jsPDF.
 * @param {string} userName - Nome do usuário.
 * @param {string} filters - Filtros aplicados no relatório.
 * @param {number} recordCount - Número total de registros.
 * @param {string} reportTitle - Título do relatório.
 * @param {number} totalPages - Número total de páginas.
 */
const addPagination =  (doc, userName, filters, recordCount, reportTitle, totalPages) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
  
  
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, doc.internal.pageSize.width / 2, 15, { align: 'center' });
  
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Usuário: ${userName}`, 14, 27);
    doc.text(`Data/Hora: ${currentDate} ${currentTime}`, 14, 32);
    doc.text(`Total de Registros: ${recordCount}`, doc.internal.pageSize.width - 15, 32, { align: 'right' });
  
    doc.line(13, 38, doc.internal.pageSize.width - 13, 38);
    doc.setLineWidth(0.1);
  
    doc.setFontSize(8);
    doc.text(`Filtros: ${filters}`, 14, 37);
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.width + 25 , 25, { align: 'right' });

    if (recordCount === 0) {

      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text('Nenhum dado disponível para o Relatório. Por favor, verificar o relatório e filtros..', doc.internal.pageSize.width / 2, 120, { align: 'center' });
    }
  }
};

export { addPagination };