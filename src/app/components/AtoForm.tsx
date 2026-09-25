import { useForm, useFieldArray } from 'react-hook-form';
import { Ato, TipoAto, Considerando, Artigo, AlinhamentoTexto, SubtipoPortaria } from '../types/ato';
import { Plus, Save, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { PORTARIA_TEMPLATES, getPortariaLabel } from '../utils/portariaTemplates';
import { PdfPreview } from './PdfPreview';

interface AtoFormData {
  numero: string;
  data: string;
  ementa: string;
  subtipoPortaria?: SubtipoPortaria;
  nome?: string;
  cpf?: string;
  cargo?: string;
  codigoCargo?: string;
  portariaAnterior?: string;
  periodoInicio?: string;
  periodoFim?: string;
  motivo?: string;
  destinatario?: string;
  cargoDestinatario?: string;
  entidadeDestinatario?: string;
  assunto?: string; // Campo de assunto para ofícios
  considerandos: { texto: string }[];
  artigos: { texto: string }[];
  municipio: string;
  estado: string;
  leiReferencia?: string;
  autoridade: string;
  cargoAutoridade: string;
  site?: string;
  email?: string;
  alinhamento?: AlinhamentoTexto;
}

interface AtoFormProps {
  tipo: TipoAto;
  onSubmit: (ato: Ato) => void;
  nextNumero: string;
  editingAto?: Ato | null;
  onCancelEdit: () => void;
}

// Função para gerar ementa automaticamente baseada no conteúdo
function generateAutoEmenta(tipo: TipoAto, data: Partial<AtoFormData>): string {
  if (tipo === 'portaria') {
    // Para portarias, gerar com base no nome e cargo
    if (data.nome && data.cargo) {
      return `Dispõe sobre a nomeação de ${data.nome} para o cargo de ${data.cargo} e dá outras providências.`;
    } else if (data.cargo) {
      return `Dispõe sobre a nomeação para o cargo de ${data.cargo} e dá outras providências.`;
    } else if (data.nome) {
      return `Dispõe sobre a nomeação de ${data.nome} e dá outras providências.`;
    } else {
      return 'Dispõe sobre a nomeação de servidor para cargo comissionado e dá outras providências.';
    }
  } else if (tipo === 'decreto') {
    // Para decretos, ementa genérica (não baseada em nomeação)
    return 'Dispõe sobre assunto de interesse da administração pública e dá outras providências.';
  }
  return '';
}

export function AtoForm({ tipo, onSubmit, nextNumero, editingAto, onCancelEdit }: AtoFormProps) {
  const { register, handleSubmit, reset, setValue, control, watch, formState: { errors } } = useForm<AtoFormData>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      municipio: 'Francisco Macedo',
      estado: 'Piauí',
      leiReferencia: 'Lei Complementar n° 366/2026',
      autoridade: 'ADEILSON ANTÃO DE CARVALHO',
      cargoAutoridade: 'Prefeito Municipal',
      site: 'www.franciscomacedo.pi.gov.br',
      email: 'prefeitura@franciscomacedo.pi.gov.br',
      considerandos: [{ texto: '' }],
      artigos: [{ texto: '' }]
    }
  });

  const { fields: considerandosFields, append: appendConsiderando, remove: removeConsiderando } = useFieldArray({
    control,
    name: 'considerandos'
  });

  const { fields: artigosFields, append: appendArtigo, remove: removeArtigo } = useFieldArray({
    control,
    name: 'artigos'
  });

  // Observar mudanças nos campos relevantes para gerar ementa automática
  const nome = watch('nome');
  const cargo = watch('cargo');
  const artigos = watch('artigos');
  const subtipoPortaria = watch('subtipoPortaria');
  
  // Atualizar campos quando o subtipo de portaria mudar
  useEffect(() => {
    if (!editingAto && tipo === 'portaria' && subtipoPortaria) {
      const template = PORTARIA_TEMPLATES[subtipoPortaria];
      setValue('ementa', template.ementa);
      setValue('considerandos', template.considerandos.map(texto => ({ texto })));
      setValue('artigos', template.artigos.map(texto => ({ texto })));
    }
  }, [subtipoPortaria, tipo, editingAto, setValue]);

  // Gerar ementa automaticamente para decretos (não para portarias com subtipo)
  useEffect(() => {
    if (!editingAto && tipo === 'decreto') {
      const ementaGerada = generateAutoEmenta(tipo, { nome, cargo, artigos });
      setValue('ementa', ementaGerada);
    }
  }, [nome, cargo, artigos, tipo, editingAto, setValue]);

  useEffect(() => {
    if (editingAto) {
      setValue('numero', editingAto.numero);
      setValue('data', editingAto.data);
      setValue('ementa', editingAto.ementa);
      setValue('subtipoPortaria', editingAto.subtipoPortaria);
      setValue('nome', editingAto.nome || '');
      setValue('cpf', editingAto.cpf || '');
      setValue('cargo', editingAto.cargo || '');
      setValue('codigoCargo', editingAto.codigoCargo || '');
      setValue('portariaAnterior', editingAto.portariaAnterior || '');
      setValue('periodoInicio', editingAto.periodoInicio || '');
      setValue('periodoFim', editingAto.periodoFim || '');
      setValue('motivo', editingAto.motivo || '');
      setValue('destinatario', editingAto.destinatario || '');
      setValue('cargoDestinatario', editingAto.cargoDestinatario || '');
      setValue('entidadeDestinatario', editingAto.entidadeDestinatario || '');
      setValue('assunto', editingAto.assunto || ''); // Carregar assunto ao editar
      setValue('municipio', editingAto.municipio);
      setValue('estado', editingAto.estado);
      setValue('leiReferencia', editingAto.leiReferencia || '');
      setValue('autoridade', editingAto.autoridade);
      setValue('cargoAutoridade', editingAto.cargoAutoridade);
      setValue('site', editingAto.site || '');
      setValue('email', editingAto.email || '');
      setValue('alinhamento', editingAto.alinhamento || 'justify');
      
      // Preencher considerandos
      setValue('considerandos', editingAto.considerandos.map(c => ({ texto: c.texto })));
      
      // Preencher artigos
      setValue('artigos', editingAto.artigos.map(a => ({ texto: a.texto })));
    } else {
      setValue('numero', nextNumero);
      setValue('data', new Date().toISOString().split('T')[0]);
      setValue('alinhamento', 'justify');
      
      // Configurar lei de referência baseado no tipo
      if (tipo === 'oficio') {
        setValue('leiReferencia', ''); // Ofícios não têm lei de referência
      } else if (tipo === 'decreto') {
        setValue('leiReferencia', ''); // Decretos começam em branco para preenchimento
      } else {
        setValue('leiReferencia', 'Lei Complementar n° 366/2026'); // Portarias têm valor padrão
      }
      
      // Preencher ementa padrão baseada no tipo
      if (tipo === 'portaria') {
        setValue('ementa', 'Dispõe sobre a nomeação de servidor para cargo comissionado e dá outras providências.');
      } else if (tipo === 'decreto') {
        setValue('ementa', 'Dispõe sobre assunto de interesse da administração pública e dá outras providências.');
      } else {
        setValue('ementa', ''); // Ofícios não usam ementa
      }
      
      // Preencher considerandos padrão para portarias
      if (tipo === 'portaria') {
        setValue('considerandos', [
          { texto: 'CONSIDERANDO afastada a vedação prevista na súmula vinculante 13, do Supremo Tribunal Federal, no provimento dos cargos públicos de natureza política;' },
          { texto: 'CONSIDERANDO a necessidade de reorganização do quadro de agentes públicos necessários para garantir a continuidade da prestação de serviços de interesse coletivo,' }
        ]);
        
        // Preencher artigos padrão para portarias
        setValue('artigos', [
          { texto: 'Nomear o(a) senhor(a) [NOME], portador(a) do CPF nº [CPF], para exercer o cargo comissionado de [CARGO] de [MUNICÍPIO], Estado do [ESTADO], código [CÓDIGO].' },
          { texto: 'Revogadas as disposições em contrário, esta portaria entrará em vigor na data de sua publicação.' }
        ]);
      } else {
        setValue('considerandos', [{ texto: '' }]);
        setValue('artigos', [{ texto: '' }]);
      }
    }
  }, [editingAto, nextNumero, setValue, tipo]);

  const onFormSubmit = (data: AtoFormData) => {
    const ato: Ato = editingAto 
      ? {
          ...editingAto,
          subtipoPortaria: tipo === 'portaria' ? data.subtipoPortaria : undefined,
          numero: data.numero,
          data: data.data,
          ementa: data.ementa,
          nome: data.nome,
          cpf: data.cpf,
          cargo: data.cargo,
          codigoCargo: data.codigoCargo,
          portariaAnterior: data.portariaAnterior,
          periodoInicio: data.periodoInicio,
          periodoFim: data.periodoFim,
          motivo: data.motivo,
          destinatario: data.destinatario,
          cargoDestinatario: data.cargoDestinatario,
          entidadeDestinatario: data.entidadeDestinatario,
          assunto: data.assunto, // Salvar assunto ao editar
          considerandos: data.considerandos.filter(c => c.texto.trim()).map((c, i) => ({
            id: crypto.randomUUID(),
            texto: c.texto
          })),
          artigos: data.artigos.filter(a => a.texto.trim()).map((a, i) => ({
            id: crypto.randomUUID(),
            numero: i + 1,
            texto: a.texto
          })),
          municipio: data.municipio,
          estado: data.estado,
          leiReferencia: data.leiReferencia,
          autoridade: data.autoridade,
          cargoAutoridade: data.cargoAutoridade,
          site: data.site,
          email: data.email,
          alinhamento: data.alinhamento
        }
      : {
          id: crypto.randomUUID(),
          tipo,
          subtipoPortaria: tipo === 'portaria' ? data.subtipoPortaria : undefined,
          numero: data.numero,
          data: data.data,
          ementa: data.ementa,
          nome: data.nome,
          cpf: data.cpf,
          cargo: data.cargo,
          codigoCargo: data.codigoCargo,
          portariaAnterior: data.portariaAnterior,
          periodoInicio: data.periodoInicio,
          periodoFim: data.periodoFim,
          motivo: data.motivo,
          destinatario: data.destinatario,
          cargoDestinatario: data.cargoDestinatario,
          entidadeDestinatario: data.entidadeDestinatario,
          assunto: data.assunto, // Salvar assunto ao criar
          considerandos: data.considerandos.filter(c => c.texto.trim()).map((c, i) => ({
            id: crypto.randomUUID(),
            texto: c.texto
          })),
          artigos: data.artigos.filter(a => a.texto.trim()).map((a, i) => ({
            id: crypto.randomUUID(),
            numero: i + 1,
            texto: a.texto
          })),
          municipio: data.municipio,
          estado: data.estado,
          leiReferencia: data.leiReferencia,
          autoridade: data.autoridade,
          cargoAutoridade: data.cargoAutoridade,
          site: data.site,
          email: data.email,
          alinhamento: data.alinhamento,
          createdAt: new Date().toISOString()
        };
    
    onSubmit(ato);
    toast.success(editingAto ? `${getTipoLabel()} atualizado com sucesso!` : `${getTipoLabel()} criado com sucesso!`);
  };

  const handleCancel = () => {
    reset({
      data: new Date().toISOString().split('T')[0],
      municipio: 'Francisco Macedo',
      estado: 'Piauí',
      leiReferencia: 'Lei Complementar n° 366/2026',
      autoridade: 'ADEILSON ANTÃO DE CARVALHO',
      cargoAutoridade: 'Prefeito Municipal',
      site: 'www.franciscomacedo.pi.gov.br',
      email: 'prefeitura@franciscomacedo.pi.gov.br',
      considerandos: [{ texto: '' }],
      artigos: [{ texto: '' }]
    });
    onCancelEdit();
  };

  const getTipoLabel = () => {
    if (tipo === 'portaria') return 'Portaria';
    if (tipo === 'decreto') return 'Decreto';
    return 'Ofício';
  };

  const getDefaultConsiderandos = () => {
    if (tipo === 'portaria') {
      return [
        'CONSIDERANDO afastada a vedação prevista na súmula vinculante 13, do Supremo Tribunal Federal, no provimento dos cargos públicos de natureza política;',
        'CONSIDERANDO a necessidade de reorganização do quadro de agentes públicos necessários para garantir a continuidade da prestação de serviços de interesse coletivo,'
      ];
    }
    return [];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-indigo-900">
          {editingAto ? `Editar ${getTipoLabel()}` : `Novo ${getTipoLabel()}`}
        </h2>
        {editingAto && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Cancelar edição"
          >
            ×
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Informações Básicas */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Número do {getTipoLabel()} *
            </label>
            <input
              type="text"
              {...register('numero', { required: 'Número é obrigatório' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={tipo === 'portaria' ? '01/2026/GP' : '001/2026'}
            />
            {errors.numero && (
              <span className="text-red-500 text-sm">{errors.numero.message}</span>
            )}
            {!editingAto && (
              <p className="text-xs text-gray-500 mt-1">Número gerado automaticamente (editável)</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              {...register('data', { required: 'Data é obrigatória' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {errors.data && (
              <span className="text-red-500 text-sm">{errors.data.message}</span>
            )}
          </div>
        </div>

        {/* Tipo de Portaria - Mostrar apenas para portarias */}
        {tipo === 'portaria' && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Tipo de Portaria *
            </label>
            <select
              {...register('subtipoPortaria', { required: tipo === 'portaria' ? 'Tipo de portaria é obrigatório' : false })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Selecione o tipo...</option>
              <option value="nomeacao">Portaria de Nomeação</option>
              <option value="exoneracao">Portaria de Exoneração</option>
              <option value="designacao">Portaria de Designação</option>
              <option value="ferias_licencas">Portaria de Concessão de Férias e Licenças</option>
              <option value="afastamento">Portaria de Afastamento de Servidor</option>
              <option value="revogacao">Portaria de Revogação ou Anulação</option>
            </select>
            {errors.subtipoPortaria && (
              <span className="text-red-500 text-sm">{errors.subtipoPortaria.message}</span>
            )}
            <p className="text-xs text-gray-500 mt-1">Selecione o tipo para preencher automaticamente os campos padrão</p>
          </div>
        )}

        {/* Campo de Ementa - Não exibir para ofícios */}
        {tipo !== 'oficio' && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Ementa *
            </label>
            <textarea
              {...register('ementa', { required: tipo !== 'oficio' ? 'Ementa é obrigatória' : false })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Dispõe sobre..."
            />
            {errors.ementa && (
              <span className="text-red-500 text-sm">{errors.ementa.message}</span>
            )}
            <p className="text-xs text-gray-500 mt-1">Ementa gerada automaticamente com base no conteúdo (editável)</p>
          </div>
        )}

        {/* Dados do Destinatário/Nomeado */}
        {tipo === 'oficio' ? (
          <div className="border-t pt-4">
            <h3 className="text-gray-700 mb-3">Destinatário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Nome do Destinatário
                </label>
                <input
                  type="text"
                  {...register('destinatario')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Cargo do Destinatário
                </label>
                <input
                  type="text"
                  {...register('cargoDestinatario')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Cargo ou função"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Entidade Destinatária
                </label>
                <input
                  type="text"
                  {...register('entidadeDestinatario')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nome da entidade"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  {...register('assunto')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Assunto do ofício"
                />
              </div>
            </div>
          </div>
        ) : tipo === 'portaria' ? (
          <div className="border-t pt-4">
            <h3 className="text-gray-700 mb-3">Dados Específicos da Portaria</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Campos comuns: Nome, CPF, Cargo */}
              {(subtipoPortaria === 'nomeacao' || subtipoPortaria === 'exoneracao' || subtipoPortaria === 'designacao' ||
                subtipoPortaria === 'ferias_licencas' || subtipoPortaria === 'afastamento') && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      {...register('nome')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Nome do servidor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      {...register('cpf')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Cargo
                    </label>
                    <input
                      type="text"
                      {...register('cargo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Cargo comissionado"
                    />
                  </div>
                </>
              )}

              {/* Código do cargo - Nomeação e Exoneração */}
              {(subtipoPortaria === 'nomeacao' || subtipoPortaria === 'exoneracao') && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Código do Cargo
                  </label>
                  <input
                    type="text"
                    {...register('codigoCargo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="CC-001"
                  />
                </div>
              )}
              
              {/* Campos de período - Férias/Licenças e Afastamento */}
              {(subtipoPortaria === 'ferias_licencas' || subtipoPortaria === 'afastamento') && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Período - Início
                    </label>
                    <input
                      type="date"
                      {...register('periodoInicio')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Período - Fim
                    </label>
                    <input
                      type="date"
                      {...register('periodoFim')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Motivo - Afastamento e Exoneração */}
              {(subtipoPortaria === 'afastamento' || subtipoPortaria === 'exoneracao' || subtipoPortaria === 'revogacao') && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Motivo
                  </label>
                  <textarea
                    {...register('motivo')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Descreva o motivo..."
                  />
                </div>
              )}

              {/* Portaria Anterior - Revogação */}
              {subtipoPortaria === 'revogacao' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Portaria Anterior
                  </label>
                  <input
                    type="text"
                    {...register('portariaAnterior')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nº 001/2026/GP"
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Considerandos */}
        {tipo !== 'oficio' && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-700">Considerandos</h3>
              <button
                type="button"
                onClick={() => appendConsiderando({ texto: '' })}
                className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {considerandosFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <textarea
                    {...register(`considerandos.${index}.texto`)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-justify leading-relaxed"
                    placeholder="CONSIDERANDO..."
                  />
                  {considerandosFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConsiderando(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artigos */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700">
              {tipo === 'oficio' ? 'Conteúdo' : 'Artigos'}
            </h3>
            <button
              type="button"
              onClick={() => appendArtigo({ texto: '' })}
              className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {artigosFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1">
                  {tipo !== 'oficio' && (
                    <label className="block text-sm text-gray-600 mb-1">
                      Art. {index + 1}º
                    </label>
                  )}
                  <textarea
                    {...register(`artigos.${index}.texto`)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-justify leading-relaxed"
                    placeholder={tipo === 'oficio' ? 'Parágrafo do ofício...' : 'Texto do artigo...'}
                  />
                </div>
                {artigosFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArtigo(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Informações da Prefeitura */}
        <div className="border-t pt-4">
          <h3 className="text-gray-700 mb-3">Informações da Prefeitura</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Município *
              </label>
              <input
                type="text"
                {...register('municipio', { required: 'Município é obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Estado *
              </label>
              <input
                type="text"
                {...register('estado', { required: 'Estado é obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Lei de Referência - Não exibir para ofcios */}
            {tipo !== 'oficio' && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Lei de Referência {tipo === 'portaria' && '*'}
                </label>
                <input
                  type="text"
                  {...register('leiReferencia')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Lei Complementar n° 366/2026"
                />
                {tipo === 'decreto' && (
                  <p className="text-xs text-gray-500 mt-1">Preencher conforme a legislação aplicável</p>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Autoridade *
              </label>
              <input
                type="text"
                {...register('autoridade', { required: 'Autoridade é obrigatória' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Cargo da Autoridade *
              </label>
              <input
                type="text"
                {...register('cargoAutoridade', { required: 'Cargo da autoridade é obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Site
              </label>
              <input
                type="text"
                {...register('site')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {editingAto ? 'Atualizar' : 'Salvar'}
          </button>
          {editingAto && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Pré-visualização do PDF */}
      {editingAto && (
        <PdfPreview 
          ato={editingAto} 
          onUpdate={(updatedAto) => {
            // Atualizar o formulário com os dados editados
            setValue('ementa', updatedAto.ementa);
            setValue('considerandos', updatedAto.considerandos.map(c => ({ texto: c.texto })));
            setValue('artigos', updatedAto.artigos.map(a => ({ texto: a.texto })));
            setValue('alinhamento', updatedAto.alinhamento);
            // Atualizar diretamente via onSubmit
            onSubmit(updatedAto);
          }}
        />
      )}
    </div>
  );
}