import { Ato, TipoAto } from '../types/ato';
import { FileText, File, ScrollText, Plus, Calendar, Download, FileDown, Settings } from 'lucide-react';
import { useState } from 'react';
import { BackupOptions } from './BackupOptions';

interface DashboardProps {
  atos: Ato[];
  onCreateNew: (tipo: TipoAto) => void;
  onEdit: (ato: Ato) => void;
  onDelete: (id: string) => void;
}

export function Dashboard({ atos, onCreateNew, onEdit, onDelete }: DashboardProps) {
  const [showBackupOptions, setShowBackupOptions] = useState(false);
  
  const portarias = atos.filter(a => a.tipo === 'portaria');
  const decretos = atos.filter(a => a.tipo === 'decreto');
  const oficios = atos.filter(a => a.tipo === 'oficio');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRecentAtos = (tipo: TipoAto, limit: number = 3) => {
    return atos.filter(a => a.tipo === tipo).slice(0, limit);
  };

  return (
    <div className="space-y-8">
      {/* Barra de Ações */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => setShowBackupOptions(!showBackupOptions)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Backup e Relatórios
          </button>
        </div>
      </div>

      {/* Painel de Backup e Relatórios */}
      {showBackupOptions && (
        <BackupOptions 
          atos={atos}
          onClose={() => setShowBackupOptions(false)}
        />
      )}

      {/* Cards de Resumo */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-400">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Portarias</p>
              <h3 className="text-blue-700">{portarias.length}</h3>
            </div>
            <FileText className="w-12 h-12 text-blue-400 opacity-20" />
          </div>
          <button
            onClick={() => onCreateNew('portaria')}
            className="w-full bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Portaria
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-400">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Decretos</p>
              <h3 className="text-red-700">{decretos.length}</h3>
            </div>
            <ScrollText className="w-12 h-12 text-red-400 opacity-20" />
          </div>
          <button
            onClick={() => onCreateNew('decreto')}
            className="w-full bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Decreto
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Ofícios</p>
              <h3 className="text-emerald-700">{oficios.length}</h3>
            </div>
            <File className="w-12 h-12 text-emerald-600 opacity-20" />
          </div>
          <button
            onClick={() => onCreateNew('oficio')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Ofício
          </button>
        </div>
      </div>

      {/* Atos Recentes */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Portarias Recentes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-blue-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Portarias Recentes
          </h3>
          {getRecentAtos('portaria').length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Nenhuma portaria criada</p>
          ) : (
            <div className="space-y-3">
              {getRecentAtos('portaria').map(ato => (
                <button
                  key={ato.id}
                  onClick={() => onEdit(ato)}
                  className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                >
                  <p className="text-sm text-blue-700">Nº {ato.numero}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ato.ementa}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(ato.data)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Decretos Recentes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-red-900 mb-4 flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Decretos Recentes
          </h3>
          {getRecentAtos('decreto').length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Nenhum decreto criado</p>
          ) : (
            <div className="space-y-3">
              {getRecentAtos('decreto').map(ato => (
                <button
                  key={ato.id}
                  onClick={() => onEdit(ato)}
                  className="w-full text-left p-3 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                >
                  <p className="text-sm text-red-700">Nº {ato.numero}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ato.ementa}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(ato.data)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ofícios Recentes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-emerald-800 mb-4 flex items-center gap-2">
            <File className="w-5 h-5" />
            Ofícios Recentes
          </h3>
          {getRecentAtos('oficio').length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Nenhum ofício criado</p>
          ) : (
            <div className="space-y-3">
              {getRecentAtos('oficio').map(ato => (
                <button
                  key={ato.id}
                  onClick={() => onEdit(ato)}
                  className="w-full text-left p-3 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200"
                >
                  <p className="text-sm text-emerald-700">Nº {ato.numero}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ato.ementa}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(ato.data)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}