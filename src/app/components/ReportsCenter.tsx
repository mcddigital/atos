import { useMemo, useState } from 'react';
import { Ato, TipoAto } from '../types/ato';
import { BarChart3, Download, FileText, Filter, Search } from 'lucide-react';
import { generateRelatorio, generateRelatorioDetalhado } from '../utils/relatorioGenerator';

interface ReportsCenterProps { atos: Ato[]; }

export function ReportsCenter({ atos }: ReportsCenterProps) {
  const [tipo, setTipo] = useState<'todos' | TipoAto>('todos');
  const [ano, setAno] = useState('todos');
  const [search, setSearch] = useState('');

  const anos = useMemo(() => Array.from(new Set(atos.map(a => (a.data || '').slice(0,4)).filter(Boolean))).sort().reverse(), [atos]);
  const filtered = useMemo(() => atos.filter(a => {
    const matchTipo = tipo === 'todos' || a.tipo === tipo;
    const matchAno = ano === 'todos' || (a.data || '').startsWith(ano);
    const term = search.trim().toLowerCase();
    const haystack = [a.numero, a.ementa, a.nome, a.destinatario, a.assunto, a.cargo].filter(Boolean).join(' ').toLowerCase();
    return matchTipo && matchAno && (!term || haystack.includes(term));
  }), [atos, tipo, ano, search]);

  const totals = {
    portaria: filtered.filter(a => a.tipo === 'portaria').length,
    decreto: filtered.filter(a => a.tipo === 'decreto').length,
    oficio: filtered.filter(a => a.tipo === 'oficio').length,
  };

  return <div className="space-y-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div><h2 className="text-2xl font-semibold text-slate-950">Relatórios</h2><p className="text-sm text-slate-500 mt-1">Filtre, confira indicadores e gere relatórios por período ou tipo.</p></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => generateRelatorio(filtered)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4"/> Relatório resumido</button>
        <button onClick={() => generateRelatorioDetalhado(filtered)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"><FileText className="h-4 w-4"/> Relatório detalhado</button>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[['Total', filtered.length], ['Portarias', totals.portaria], ['Decretos', totals.decreto], ['Ofícios', totals.oficio]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p></div>)}
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row gap-3 xl:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por número, ementa, pessoa, assunto..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"/></div>
        <div className="flex gap-2"><select value={tipo} onChange={e => setTipo(e.target.value as any)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="todos">Todos os tipos</option><option value="portaria">Portarias</option><option value="decreto">Decretos</option><option value="oficio">Ofícios</option></select><select value={ano} onChange={e => setAno(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="todos">Todos os anos</option>{anos.map(a => <option key={a}>{a}</option>)}</select></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-5 py-3 text-left font-medium">Tipo</th><th className="px-5 py-3 text-left font-medium">Número</th><th className="px-5 py-3 text-left font-medium">Data</th><th className="px-5 py-3 text-left font-medium">Ementa/Assunto</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(a => <tr key={a.id} className="hover:bg-slate-50/70"><td className="px-5 py-3 capitalize">{a.tipo}</td><td className="px-5 py-3 font-medium text-slate-900">{a.numero}</td><td className="px-5 py-3 text-slate-600">{new Date(a.data).toLocaleDateString('pt-BR')}</td><td className="px-5 py-3 text-slate-600 max-w-xl truncate">{a.assunto || a.ementa}</td></tr>)}{filtered.length===0 && <tr><td colSpan={4} className="px-5 py-14 text-center text-slate-400"><Filter className="mx-auto h-8 w-8 mb-2"/>Nenhum ato encontrado com os filtros atuais.</td></tr>}</tbody></table>
      </div>
    </div>
  </div>;
}
