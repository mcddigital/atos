import { Ato, TipoAto } from '../types/ato';
import { FileText, Download, Trash2, Calendar, User, Building2, Edit, File, ScrollText } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { toast } from 'sonner';

interface AtosListProps {
  atos: Ato[];
  tipo?: TipoAto;
  onDelete: (id: string) => void;
  onEdit: (ato: Ato) => void;
  compact?: boolean;
}

export function AtosList({ atos, tipo, onDelete, onEdit, compact = false }: AtosListProps) {
  const handleDownloadPDF = (ato: Ato) => {
    generatePDF(ato);
    toast.success('PDF gerado com sucesso!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ato?')) {
      onDelete(id);
      toast.success('Ato excluído com sucesso!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const maskCPF = (cpf?: string) => {
    if (!cpf) return '';
    let formatted = cpf;
    if (cpf.length === 11) {
      formatted = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return formatted.replace(/\d{3}(?=\.)/g, '***');
  };

  const getTipoIcon = (tipo: TipoAto) => {
    if (tipo === 'portaria') return <FileText className="w-4 h-4" />;
    if (tipo === 'decreto') return <ScrollText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getTipoLabel = (tipo: TipoAto) => {
    if (tipo === 'portaria') return 'Portaria';
    if (tipo === 'decreto') return 'Decreto';
    return 'Ofício';
  };

  const getTipoColor = (tipo: TipoAto) => {
    if (tipo === 'portaria') return 'text-blue-600';
    if (tipo === 'decreto') return 'text-red-600';
    return 'text-green-600';
  };

  const filteredAtos = tipo ? atos.filter(a => a.tipo === tipo) : atos;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="mb-6 text-indigo-900">
        {tipo ? `Histórico de ${getTipoLabel(tipo)}s` : 'Todos os Atos'}
      </h2>
      
      {filteredAtos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhum ato criado ainda</p>
          <p className="text-sm">Crie seu primeiro ato</p>
        </div>
      ) : (
        <div className={`space-y-4 ${compact ? 'max-h-[500px]' : 'max-h-[calc(100vh-200px)]'} overflow-y-auto pr-2`}>
          {filteredAtos.map((ato) => (
            <div
              key={ato.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={getTipoColor(ato.tipo)}>
                      {getTipoIcon(ato.tipo)}
                    </span>
                    <h3 className={`${getTipoColor(ato.tipo)}`}>
                      {getTipoLabel(ato.tipo)} Nº {ato.numero}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ato.ementa}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(ato)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(ato)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Baixar PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ato.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!compact && (
                <div className="grid gap-2 text-sm">
                  {ato.nome && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4" />
                      <span>{ato.nome}</span>
                      {ato.cpf && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{maskCPF(ato.cpf)}</span>
                        </>
                      )}
                    </div>
                  )}

                  {ato.destinatario && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4" />
                      <span>Para: {ato.destinatario}</span>
                      {ato.cargoDestinatario && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{ato.cargoDestinatario}</span>
                        </>
                      )}
                    </div>
                  )}

                  {ato.cargo && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 className="w-4 h-4" />
                      <span>{ato.cargo}</span>
                      {ato.codigoCargo && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>Código: {ato.codigoCargo}</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(ato.data)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{ato.municipio}/{ato.estado}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}