export type TipoAto = 'portaria' | 'decreto' | 'oficio';

export type SubtipoPortaria = 
  | 'nomeacao'
  | 'exoneracao'
  | 'designacao'
  | 'ferias_licencas'
  | 'afastamento'
  | 'revogacao';

export type AlinhamentoTexto = 'justify' | 'left';

export interface Considerando {
  id: string;
  texto: string;
}

export interface Artigo {
  id: string;
  numero: number;
  texto: string;
}

export interface Ato {
  id: string;
  tipo: TipoAto;
  subtipoPortaria?: SubtipoPortaria; // Subtipo apenas para portarias
  numero: string;
  data: string;
  ementa: string;
  
  // Dados do destinatário/nomeado
  nome?: string;
  cpf?: string;
  cargo?: string;
  codigoCargo?: string;
  
  // Campos adicionais para diferentes tipos de portaria
  portariaAnterior?: string; // Para revogação
  periodoInicio?: string; // Para férias, licenças, afastamento
  periodoFim?: string; // Para férias, licenças, afastamento
  motivo?: string; // Para exoneração, afastamento, revogação
  
  // Destinatário (para ofícios)
  destinatario?: string;
  cargoDestinatario?: string;
  entidadeDestinatario?: string; // Entidade que o destinatário representa
  assunto?: string; // Campo de assunto para ofícios
  
  // Conteúdo
  considerandos: Considerando[];
  artigos: Artigo[];
  
  // Dados do município
  municipio: string;
  estado: string;
  leiReferencia?: string;
  
  // Autoridade
  autoridade: string;
  cargoAutoridade: string;
  
  // Contato
  site?: string;
  email?: string;
  
  // Formatação
  alinhamento?: AlinhamentoTexto;
  
  createdAt: string;
}