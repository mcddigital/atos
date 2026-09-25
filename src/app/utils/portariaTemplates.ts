import { SubtipoPortaria } from '../types/ato';

interface PortariaTemplate {
  ementa: string;
  considerandos: string[];
  artigos: string[];
}

export const PORTARIA_TEMPLATES: Record<SubtipoPortaria, PortariaTemplate> = {
  nomeacao: {
    ementa: 'Dispõe sobre a nomeação de servidor para cargo comissionado e dá outras providências.',
    considerandos: [
      'CONSIDERANDO afastada a vedação prevista na súmula vinculante 13, do Supremo Tribunal Federal, no provimento dos cargos públicos de natureza política;',
      'CONSIDERANDO a necessidade de reorganização do quadro de agentes públicos necessários para garantir a continuidade da prestação de serviços de interesse coletivo,',
    ],
    artigos: [
      'Nomear o(a) senhor(a) [NOME], portador(a) do CPF nº [CPF], para exercer o cargo comissionado de [CARGO] de [MUNICÍPIO], Estado do [ESTADO], código [CÓDIGO].',
      'Revogadas as disposições em contrário, esta portaria entrará em vigor na data de sua publicação.',
    ],
  },
  
  exoneracao: {
    ementa: 'Dispõe sobre a exoneração de servidor de cargo em comissão e dá outras providências.',
    considerandos: [
      'CONSIDERANDO a necessidade de reorganização administrativa;',
      'CONSIDERANDO o disposto na legislação vigente que regula os cargos em comissão,',
    ],
    artigos: [
      'Exonerar o(a) senhor(a) [NOME], portador(a) do CPF nº [CPF], do cargo comissionado de [CARGO], código [CÓDIGO], a que foi nomeado(a).',
      'Esta portaria entrará em vigor na data de sua publicação.',
    ],
  },
  
  designacao: {
    ementa: 'Dispõe sobre a designação de servidor para exercer função específica e dá outras providências.',
    considerandos: [
      'CONSIDERANDO a necessidade de designar servidor para atribuições específicas;',
      'CONSIDERANDO as competências e qualificações técnicas do servidor,',
    ],
    artigos: [
      'Designar o(a) senhor(a) [NOME], portador(a) do CPF nº [CPF], ocupante do cargo de [CARGO], para exercer a função de [FUNÇÃO/COMISSÃO].',
      'As atribuições e responsabilidades inerentes à designação constam em anexo a esta portaria.',
      'Esta portaria entrará em vigor na data de sua publicação.',
    ],
  },
  
  ferias_licencas: {
    ementa: 'Dispõe sobre a concessão de férias regulamentares e dá outras providências.',
    considerandos: [
      'CONSIDERANDO o requerimento do servidor interessado;',
      'CONSIDERANDO o disposto na legislação que regula o regime jurídico dos servidores públicos municipais,',
    ],
    artigos: [
      'Conceder ao(à) servidor(a) [NOME], portador(a) do CPF nº [CPF], ocupante do cargo de [CARGO], [TIPO: férias/licença] no período de [PERÍODO INÍCIO] a [PERÍODO FIM].',
      'Durante o período especificado no artigo anterior, o servidor ficará afastado de suas atribuições regulares.',
      'Esta portaria entrará em vigor na data de sua publicação.',
    ],
  },
  
  afastamento: {
    ementa: 'Dispõe sobre o afastamento temporário de servidor público e dá outras providências.',
    considerandos: [
      'CONSIDERANDO a solicitação de afastamento apresentada;',
      'CONSIDERANDO o interesse da administração pública e a legislação aplicável,',
    ],
    artigos: [
      'Autorizar o afastamento do(a) servidor(a) [NOME], portador(a) do CPF nº [CPF], ocupante do cargo de [CARGO], no período de [PERÍODO INÍCIO] a [PERÍODO FIM].',
      'O afastamento de que trata o artigo anterior justifica-se por [MOTIVO].',
      'Esta portaria entrará em vigor na data de sua publicação.',
    ],
  },
  
  revogacao: {
    ementa: 'Dispõe sobre a revogação de portaria anteriormente publicada e dá outras providências.',
    considerandos: [
      'CONSIDERANDO a necessidade de adequação dos atos administrativos;',
      'CONSIDERANDO o poder de autotutela da administração pública,',
    ],
    artigos: [
      'Revogar/Anular a Portaria nº [PORTARIA ANTERIOR], de [DATA DA PORTARIA ANTERIOR], que dispunha sobre [ASSUNTO].',
      'A presente revogação/anulação fundamenta-se em [MOTIVO].',
      'Esta portaria entrará em vigor na data de sua publicação, produzindo efeitos a partir de [DATA].',
    ],
  },
};

export function getPortariaLabel(subtipo: SubtipoPortaria): string {
  const labels: Record<SubtipoPortaria, string> = {
    nomeacao: 'Portaria de Nomeação',
    exoneracao: 'Portaria de Exoneração',
    designacao: 'Portaria de Designação',
    ferias_licencas: 'Portaria de Concessão de Férias e Licenças',
    afastamento: 'Portaria de Afastamento de Servidor',
    revogacao: 'Portaria de Revogação ou Anulação',
  };
  return labels[subtipo];
}