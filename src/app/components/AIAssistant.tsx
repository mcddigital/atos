import { useMemo, useState } from 'react';
import { Bot, Send, Sparkles, FileText, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { Ato, TipoAto } from '../types/ato';
import { toast } from 'sonner';

interface AIAssistantProps {
  onUseDraft: (ato: Ato) => void;
  nextNumber: (tipo: TipoAto) => string;
}

type DraftResponse = Partial<Ato> & { tipo: TipoAto };

const examples = [
  'Crie uma portaria de nomeação para Maria Silva, CPF 00000000000, para o cargo de Assessora Administrativa.',
  'Crie um ofício ao TRE solicitando orientações sobre transporte de eleitores nas eleições de 2026.',
  'Crie um decreto regulamentando o expediente dos órgãos municipais durante um feriado local.'
];

export function AIAssistant({ onUseDraft, nextNumber }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [reply, setReply] = useState('Descreva o ato que você precisa. Eu preparo a minuta para você revisar antes de salvar.');

  const canSend = useMemo(() => prompt.trim().length >= 10 && !loading, [prompt, loading]);

  async function generate() {
    if (!canSend) return;
    setLoading(true);
    setDraft(null);
    setReply('Estou estruturando a minuta com os dados informados...');

    try {
      const response = await fetch('/api/generate-ato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Não foi possível gerar a minuta.');
      }

      const data = await response.json();
      const generated = data.ato as DraftResponse;
      setDraft(generated);
      setReply('Minuta criada. Confira o resumo abaixo e clique em “Revisar e concluir” para abrir o formulário completo.');
    } catch (error) {
      console.error(error);
      setReply('A integração com IA ainda não está configurada neste ambiente. O projeto já está preparado para receber a chave da API no servidor.');
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar minuta');
    } finally {
      setLoading(false);
    }
  }

  function useDraft() {
    if (!draft) return;
    const tipo = draft.tipo;
    const ato: Ato = {
      id: crypto.randomUUID(),
      tipo,
      subtipoPortaria: draft.subtipoPortaria,
      numero: draft.numero || nextNumber(tipo),
      data: draft.data || new Date().toISOString().slice(0, 10),
      ementa: draft.ementa || '',
      nome: draft.nome,
      cpf: draft.cpf,
      cargo: draft.cargo,
      codigoCargo: draft.codigoCargo,
      portariaAnterior: draft.portariaAnterior,
      periodoInicio: draft.periodoInicio,
      periodoFim: draft.periodoFim,
      motivo: draft.motivo,
      destinatario: draft.destinatario,
      cargoDestinatario: draft.cargoDestinatario,
      entidadeDestinatario: draft.entidadeDestinatario,
      assunto: draft.assunto,
      considerandos: draft.considerandos || [],
      artigos: draft.artigos || [],
      municipio: draft.municipio || 'Francisco Macedo',
      estado: draft.estado || 'Piauí',
      leiReferencia: draft.leiReferencia,
      autoridade: draft.autoridade || 'Adeilson Antão de Carvalho',
      cargoAutoridade: draft.cargoAutoridade || 'Prefeito Municipal',
      site: draft.site || 'franciscomacedo.pi.gov.br',
      email: draft.email || '',
      alinhamento: draft.alinhamento || 'justify',
      createdAt: new Date().toISOString()
    };
    onUseDraft(ato);
  }

  return (
    <div className="grid xl:grid-cols-[1.25fr_.75fr] gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[660px] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Assistente de Atos</h2>
              <p className="text-sm text-slate-500">Crie minutas em linguagem natural</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Revisão humana antes de salvar
          </span>
        </div>

        <div className="flex-1 p-6 space-y-5 bg-slate-50/60">
          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white border border-slate-200 p-4 text-sm leading-6 text-slate-700 shadow-sm">
            {reply}
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Gerando minuta...
            </div>
          )}

          {draft && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm max-w-3xl">
              <div className="flex items-center gap-2 text-emerald-700 mb-4">
                <CheckCircle2 className="h-5 w-5" />
                <strong>Minuta preparada</strong>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Tipo</span><p className="font-medium capitalize text-slate-900">{draft.tipo}</p></div>
                <div><span className="text-slate-500">Número</span><p className="font-medium text-slate-900">{draft.numero || nextNumber(draft.tipo)}</p></div>
                <div className="sm:col-span-2"><span className="text-slate-500">Ementa</span><p className="font-medium text-slate-900 mt-1">{draft.ementa || '—'}</p></div>
                {draft.nome && <div><span className="text-slate-500">Pessoa</span><p className="font-medium text-slate-900">{draft.nome}</p></div>}
                {draft.cargo && <div><span className="text-slate-500">Cargo</span><p className="font-medium text-slate-900">{draft.cargo}</p></div>}
              </div>
              <button onClick={useDraft} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                <FileText className="h-4 w-4" /> Revisar e concluir
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-white">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 flex items-end gap-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex.: Faça uma portaria de exoneração, a pedido, para..."
              className="min-h-[90px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            <button onClick={generate} disabled={!canSend} className="h-11 w-11 shrink-0 rounded-xl bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-emerald-700">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-amber-500" /><h3 className="font-semibold text-slate-900">Exemplos de pedidos</h3></div>
          <div className="space-y-2">
            {examples.map((item) => (
              <button key={item} onClick={() => setPrompt(item)} className="w-full rounded-xl border border-slate-200 p-3 text-left text-sm leading-5 text-slate-600 hover:bg-slate-50 hover:border-slate-300">
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
          <h3 className="font-semibold mb-2">Como vai funcionar</h3>
          <p className="text-sm leading-6 text-slate-300">A IA prepara a minuta, você revisa no formulário oficial e somente depois confirma o salvamento. O PDF final e os dados do ato ficam vinculados no arquivo digital.</p>
        </div>
      </aside>
    </div>
  );
}
