import { Ato } from '../types/ato';
import { generatePDF } from './pdfGenerator';
import { toast } from 'sonner';

export async function generateBackupPDFs(atos: Ato[]) {
  if (atos.length === 0) {
    toast.error('Não há atos para fazer backup');
    return;
  }

  const toastId = toast.loading(`Gerando backup de ${atos.length} atos...`);

  try {
    // Gerar cada PDF com um pequeno delay para não travar o navegador
    for (let i = 0; i < atos.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      generatePDF(atos[i]);
      
      // Atualizar progresso
      if (i % 5 === 0 || i === atos.length - 1) {
        toast.loading(`Gerando backup: ${i + 1}/${atos.length} atos...`, { id: toastId });
      }
    }

    toast.success(`Backup concluído! ${atos.length} PDFs gerados.`, { id: toastId });
  } catch (error) {
    toast.error('Erro ao gerar backup', { id: toastId });
    console.error(error);
  }
}

export function exportAtoData(atos: Ato[]) {
  if (atos.length === 0) {
    toast.error('Não há atos para exportar');
    return;
  }

  const dataStr = JSON.stringify(atos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_atos_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success('Dados exportados com sucesso!');
}

export function importAtoData(file: File, onImport: (atos: Ato[]) => void) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      
      if (Array.isArray(data)) {
        onImport(data);
        toast.success(`${data.length} atos importados com sucesso!`);
      } else {
        toast.error('Formato de arquivo inválido');
      }
    } catch (error) {
      toast.error('Erro ao ler arquivo');
      console.error(error);
    }
  };
  
  reader.readAsText(file);
}
