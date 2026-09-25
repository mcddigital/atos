import jsPDF from 'jspdf';
import { Ato } from '../types/ato';
import brasaoImage from 'figma:asset/30c8dcd5aecfee2fea4c280ebb72d0a79812f802.png';
import unicefImage from 'figma:asset/6696c35842e33b23360c8ccb64a30130ceed3cde.png';

export function generatePDF(ato: Ato) {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = 15;
  const alignment = ato.alinhamento || 'justify';

  // Adicionar cabeçalho
  addHeader(doc, yPos, pageWidth, margin);
  yPos = 60;

  // Conteúdo específico por tipo
  if (ato.tipo === 'portaria') {
    generatePortaria(doc, ato, yPos, pageWidth, margin, maxWidth, alignment);
  } else if (ato.tipo === 'decreto') {
    generateDecreto(doc, ato, yPos, pageWidth, margin, maxWidth, alignment);
  } else if (ato.tipo === 'oficio') {
    generateOficio(doc, ato, yPos, pageWidth, margin, maxWidth, alignment);
  }
  
  // Adicionar numeração de páginas em todas as páginas
  addPageNumbers(doc);

  // Salvar PDF
  const tipoLabel = ato.tipo === 'portaria' ? 'Portaria' : ato.tipo === 'decreto' ? 'Decreto' : 'Oficio';
  const nomeArquivo = `${tipoLabel}_${ato.numero.replace(/\//g, '-')}.pdf`;
  doc.save(nomeArquivo);
}

// Função para adicionar numeração de páginas
function addPageNumbers(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }
}

