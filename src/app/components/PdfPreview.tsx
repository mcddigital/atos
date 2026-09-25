import { useState, useEffect } from 'react';
import { Ato } from '../types/ato';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import brasaoImage from 'figma:asset/30c8dcd5aecfee2fea4c280ebb72d0a79812f802.png';
import unicefImage from 'figma:asset/6696c35842e33b23360c8ccb64a30130ceed3cde.png';

interface PdfPreviewProps {
  ato: Ato;
  onUpdate: (updatedAto: Ato) => void;
}

export function PdfPreview({ ato, onUpdate }: PdfPreviewProps) {
  const [editedAto, setEditedAto] = useState<Ato>(ato);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedAto(ato);
    setHasChanges(false);
  }, [ato]);

  const formatDateExtended = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const months = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const monthName = months[month - 1];
    return `${day.toString().padStart(2, '0')} DE ${monthName} DE ${year}`;
  };

  const formatDateText = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${day} de ${months[month - 1]} de ${year}`;
  };

  const maskCPF = (cpf: string): string => {
    let formatted = cpf;
    if (cpf.length === 11) {
      formatted = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return formatted.replace(/\d{3}(?=\.)/g, '***');
  };

  const replaceVariables = (text: string): string => {
    const periodoInicioFormatado = editedAto.periodoInicio ? formatDateExtended(editedAto.periodoInicio) : '[PERÍODO INÍCIO]';
    const periodoFimFormatado = editedAto.periodoFim ? formatDateExtended(editedAto.periodoFim) : '[PERÍODO FIM]';
    
    return text
      .replace(/\[NOME\]/g, editedAto.nome || '[NOME]')
      .replace(/\[CPF\]/g, editedAto.cpf ? maskCPF(editedAto.cpf) : '[CPF]')
      .replace(/\[CARGO\]/g, editedAto.cargo || '[CARGO]')
      .replace(/\[MUNICÍPIO\]/g, editedAto.municipio || '[MUNICÍPIO]')
      .replace(/\[ESTADO\]/g, editedAto.estado || '[ESTADO]')
      .replace(/\[CÓDIGO\]/g, editedAto.codigoCargo || '[CÓDIGO]')
      .replace(/\[PERÍODO INÍCIO\]/g, periodoInicioFormatado)
      .replace(/\[PERÍODO FIM\]/g, periodoFimFormatado)
      .replace(/\[MOTIVO\]/g, editedAto.motivo || '[MOTIVO]')
      .replace(/\[PORTARIA ANTERIOR\]/g, editedAto.portariaAnterior || '[PORTARIA ANTERIOR]')
      .replace(/\[FUNÇÃO\/COMISSÃO\]/g, editedAto.cargo || '[FUNÇÃO/COMISSÃO]')
      .replace(/\[TIPO: férias\/licença\]/g, 'férias regulamentares')
      .replace(/\[DATA DA PORTARIA ANTERIOR\]/g, '[DATA DA PORTARIA ANTERIOR]')
      .replace(/\[ASSUNTO\]/g, '[ASSUNTO]')
      .replace(/\[DATA\]/g, formatDateExtended(editedAto.data));
  };

  const updateConsiderando = (index: number, texto: string) => {
    const newConsiderandos = [...editedAto.considerandos];
    newConsiderandos[index] = { ...newConsiderandos[index], texto };
    setEditedAto({ ...editedAto, considerandos: newConsiderandos });
    setHasChanges(true);
  };

  const updateArtigo = (index: number, texto: string) => {
    const newArtigos = [...editedAto.artigos];
    newArtigos[index] = { ...newArtigos[index], texto };
    setEditedAto({ ...editedAto, artigos: newArtigos });
    setHasChanges(true);
  };

  const updateEmenta = (ementa: string) => {
    setEditedAto({ ...editedAto, ementa });
    setHasChanges(true);
  };

  const saveChanges = () => {
    onUpdate(editedAto);
    setHasChanges(false);
    toast.success('Alterações salvas com sucesso!');
  };

  const getTipoColor = () => {
    if (ato.tipo === 'portaria') return 'border-blue-500';
    if (ato.tipo === 'decreto') return 'border-red-500';
    return 'border-green-700';
  };

  const alignment = editedAto.alinhamento || 'justify';

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Pré-visualização do Documento</h3>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={saveChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          )}
        </div>
      </div>

      <div className={`bg-white border-4 ${getTipoColor()} rounded-lg shadow-lg p-8 max-w-4xl mx-auto`}>
        {/* Cabeçalho */}
        <div className="relative mb-8">
          <div className="flex justify-between items-start mb-4">
            <img src={brasaoImage} alt="Brasão" className="w-20 h-20" />
            <img src={unicefImage} alt="UNICEF" className="w-12 h-12 mt-2" />
          </div>
          
          <div className="text-center space-y-1">
            <p className="font-bold text-sm">ESTADO DO PIAUÍ</p>
            <p className="font-bold text-sm">PREFEITURA MUNICIPAL DE FRANCISCO MACEDO – PI</p>
            <p className="text-xs">Avenida Maria de Carvalho Alencar, Nº 36, Centro</p>
            <p className="text-xs">CEP: 64.683-000 – Fone (89) 3435-0080</p>
            <p className="text-xs">CNPJ: 01.612.577/0001-17</p>
            <p className="font-bold text-xs">ADM 2025-2028</p>
          </div>
          
          <div className="border-t-2 border-gray-400 mt-4"></div>
        </div>

        {/* Conteúdo do Documento */}
        {ato.tipo === 'portaria' && (
          <div className="space-y-6">
            {/* Título */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">PORTARIA Nº {editedAto.numero}</h2>
              <p className="text-base font-bold">DE {formatDateExtended(editedAto.data)}</p>
            </div>

            {/* Ementa */}
            <div className="text-center">
              <textarea
                value={editedAto.ementa}
                onChange={(e) => updateEmenta(e.target.value)}
                className="w-full text-sm text-center border border-gray-200 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Preâmbulo */}
            <div className={`text-sm ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
              <p>
                O {editedAto.cargoAutoridade.toUpperCase()} DE {editedAto.municipio.toUpperCase()}, ESTADO DO {editedAto.estado.toUpperCase()}, 
                no uso das atribuições legais conferidas pela lei orgânica municipal
                {editedAto.leiReferencia && `, em consonância com a ${editedAto.leiReferencia}, que Consolida a Estrutura Administrativa e demais ordenamentos jurídicos pertinentes`};
              </p>
            </div>

            {/* Considerandos */}
            {editedAto.considerandos.length > 0 && (
              <div className="space-y-3">
                {editedAto.considerandos.map((considerando, index) => (
                  <div key={considerando.id} className={`text-sm ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                    <textarea
                      value={considerando.texto}
                      onChange={(e) => updateConsiderando(index, e.target.value)}
                      className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* RESOLVE */}
            <div className="text-center">
              <p className="text-base font-bold">RESOLVE:</p>
            </div>

            {/* Artigos */}
            <div className="space-y-4">
              {editedAto.artigos.map((artigo, index) => (
                <div key={artigo.id} className="space-y-2">
                  <p className="text-sm font-bold">Art. {artigo.numero}º.</p>
                  <textarea
                    value={artigo.texto}
                    onChange={(e) => updateArtigo(index, e.target.value)}
                    className={`w-full text-sm border border-gray-200 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}
                    rows={3}
                  />
                  <p className={`text-sm text-gray-600 ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                    {replaceVariables(artigo.texto)}
                  </p>
                </div>
              ))}
            </div>

            {/* Publique-se */}
            <div className="text-center mt-6">
              <p className="text-sm font-bold">DÊ CIÊNCIA, PUBLIQUE-SE, REGISTRE-SE e CUMPRA-SE.</p>
            </div>

            {/* Assinatura */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm">
                Gabinete do {editedAto.cargoAutoridade} de {editedAto.municipio}/{editedAto.estado}, {formatDateText(editedAto.data)}
              </p>
              <div className="mt-8">
                <div className="border-t-2 border-gray-800 w-64 mx-auto mb-2"></div>
                <p className="font-bold text-sm">{editedAto.autoridade.toUpperCase()}</p>
                <p className="text-sm">{editedAto.cargoAutoridade}</p>
              </div>
            </div>
          </div>
        )}

        {ato.tipo === 'decreto' && (
          <div className="space-y-6">
            {/* Título */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">DECRETO Nº {editedAto.numero}</h2>
              <p className="text-base font-bold">DE {formatDateExtended(editedAto.data)}</p>
            </div>

            {/* Ementa */}
            <div className="text-center">
              <textarea
                value={editedAto.ementa}
                onChange={(e) => updateEmenta(e.target.value)}
                className="w-full text-sm text-center border border-gray-200 rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Preâmbulo */}
            <div className={`text-sm ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
              <p>
                O {editedAto.cargoAutoridade.toUpperCase()} DE {editedAto.municipio.toUpperCase()}, ESTADO DO {editedAto.estado.toUpperCase()}, 
                no uso das atribuições que lhe são conferidas pela Lei Orgânica Municipal
                {editedAto.leiReferencia && ` e pela ${editedAto.leiReferencia}`},
              </p>
            </div>

            {/* Considerandos */}
            {editedAto.considerandos.length > 0 && (
              <div className="space-y-3">
                {editedAto.considerandos.map((considerando, index) => (
                  <div key={considerando.id} className={`text-sm ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                    <textarea
                      value={considerando.texto}
                      onChange={(e) => updateConsiderando(index, e.target.value)}
                      className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* DECRETA */}
            <div className="text-center">
              <p className="text-base font-bold">DECRETA:</p>
            </div>

            {/* Artigos */}
            <div className="space-y-4">
              {editedAto.artigos.map((artigo, index) => (
                <div key={artigo.id} className="space-y-2">
                  <p className="text-sm font-bold">Art. {artigo.numero}º.</p>
                  <textarea
                    value={artigo.texto}
                    onChange={(e) => updateArtigo(index, e.target.value)}
                    className={`w-full text-sm border border-gray-200 rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}
                    rows={3}
                  />
                </div>
              ))}
            </div>

            {/* Publique-se */}
            <div className="text-center mt-6">
              <p className="text-sm font-bold">REGISTRE-SE, PUBLIQUE-SE e CUMPRA-SE.</p>
            </div>

            {/* Assinatura */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm">
                Gabinete do {editedAto.cargoAutoridade} de {editedAto.municipio}/{editedAto.estado}, {formatDateText(editedAto.data)}
              </p>
              <div className="mt-8">
                <div className="border-t-2 border-gray-800 w-64 mx-auto mb-2"></div>
                <p className="font-bold text-sm">{editedAto.autoridade.toUpperCase()}</p>
                <p className="text-sm">{editedAto.cargoAutoridade}</p>
              </div>
            </div>
          </div>
        )}

        {ato.tipo === 'oficio' && (
          <div className="space-y-6">
            {/* Título */}
            <div className="text-center">
              <h2 className="text-xl font-bold">OFÍCIO Nº {editedAto.numero}</h2>
            </div>

            {/* Data */}
            <div className="text-left mt-6">
              <p className="text-sm">{editedAto.municipio}, {formatDateText(editedAto.data)}.</p>
            </div>

            {/* Destinatário */}
            {editedAto.destinatario && (
              <div className="text-left">
                <p className="text-sm">Ao(À) {editedAto.destinatario}</p>
                {editedAto.cargoDestinatario && <p className="text-sm">{editedAto.cargoDestinatario}</p>}
                {editedAto.entidadeDestinatario && <p className="text-sm">{editedAto.entidadeDestinatario}</p>}
              </div>
            )}

            {/* Assunto */}
            {editedAto.assunto && (
              <div className="text-left">
                <p className="text-sm"><span className="font-bold">Assunto:</span> {editedAto.assunto}</p>
              </div>
            )}

            {/* Vocativo */}
            <div className="text-left">
              <p className="text-sm">
                {editedAto.cargoDestinatario 
                  ? `${editedAto.cargoDestinatario.includes('Senhor') || editedAto.cargoDestinatario.includes('Senhora') ? '' : 'Senhor(a) '}${editedAto.cargoDestinatario},`
                  : 'Prezado(a) Senhor(a),'}
              </p>
            </div>

            {/* Parágrafos (Artigos) */}
            <div className="space-y-4">
              {editedAto.artigos.map((artigo, index) => (
                <div key={artigo.id}>
                  <textarea
                    value={artigo.texto}
                    onChange={(e) => updateArtigo(index, e.target.value)}
                    className={`w-full text-sm border border-gray-200 rounded p-2 focus:ring-2 focus:ring-green-700 focus:border-transparent resize-none ${alignment === 'justify' ? 'text-justify' : 'text-left'}`}
                    rows={3}
                  />
                </div>
              ))}
            </div>

            {/* Despedida */}
            <div className="text-left mt-6">
              <p className="text-sm">Atenciosamente,</p>
            </div>

            {/* Assinatura */}
            <div className="mt-8 text-center space-y-4">
              <div className="border-t-2 border-gray-800 w-64 mx-auto mb-2"></div>
              <p className="font-bold text-sm">{editedAto.autoridade.toUpperCase()}</p>
              <p className="text-sm">{editedAto.cargoAutoridade}</p>
            </div>
          </div>
        )}

        {/* Rodapé com contato */}
        {(editedAto.site || editedAto.email) && (
          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-600">
            {editedAto.site && <p>Site: {editedAto.site}</p>}
            {editedAto.email && <p>E-mail: {editedAto.email}</p>}
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 Dica:</span> Você pode editar os textos diretamente na pré-visualização. 
          As alterações feitas aqui serão aplicadas ao documento quando você clicar em \"Salvar Alterações\".
        </p>
      </div>
    </div>
  );
}