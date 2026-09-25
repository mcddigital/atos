import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Ato, TipoAto } from '../types/ato';
import brasaoImage from 'figma:asset/30c8dcd5aecfee2fea4c280ebb72d0a79812f802.png';
import unicefImage from 'figma:asset/6696c35842e33b23360c8ccb64a30130ceed3cde.png';

interface RelatorioOptions {
  tipo?: TipoAto;
  periodo?: {
    inicio: string;
    fim: string;
  };
}

export function generateRelatorio(atos: Ato[], options: RelatorioOptions = {}) {
  const doc = new jsPDF();
  
  // Filtrar atos se necessário
  let atosFiltrados = [...atos];
  
  if (options.tipo) {
    atosFiltrados = atosFiltrados.filter(a => a.tipo === options.tipo);
  }
  
  if (options.periodo) {
    atosFiltrados = atosFiltrados.filter(a => {
      const dataAto = new Date(a.data);
      const inicio = new Date(options.periodo!.inicio);
      const fim = new Date(options.periodo!.fim);
      return dataAto >= inicio && dataAto <= fim;
    });
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 15;

  // Cabeçalho
  addHeader(doc, yPos, pageWidth, margin);
  yPos = 55;

  // Título do Relatório
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  
  let titulo = 'RELATÓRIO DE ATOS ADMINISTRATIVOS';
  if (options.tipo) {
    const tipoLabel = options.tipo === 'portaria' ? 'PORTARIAS' : 
                      options.tipo === 'decreto' ? 'DECRETOS' : 'OFÍCIOS';
    titulo = `RELATÓRIO DE ${tipoLabel}`;
  }
  
  doc.text(titulo, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Período (se aplicável)
  if (options.periodo) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const periodoTexto = `Período: ${formatDate(options.periodo.inicio)} a ${formatDate(options.periodo.fim)}`;
    doc.text(periodoTexto, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
  }

  // Data de geração
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  const dataGeracao = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
  doc.text(dataGeracao, pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Resumo
  addResumo(doc, atosFiltrados, yPos, margin, pageWidth);
  yPos += 25;

  // Tabela de atos
  addTabelaAtos(doc, atosFiltrados, yPos);

  // Rodapé
  addFooter(doc);

  // Salvar
  const tipoSufixo = options.tipo ? `_${options.tipo}` : '';
  const periodoSufixo = options.periodo ? `_${options.periodo.inicio}_${options.periodo.fim}` : '';
  const nomeArquivo = `relatorio${tipoSufixo}${periodoSufixo}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(nomeArquivo);
}

function addHeader(doc: jsPDF, yPos: number, pageWidth: number, margin: number) {
  // Brasão à esquerda
  const brasaoWidth = 20;
  const brasaoHeight = 20;
  doc.addImage(brasaoImage, 'PNG', margin, yPos, brasaoWidth, brasaoHeight);
  
  // Selo UNICEF à direita
  const unicefWidth = 12;
  const unicefHeight = 12;
  doc.addImage(unicefImage, 'PNG', pageWidth - margin - unicefWidth, yPos + 4, unicefWidth, unicefHeight);
  
  // Cabeçalho centralizado
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  yPos += 4;
  doc.text('ESTADO DO PIAUÍ', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('PREFEITURA MUNICIPAL DE FRANCISCO MACEDO – PI', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Avenida Maria de Carvalho Alencar, Nº 36, Centro', pageWidth / 2, yPos, { align: 'center' });
  yPos += 3;
  doc.text('CEP: 64.683-000 – Fone (89) 3435-0080', pageWidth / 2, yPos, { align: 'center' });
  yPos += 3;
  doc.text('CNPJ: 01.612.577/0001-17', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
}

function addResumo(doc: jsPDF, atos: Ato[], yPos: number, margin: number, pageWidth: number) {
  const portarias = atos.filter(a => a.tipo === 'portaria').length;
  const decretos = atos.filter(a => a.tipo === 'decreto').length;
  const oficios = atos.filter(a => a.tipo === 'oficio').length;
  const total = atos.length;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO GERAL', margin, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const resumoWidth = (pageWidth - (margin * 2)) / 4;
  let xPos = margin;

  // Total
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(xPos, yPos, resumoWidth - 3, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', xPos + (resumoWidth - 3) / 2, yPos + 4, { align: 'center' });
  doc.setFontSize(12);
  doc.text(total.toString(), xPos + (resumoWidth - 3) / 2, yPos + 9, { align: 'center' });
  
  xPos += resumoWidth;

  // Portarias
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(xPos, yPos, resumoWidth - 3, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PORTARIAS', xPos + (resumoWidth - 3) / 2, yPos + 4, { align: 'center' });
  doc.setFontSize(12);
  doc.text(portarias.toString(), xPos + (resumoWidth - 3) / 2, yPos + 9, { align: 'center' });
  
  xPos += resumoWidth;

  // Decretos
  doc.setFillColor(239, 68, 68); // red-500
  doc.rect(xPos, yPos, resumoWidth - 3, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DECRETOS', xPos + (resumoWidth - 3) / 2, yPos + 4, { align: 'center' });
  doc.setFontSize(12);
  doc.text(decretos.toString(), xPos + (resumoWidth - 3) / 2, yPos + 9, { align: 'center' });
  
  xPos += resumoWidth;

  // Ofícios
  doc.setFillColor(34, 197, 94); // green-500
  doc.rect(xPos, yPos, resumoWidth - 3, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('OFÍCIOS', xPos + (resumoWidth - 3) / 2, yPos + 4, { align: 'center' });
  doc.setFontSize(12);
  doc.text(oficios.toString(), xPos + (resumoWidth - 3) / 2, yPos + 9, { align: 'center' });

  doc.setTextColor(0, 0, 0);
}

function addTabelaAtos(doc: jsPDF, atos: Ato[], yPos: number) {
  const tableData = atos.map(ato => [
    getTipoLabel(ato.tipo),
    ato.numero,
    formatDate(ato.data),
    truncateText(ato.ementa, 50),
    ato.nome || ato.destinatario || '-'
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Tipo', 'Número', 'Data', 'Ementa', 'Destinatário/Nomeado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 70 },
      4: { cellWidth: 45 }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    didDrawPage: (data) => {
      // Adicionar número de página
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const footerY = doc.internal.pageSize.getHeight() - 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text(
      'Este documento foi gerado eletronicamente pelo Sistema de Controle de Atos Administrativos',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }
}

function getTipoLabel(tipo: TipoAto): string {
  if (tipo === 'portaria') return 'Portaria';
  if (tipo === 'decreto') return 'Decreto';
  return 'Ofício';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Relatório detalhado com informações completas
export function generateRelatorioDetalhado(atos: Ato[], options: RelatorioOptions = {}) {
  const doc = new jsPDF();
  
  let atosFiltrados = [...atos];
  
  if (options.tipo) {
    atosFiltrados = atosFiltrados.filter(a => a.tipo === options.tipo);
  }
  
  if (options.periodo) {
    atosFiltrados = atosFiltrados.filter(a => {
      const dataAto = new Date(a.data);
      const inicio = new Date(options.periodo!.inicio);
      const fim = new Date(options.periodo!.fim);
      return dataAto >= inicio && dataAto <= fim;
    });
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);

  atosFiltrados.forEach((ato, index) => {
    if (index > 0) {
      doc.addPage();
    }

    let yPos = 15;

    // Cabeçalho compacto
    addHeader(doc, yPos, pageWidth, margin);
    yPos = 55;

    // Tipo e Número
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${getTipoLabel(ato.tipo).toUpperCase()} Nº ${ato.numero}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Data
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${formatDate(ato.data)}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Ementa
    doc.setFont('helvetica', 'bold');
    doc.text('EMENTA:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const ementaLines = doc.splitTextToSize(ato.ementa, maxWidth);
    ementaLines.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 4;
    });
    yPos += 5;

    // Informações adicionais
    if (ato.nome) {
      doc.setFont('helvetica', 'bold');
      doc.text('NOMEADO:', margin, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(ato.nome, margin, yPos);
      yPos += 4;
      if (ato.cpf) {
        doc.text(`CPF: ${ato.cpf}`, margin, yPos);
        yPos += 4;
      }
      if (ato.cargo) {
        doc.text(`Cargo: ${ato.cargo}`, margin, yPos);
        yPos += 4;
      }
      yPos += 5;
    }

    if (ato.destinatario) {
      doc.setFont('helvetica', 'bold');
      doc.text('DESTINATÁRIO:', margin, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(ato.destinatario, margin, yPos);
      yPos += 4;
      if (ato.cargoDestinatario) {
        doc.text(ato.cargoDestinatario, margin, yPos);
        yPos += 4;
      }
      yPos += 5;
    }

    // Considerandos
    if (ato.considerandos.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('CONSIDERANDOS:', margin, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      ato.considerandos.forEach((considerando, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${considerando.texto}`, maxWidth);
        lines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, margin, yPos);
          yPos += 4;
        });
        yPos += 2;
      });
      yPos += 5;
    }

    // Artigos
    if (ato.artigos.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text(ato.tipo === 'oficio' ? 'CONTEÚDO:' : 'ARTIGOS:', margin, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      ato.artigos.forEach((artigo) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const artigoLabel = ato.tipo === 'oficio' ? `§ ${artigo.numero}:` : `Art. ${artigo.numero}º:`;
        doc.text(artigoLabel, margin, yPos);
        yPos += 4;
        const lines = doc.splitTextToSize(artigo.texto, maxWidth - 5);
        lines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, margin + 5, yPos);
          yPos += 4;
        });
        yPos += 3;
      });
    }
  });

  // Salvar
  const tipoSufixo = options.tipo ? `_${options.tipo}` : '';
  const nomeArquivo = `relatorio_detalhado${tipoSufixo}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(nomeArquivo);
}
