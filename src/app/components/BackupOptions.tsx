import { useState, useRef } from 'react';
import { Ato, TipoAto } from '../types/ato';
import { 
  Download, 
  FileText, 
  X, 
  Calendar, 
  Database,
  Upload,
  FileBarChart
} from 'lucide-react';
import { generateBackupPDFs, exportAtoData, importAtoData } from '../utils/backupGenerator';
import { generateRelatorio, generateRelatorioDetalhado } from '../utils/relatorioGenerator';
import { toast } from 'sonner';

interface BackupOptionsProps {
  atos: Ato[];
  onClose: () => void;
}

export function BackupOptions({ atos, onClose }: BackupOptionsProps) {
  const [tipoFiltro, setTipoFiltro] = useState<TipoAto | 'todos'>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAtosFiltrados = () => {
    let filtrados = [...atos];

    if (tipoFiltro !== 'todos') {
      filtrados = filtrados.filter(a => a.tipo === tipoFiltro);
    }

    if (dataInicio) {
      filtrados = filtrados.filter(a => new Date(a.data) >= new Date(dataInicio));
    }

    if (dataFim) {
      filtrados = filtrados.filter(a => new Date(a.data) <= new Date(dataFim));
    }

    return filtrados;
  };

  const handleBackupPDFs = async () => {
    const atosFiltrados = getAtosFiltrados();
    if (atosFiltrados.length === 0) {
      toast.error('Nenhum ato encontrado com os filtros selecionados');
      return;
    }
    await generateBackupPDFs(atosFiltrados);
  };

  const handleExportData = () => {
    exportAtoData(atos);
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importAtoData(file, (importedAtos) => {
        // Atualizar localStorage
        const existingAtos = JSON.parse(localStorage.getItem('atos') || '[]');
        const mergedAtos = [...importedAtos, ...existingAtos];
        localStorage.setItem('atos', JSON.stringify(mergedAtos));
        
        // Recarregar página para atualizar estado
        window.location.reload();
      });
    }
  };

  const handleRelatorioSimples = () => {
    const atosFiltrados = getAtosFiltrados();
    if (atosFiltrados.length === 0) {
      toast.error('Nenhum ato encontrado com os filtros selecionados');
      return;
    }

    const options: any = {};
    
    if (tipoFiltro !== 'todos') {
      options.tipo = tipoFiltro;
    }

    if (dataInicio && dataFim) {
      options.periodo = {
        inicio: dataInicio,
        fim: dataFim
      };
    }

    generateRelatorio(atosFiltrados, options);
    toast.success('Relatório gerado com sucesso!');
  };

  const handleRelatorioDetalhado = () => {
    const atosFiltrados = getAtosFiltrados();
    if (atosFiltrados.length === 0) {
      toast.error('Nenhum ato encontrado com os filtros selecionados');
      return;
    }

    const options: any = {};
    
    if (tipoFiltro !== 'todos') {
      options.tipo = tipoFiltro;
    }

    if (dataInicio && dataFim) {
      options.periodo = {
        inicio: dataInicio,
        fim: dataFim
      };
    }

    generateRelatorioDetalhado(atosFiltrados, options);
    toast.success('Relatório detalhado gerado com sucesso!');
  };

  const atosFiltrados = getAtosFiltrados();

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-indigo-900 flex items-center gap-2">
          <Database className="w-6 h-6" />
          Backup e Relatórios
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Filtros
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Tipo de Ato
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as TipoAto | 'todos')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="portaria">Portarias</option>
              <option value="decreto">Decretos</option>
              <option value="oficio">Ofícios</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          <strong>{atosFiltrados.length}</strong> ato(s) selecionado(s) com os filtros atuais
        </div>
      </div>

      {/* Opções de Backup */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Backup PDFs */}
        <div className="border-2 border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Backup em PDF
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Gera PDFs individuais de todos os atos selecionados
          </p>
          <button
            onClick={handleBackupPDFs}
            disabled={atosFiltrados.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Gerar PDFs ({atosFiltrados.length})
          </button>
        </div>

        {/* Relatórios */}
        <div className="border-2 border-purple-200 rounded-lg p-4">
          <h3 className="text-purple-900 mb-3 flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            Relatórios
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Gera relatórios consolidados em PDF
          </p>
          <div className="space-y-2">
            <button
              onClick={handleRelatorioSimples}
              disabled={atosFiltrados.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FileBarChart className="w-4 h-4" />
              Relatório Resumido
            </button>
            <button
              onClick={handleRelatorioDetalhado}
              disabled={atosFiltrados.length === 0}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Relatório Detalhado
            </button>
          </div>
        </div>

        {/* Exportar Dados */}
        <div className="border-2 border-green-200 rounded-lg p-4">
          <h3 className="text-green-900 mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Exportar Dados
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Exporta todos os dados em formato JSON para backup
          </p>
          <button
            onClick={handleExportData}
            disabled={atos.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar JSON
          </button>
        </div>

        {/* Importar Dados */}
        <div className="border-2 border-orange-200 rounded-lg p-4">
          <h3 className="text-orange-900 mb-3 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Dados
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Importa dados de um backup JSON anterior
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleImportData}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar JSON
          </button>
        </div>
      </div>

      {/* Informações */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Dica:</strong> Use os filtros acima para gerar backups e relatórios específicos por tipo de ato ou período.
          O relatório resumido mostra uma tabela com todos os atos, enquanto o detalhado mostra cada ato em uma página separada.
        </p>
      </div>
    </div>
  );
}