function addHeader(doc: jsPDF, yPos: number, pageWidth: number, margin: number) {
  // Brasão à esquerda
  const brasaoWidth = 25;
  const brasaoHeight = 25;
  doc.addImage(brasaoImage, 'PNG', margin, yPos, brasaoWidth, brasaoHeight);
  
  // Selo UNICEF à direita
  const unicefWidth = 15;
  const unicefHeight = 15;
  doc.addImage(unicefImage, 'PNG', pageWidth - margin - unicefWidth, yPos + 5, unicefWidth, unicefHeight);
  
  // Cabeçalho centralizado
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  yPos += 5;
  doc.text('ESTADO DO PIAUÍ', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('PREFEITURA MUNICIPAL DE FRANCISCO MACEDO – PI', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Avenida Maria de Carvalho Alencar, Nº 36, Centro', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('CEP: 64.683-000 – Fone (89) 3435-0080', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('CNPJ: 01.612.577/0001-17', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('ADM 2025-2028', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
}

function generatePortaria(doc: jsPDF, ato: Ato, yPos: number, pageWidth: number, margin: number, maxWidth: number, alignment: 'justify' | 'left' | 'right' | 'center') {
  yPos += 8;

  // Cabeçalho - PORTARIA
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`PORTARIA Nº ${ato.numero}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Data
  doc.setFontSize(11);
  doc.text(`DE ${formatDateExtended(ato.data)}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Ementa
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const ementaLines = doc.splitTextToSize(ato.ementa, maxWidth);
  ementaLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  });
  yPos += 8;

  // Preâmbulo
  const preambulo = `O ${ato.cargoAutoridade.toUpperCase()} DE ${ato.municipio.toUpperCase()}, ESTADO DO ${ato.estado.toUpperCase()}, no uso das atribuições legais conferidas pela lei orgânica municipal${ato.leiReferencia ? `, em consonância com a ${ato.leiReferencia}, que Consolida a Estrutura Administrativa e demais ordenamentos jurídicos pertinentes` : ''};`;
  
  // Usar a função de justificação customizada
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFont('helvetica', 'normal');
  yPos = writeJustifiedText(doc, preambulo, margin, yPos, maxWidth);
  yPos += 3;

  // Considerandos
  if (ato.considerandos.length > 0) {
    ato.considerandos.forEach((considerando) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Destacar "CONSIDERANDO" em negrito e justificar o texto
      const text = considerando.texto.trim();
      if (text.startsWith('CONSIDERANDO')) {
        // Separar "CONSIDERANDO" do resto
        const considerandoWord = 'CONSIDERANDO';
        const restOfText = text.substring(considerandoWord.length).trim();
        
        // Escrever "CONSIDERANDO" em negrito
        doc.setFont('helvetica', 'bold');
        doc.text(considerandoWord + ' ', margin, yPos);
        
        // Calcular posição X após "CONSIDERANDO"
        const considerandoWidth = doc.getTextWidth(considerandoWord + ' ');
        
        // Escrever o resto do texto justificado
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(restOfText, maxWidth - considerandoWidth);
        
        // Primeira linha continua após "CONSIDERANDO"
        if (lines.length > 0) {
          const firstLine = lines[0];
          if (lines.length === 1) {
            // Se é a única linha, não justificar
            doc.text(firstLine, margin + considerandoWidth, yPos);
          } else {
            // Justificar primeira linha
            renderJustifiedLine(doc, firstLine, margin + considerandoWidth, yPos, maxWidth - considerandoWidth, 'normal');
          }
          yPos += 5;
        }
        
        // Linhas subsequentes (se houver)
        for (let i = 1; i < lines.length; i++) {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const line = lines[i];
          if (i === lines.length - 1) {
            // Última linha não justifica
            doc.text(line, margin, yPos);
          } else {
            // Justificar
            renderJustifiedLine(doc, line, margin, yPos, maxWidth, 'normal');
          }
          yPos += 5;
        }
      } else {
        // Texto normal sem "CONSIDERANDO"
        yPos = writeJustifiedText(doc, text, margin, yPos, maxWidth);
      }
      yPos += 5;
    });
  }

  // RESOLVE
  yPos += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('RESOLVE:', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Artigos
  doc.setFont('helvetica', 'normal');
  ato.artigos.forEach((artigo, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    const artigoLabel = `Art. ${artigo.numero}º.`;
    doc.text(artigoLabel, margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    let artigoTexto = artigo.texto;
    
    // Substituir placeholders pelos dados reais
    if (artigoTexto.includes('[NOME]') || artigoTexto.includes('[CPF]') || artigoTexto.includes('[CARGO]')) {
      // Formatar períodos se existirem
      const periodoInicioFormatado = ato.periodoInicio ? formatDateExtended(ato.periodoInicio) : '[PERÍODO INÍCIO]';
      const periodoFimFormatado = ato.periodoFim ? formatDateExtended(ato.periodoFim) : '[PERÍODO FIM]';
      
      artigoTexto = artigoTexto
        .replace(/\[NOME\]/g, ato.nome || '[NOME]')
        .replace(/\[CPF\]/g, ato.cpf ? maskCPF(ato.cpf) : '[CPF]')
        .replace(/\[CARGO\]/g, ato.cargo || '[CARGO]')
        .replace(/\[MUNICÍPIO\]/g, ato.municipio || '[MUNICÍPIO]')
        .replace(/\[ESTADO\]/g, ato.estado || '[ESTADO]')
        .replace(/\[CÓDIGO\]/g, ato.codigoCargo || '[CÓDIGO]')
        .replace(/\[PERÍODO INÍCIO\]/g, periodoInicioFormatado)
        .replace(/\[PERÍODO FIM\]/g, periodoFimFormatado)
        .replace(/\[MOTIVO\]/g, ato.motivo || '[MOTIVO]')
        .replace(/\[PORTARIA ANTERIOR\]/g, ato.portariaAnterior || '[PORTARIA ANTERIOR]')
        .replace(/\[FUNÇÃO\/COMISSÃO\]/g, ato.cargo || '[FUNÇÃO/COMISSÃO]')
        .replace(/\[TIPO: férias\/licença\]/g, 'férias regulamentares')
        .replace(/\[DATA DA PORTARIA ANTERIOR\]/g, '[DATA DA PORTARIA ANTERIOR]')
        .replace(/\[ASSUNTO\]/g, '[ASSUNTO]')
        .replace(/\[DATA\]/g, formatDateExtended(ato.data));
    }
    
    // Renderizar texto com destaques em negrito
    yPos = renderTextWithBoldHighlights(doc, artigoTexto, margin + 15, yPos, maxWidth - 15, ato);
    yPos += 3;
  });

  // Publique-se
  if (yPos > 260) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('DÊ CIÊNCIA, PUBLIQUE-SE, REGISTRE-SE e CUMPRA-SE.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Gabinete
  addFooterSignature(doc, ato, yPos, pageWidth);
}

function generateDecreto(doc: jsPDF, ato: Ato, yPos: number, pageWidth: number, margin: number, maxWidth: number, alignment: 'justify' | 'left' | 'right' | 'center') {
  yPos += 8;

  // Cabeçalho - DECRETO
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`DECRETO Nº ${ato.numero}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Data
  doc.setFontSize(11);
  doc.text(`DE ${formatDateExtended(ato.data)}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Ementa
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const ementaLines = doc.splitTextToSize(ato.ementa, maxWidth);
  ementaLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  });
  yPos += 8;

  // Preâmbulo
  const preambulo = `O ${ato.cargoAutoridade.toUpperCase()} DE ${ato.municipio.toUpperCase()}, ESTADO DO ${ato.estado.toUpperCase()}, no uso das atribuições que lhe são conferidas pela Lei Orgânica Municipal${ato.leiReferencia ? ` e pela ${ato.leiReferencia}` : ''},`;
  
  // Usar a função de justificação customizada
  if (yPos > 270) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFont('helvetica', 'normal');
  yPos = writeJustifiedText(doc, preambulo, margin, yPos, maxWidth);
  yPos += 3;

  // Considerandos
  if (ato.considerandos.length > 0) {
    ato.considerandos.forEach((considerando) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Destacar "CONSIDERANDO" em negrito e justificar o texto
      const text = considerando.texto.trim();
      if (text.startsWith('CONSIDERANDO')) {
        // Separar "CONSIDERANDO" do resto
        const considerandoWord = 'CONSIDERANDO';
        const restOfText = text.substring(considerandoWord.length).trim();
        
        // Escrever "CONSIDERANDO" em negrito
        doc.setFont('helvetica', 'bold');
        doc.text(considerandoWord + ' ', margin, yPos);
        
        // Calcular posição X após "CONSIDERANDO"
        const considerandoWidth = doc.getTextWidth(considerandoWord + ' ');
        
        // Escrever o resto do texto justificado
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(restOfText, maxWidth - considerandoWidth);
        
        // Primeira linha continua após "CONSIDERANDO"
        if (lines.length > 0) {
          const firstLine = lines[0];
          if (lines.length === 1) {
            // Se é a única linha, não justificar
            doc.text(firstLine, margin + considerandoWidth, yPos);
          } else {
            // Justificar primeira linha
            renderJustifiedLine(doc, firstLine, margin + considerandoWidth, yPos, maxWidth - considerandoWidth, 'normal');
          }
          yPos += 5;
        }
        
        // Linhas subsequentes (se houver)
        for (let i = 1; i < lines.length; i++) {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const line = lines[i];
          if (i === lines.length - 1) {
            // Última linha não justifica
            doc.text(line, margin, yPos);
          } else {
            // Justificar
            renderJustifiedLine(doc, line, margin, yPos, maxWidth, 'normal');
          }
          yPos += 5;
        }
      } else {
        // Texto normal sem "CONSIDERANDO"
        yPos = writeJustifiedText(doc, text, margin, yPos, maxWidth);
      }
      yPos += 5;
    });
  }

  // DECRETA
  yPos += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('DECRETA:', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Artigos
  doc.setFont('helvetica', 'normal');
  ato.artigos.forEach((artigo, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    const artigoLabel = `Art. ${artigo.numero}º.`;
    doc.text(artigoLabel, margin, yPos);
    
    doc.setFont('helvetica', 'normal');
    let artigoTexto = artigo.texto;
    
    // Substituir placeholders pelos dados reais
    if (artigoTexto.includes('[NOME]') || artigoTexto.includes('[CPF]') || artigoTexto.includes('[CARGO]')) {
      // Formatar períodos se existirem
      const periodoInicioFormatado = ato.periodoInicio ? formatDateExtended(ato.periodoInicio) : '[PERÍODO INÍCIO]';
      const periodoFimFormatado = ato.periodoFim ? formatDateExtended(ato.periodoFim) : '[PERÍODO FIM]';
      
      artigoTexto = artigoTexto
        .replace(/\[NOME\]/g, ato.nome || '[NOME]')
        .replace(/\[CPF\]/g, ato.cpf ? maskCPF(ato.cpf) : '[CPF]')
        .replace(/\[CARGO\]/g, ato.cargo || '[CARGO]')
        .replace(/\[MUNICÍPIO\]/g, ato.municipio || '[MUNICÍPIO]')
        .replace(/\[ESTADO\]/g, ato.estado || '[ESTADO]')
        .replace(/\[CÓDIGO\]/g, ato.codigoCargo || '[CÓDIGO]')
        .replace(/\[PERÍODO INÍCIO\]/g, periodoInicioFormatado)
        .replace(/\[PERÍODO FIM\]/g, periodoFimFormatado)
        .replace(/\[MOTIVO\]/g, ato.motivo || '[MOTIVO]')
        .replace(/\[PORTARIA ANTERIOR\]/g, ato.portariaAnterior || '[PORTARIA ANTERIOR]')
        .replace(/\[FUNÇÃO\/COMISSÃO\]/g, ato.cargo || '[FUNÇÃO/COMISSÃO]')
        .replace(/\[TIPO: férias\/licença\]/g, 'férias regulamentares')
        .replace(/\[DATA DA PORTARIA ANTERIOR\]/g, '[DATA DA PORTARIA ANTERIOR]')
        .replace(/\[ASSUNTO\]/g, '[ASSUNTO]')
        .replace(/\[DATA\]/g, formatDateExtended(ato.data));
    }
    
    // Renderizar texto com destaques em negrito
    yPos = renderTextWithBoldHighlights(doc, artigoTexto, margin + 15, yPos, maxWidth - 15, ato);
    yPos += 3;
  });

  // Publique-se
  if (yPos > 260) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('REGISTRE-SE, PUBLIQUE-SE e CUMPRA-SE.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  addFooterSignature(doc, ato, yPos, pageWidth);
}

function generateOficio(doc: jsPDF, ato: Ato, yPos: number, pageWidth: number, margin: number, maxWidth: number, alignment: 'justify' | 'left' | 'right' | 'center') {
  yPos += 8;

  // Cabeçalho - OFÍCIO
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`OFÍCIO Nº ${ato.numero}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Data e local - usando a data selecionada sem conversão de timezone
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const [year, month, day] = ato.data.split('-').map(Number);
  const monthsLong = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const dataFormatada = `${day} de ${monthsLong[month - 1]} de ${year}`;
  doc.text(`${ato.municipio}, ${dataFormatada}.`, margin, yPos);
  yPos += 15;

  // Destinatário
  if (ato.destinatario) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Ao(À) ${ato.destinatario}`, margin, yPos);
    yPos += 5;
    
    if (ato.cargoDestinatario) {
      doc.text(ato.cargoDestinatario, margin, yPos);
      yPos += 5;
    }
    
    if (ato.entidadeDestinatario) {
      doc.text(ato.entidadeDestinatario, margin, yPos);
      yPos += 5;
    }
    yPos += 10;
  }

  // Assunto
  if (ato.assunto) {
    doc.setFont('helvetica', 'bold');
    doc.text('Assunto:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const assuntoLines = doc.splitTextToSize(ato.assunto, maxWidth - 20);
    doc.text(assuntoLines, margin + 20, yPos);
    yPos += (assuntoLines.length * 5) + 10;
  }

  // Vocativo
  doc.setFont('helvetica', 'normal');
  const vocativo = ato.cargoDestinatario 
    ? `${ato.cargoDestinatario.includes('Senhor') || ato.cargoDestinatario.includes('Senhora') ? '' : 'Senhor(a) '}${ato.cargoDestinatario},`
    : 'Prezado(a) Senhor(a),';
  doc.text(vocativo, margin, yPos);
  yPos += 10;

  // Conteúdo (artigos como parágrafos)
  ato.artigos.forEach((artigo) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    // Usar função de justificação customizada
    yPos = writeJustifiedText(doc, artigo.texto, margin, yPos, maxWidth);
    yPos += 3; // Espaçamento adicional entre parágrafos
  });

  // Despedida
  yPos += 5;
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  doc.text('Atenciosamente,', margin, yPos);
  yPos += 20;

  // Assinatura
  doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(ato.autoridade.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(ato.cargoAutoridade, pageWidth / 2, yPos, { align: 'center' });

  // Rodapé com contato
  addContactFooter(doc, ato);
}

function addFooterSignature(doc: jsPDF, ato: Ato, yPos: number, pageWidth: number) {
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Formatar a data por extenso
  const dataExtenso = formatDateText(ato.data);
  
  // Texto completo: "Gabinete do Prefeito Municipal de Francisco Macedo/Piauí, [data por extenso]"
  const gabineteLine = `Gabinete do ${ato.cargoAutoridade} de ${ato.municipio}/${ato.estado}, ${dataExtenso}`;
  doc.text(gabineteLine, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Assinatura
  if (yPos > 240) {
    doc.addPage();
    yPos = 100;
  }
  
  doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(ato.autoridade.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(ato.cargoAutoridade, pageWidth / 2, yPos, { align: 'center' });

  // Rodapé com contato
  addContactFooter(doc, ato);
}

function addContactFooter(doc: jsPDF, ato: Ato) {
  const footerY = doc.internal.pageSize.getHeight() - 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  if (ato.site && ato.email) {
    doc.text(`Site: ${ato.site}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`E-mail: ${ato.email}`, pageWidth / 2, footerY + 4, { align: 'center' });
  } else if (ato.site) {
    doc.text(`Site: ${ato.site}`, pageWidth / 2, footerY + 2, { align: 'center' });
  } else if (ato.email) {
    doc.text(`E-mail: ${ato.email}`, pageWidth / 2, footerY + 2, { align: 'center' });
  }
}

function formatDateExtended(dateString: string): string {
  // Parse a data no formato YYYY-MM-DD sem conversão de timezone
  const [year, month, day] = dateString.split('-').map(Number);
  const months = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  const monthName = months[month - 1];
  return `${day.toString().padStart(2, '0')} DE ${monthName} DE ${year}`;
}

function formatDateText(dateString: string): string {
  // Parse a data no formato YYYY-MM-DD sem conversão de timezone
  const [year, month, day] = dateString.split('-').map(Number);
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const monthName = months[month - 1];
  
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  
  let dayText = '';
  if (day < 10) {
    dayText = units[day];
  } else if (day < 20) {
    dayText = teens[day - 10];
  } else {
    const ten = Math.floor(day / 10);
    const unit = day % 10;
    dayText = tens[ten] + (unit > 0 ? ' e ' + units[unit] : '');
  }
  
  // Converter ano para extenso
  const yearText = convertYearToText(year);
  
  // Formato numérico da data
  const formatDateNumeric = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  return `Ao ${dayText} dia de ${monthName} de ${yearText}. (${formatDateNumeric}).`;
}

function convertYearToText(year: number): string {
  // Para anos de 2000 em diante
  if (year >= 2000 && year < 3000) {
    const thousands = Math.floor(year / 1000);
    const remainder = year % 1000;
    
    let text = 'dois mil';
    
    if (remainder > 0) {
      if (remainder < 100) {
        text += ' e ';
        if (remainder === 1) text += 'um';
        else if (remainder === 2) text += 'dois';
        else if (remainder === 3) text += 'três';
        else if (remainder === 4) text += 'quatro';
        else if (remainder === 5) text += 'cinco';
        else if (remainder === 6) text += 'seis';
        else if (remainder === 7) text += 'sete';
        else if (remainder === 8) text += 'oito';
        else if (remainder === 9) text += 'nove';
        else if (remainder === 10) text += 'dez';
        else if (remainder === 11) text += 'onze';
        else if (remainder === 12) text += 'doze';
        else if (remainder === 13) text += 'treze';
        else if (remainder === 14) text += 'quatorze';
        else if (remainder === 15) text += 'quinze';
        else if (remainder === 16) text += 'dezesseis';
        else if (remainder === 17) text += 'dezessete';
        else if (remainder === 18) text += 'dezoito';
        else if (remainder === 19) text += 'dezenove';
        else if (remainder >= 20) {
          const tens = Math.floor(remainder / 10);
          const units = remainder % 10;
          const tensText = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
          const unitsText = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
          text += tensText[tens];
          if (units > 0) text += ' e ' + unitsText[units];
        }
      } else {
        // Para centenas (2100, 2200, etc.)
        const hundreds = Math.floor(remainder / 100);
        const rest = remainder % 100;
        
        const hundredsText = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
        
        if (hundreds > 0) {
          text += ' e ' + hundredsText[hundreds];
          
          if (rest > 0) {
            text += ' e ';
            if (rest < 10) {
              const unitsText = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
              text += unitsText[rest];
            } else if (rest < 20) {
              const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
              text += teens[rest - 10];
            } else {
              const tens = Math.floor(rest / 10);
              const units = rest % 10;
              const tensText = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
              const unitsText = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
              text += tensText[tens];
              if (units > 0) text += ' e ' + unitsText[units];
            }
          }
        }
      }
    }
    
    return text;
  }
  
  // Fallback para outros anos
  return year.toString();
}

function maskCPF(cpf: string): string {
  let formatted = cpf;
  if (cpf.length === 11) {
    formatted = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return formatted.replace(/\d{3}(?=\.)/g, '***');
}

// Função para renderizar texto com destaques em negrito
function renderTextWithBoldHighlights(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, ato: Ato) {
  // Criar lista de padrões para destacar em negrito
  const boldPatterns: string[] = [];
  
  if (ato.nome) boldPatterns.push(ato.nome);
  if (ato.cpf) boldPatterns.push(maskCPF(ato.cpf));
  if (ato.cargo) boldPatterns.push(ato.cargo);
  if (ato.codigoCargo) boldPatterns.push(ato.codigoCargo);
  if (ato.destinatario) boldPatterns.push(ato.destinatario);
  
  // Adicionar palavras-chave que sempre devem estar em negrito
  boldPatterns.push('CPF', 'nº', 'Nº', 'N°', 'código', 'Código');

  const lines = doc.splitTextToSize(text, maxWidth);
  let currentY = y;
  
  lines.forEach((line: string, lineIndex: number) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    
    const startX = lineIndex === 0 ? x : x - 15;
    const lineMaxWidth = lineIndex === 0 ? maxWidth : maxWidth + 15;
    renderLineWithBold(doc, line, startX, currentY, boldPatterns, lineMaxWidth, lineIndex === lines.length - 1);
    currentY += 5;
  });
  
  return currentY;
}

// Função auxiliar para renderizar uma linha com palavras em negrito e justificada
function renderLineWithBold(doc: jsPDF, line: string, x: number, y: number, boldPatterns: string[], maxWidth?: number, isLastLine?: boolean) {
  // Se não há padrões, renderizar normalmente
  if (boldPatterns.length === 0) {
    doc.setFont('helvetica', 'normal');
    if (maxWidth && !isLastLine) {
      renderJustifiedLine(doc, line, x, y, maxWidth, 'normal');
    } else {
      doc.text(line, x, y);
    }
    return;
  }
  
  // Criar regex para encontrar todos os padrões (escape de caracteres especiais)
  const escapedPatterns = boldPatterns.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedPatterns.join('|')})`, 'g');
  
  // Dividir a linha em partes (texto normal e texto em negrito)
  const parts = line.split(regex);
  
  // Se temos maxWidth e não é a última linha, aplicar justificação
  if (maxWidth && !isLastLine && line.trim().split(' ').length > 1) {
    renderJustifiedLineWithBold(doc, parts, boldPatterns, x, y, maxWidth);
  } else {
    // Renderizar sem justificação (última linha ou linha única)
    let currentX = x;
    doc.setFont('helvetica', 'normal');
    
    parts.forEach((part) => {
      if (!part) return; // Ignorar partes vazias
      
      // Verificar se esta parte é um dos padrões em negrito
      const isBold = boldPatterns.some(pattern => part === pattern);
      
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(part, currentX, y);
      currentX += doc.getTextWidth(part);
    });
    
    // Resetar para normal
    doc.setFont('helvetica', 'normal');
  }
}

// Função para renderizar linha justificada com partes em negrito
function renderJustifiedLineWithBold(doc: jsPDF, parts: string[], boldPatterns: string[], x: number, y: number, maxWidth: number) {
  // Calcular largura total do texto sem justificação
  let totalWidth = 0;
  const partWidths: { text: string; width: number; isBold: boolean }[] = [];
  
  parts.forEach((part) => {
    if (!part) return;
    const isBold = boldPatterns.some(pattern => part === pattern);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const width = doc.getTextWidth(part);
    partWidths.push({ text: part, width, isBold });
    totalWidth += width;
  });
  
  // Contar espaços para distribuir
  const text = parts.join('');
  const spaces = text.split(' ').length - 1;
  
  if (spaces === 0) {
    // Se não há espaços, renderizar normalmente
    let currentX = x;
    partWidths.forEach(({ text, isBold }) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(text, currentX, y);
      currentX += doc.getTextWidth(text);
    });
    return;
  }
  
  // Calcular espaço extra por espaço em branco
  const extraSpace = (maxWidth - totalWidth) / spaces;
  
  let currentX = x;
  doc.setFont('helvetica', 'normal');
  
  partWidths.forEach(({ text, isBold }) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    // Processar texto palavra por palavra para adicionar espaçamento
    const words = text.split(' ');
    words.forEach((word, idx) => {
      if (word) {
        doc.text(word, currentX, y);
        currentX += doc.getTextWidth(word);
      }
      
      // Adicionar espaço extra entre palavras (exceto na última palavra)
      if (idx < words.length - 1) {
        currentX += doc.getTextWidth(' ') + extraSpace;
      }
    });
  });
  
  doc.setFont('helvetica', 'normal');
}

// Função para renderizar linha justificada simples (sem negrito)
function renderJustifiedLine(doc: jsPDF, line: string, x: number, y: number, maxWidth: number, font: 'normal' | 'bold' = 'normal') {
  doc.setFont('helvetica', font);
  
  const words = line.trim().split(' ');
  if (words.length === 1) {
    doc.text(line, x, y);
    return;
  }
  
  // Calcular largura total sem espaços extras
  const wordsWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
  const spacesCount = words.length - 1;
  const spaceWidth = doc.getTextWidth(' ');
  const totalNormalWidth = wordsWidth + (spacesCount * spaceWidth);
  
  // Calcular espaço extra por espaço
  const extraSpace = (maxWidth - totalNormalWidth) / spacesCount;
  
  let currentX = x;
  words.forEach((word, i) => {
    doc.text(word, currentX, y);
    currentX += doc.getTextWidth(word);
    
    if (i < words.length - 1) {
      currentX += spaceWidth + extraSpace;
    }
  });
}

// Função para calcular altura do texto
function calculateTextHeight(doc: jsPDF, text: string, maxWidth: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  return lines.length * 5;
}

// Função para escrever texto justificado
function writeJustifiedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  
  lines.forEach((line: string, index: number) => {
    // Não justificar a última linha ou linhas muito curtas
    if (index === lines.length - 1 || line.trim().length < maxWidth / doc.getTextWidth('a') * 0.7) {
      doc.text(line.trim(), x, y);
    } else {
      // Justificar a linha
      const words = line.trim().split(' ');
      if (words.length === 1) {
        doc.text(line.trim(), x, y);
      } else {
        const lineWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
        const totalSpaces = words.length - 1;
        const spaceWidth = (maxWidth - lineWidth) / totalSpaces;
        
        let currentX = x;
        words.forEach((word, i) => {
          doc.text(word, currentX, y);
          currentX += doc.getTextWidth(word) + spaceWidth;
        });
      }
    }
    y += 5;
  });
  
  return y;
}