import { useMemo, useState } from 'react';
import { Ato } from '../types/ato';
import { Download, FileArchive, FileText, Search, Cloud, CheckCircle2 } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

export function FilesCenter({ atos }: { atos: Ato[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => atos.filter(a => [a.numero,a.ementa,a.nome,a.assunto].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())), [atos, search]);
  return <div className="space-y-6">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold text-slate-950">Arquivo digital</h2><p className="text-sm text-slate-500 mt-1">Lista central de todos os atos para consulta e download futuro.</p></div><div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"><Cloud className="h-3.5 w-3.5"/> Preparado para armazenamento online</div></div>
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100"><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-200" placeholder="Pesquisar no arquivo..."/></div></div>
      <div className="divide-y divide-slate-100">
        {filtered.map(ato => <div key={ato.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50/60"><div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"><FileText className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-medium text-slate-900 capitalize">{ato.tipo} nº {ato.numero}</p><CheckCircle2 className="h-4 w-4 text-emerald-500"/></div><p className="text-sm text-slate-500 truncate mt-1">{ato.assunto || ato.ementa}</p></div><div className="text-sm text-slate-500">{new Date(ato.data).toLocaleDateString('pt-BR')}</div><button onClick={()=>generatePDF(ato)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"><Download className="h-4 w-4"/> PDF</button></div>)}
        {filtered.length===0 && <div className="py-16 text-center text-slate-400"><FileArchive className="h-9 w-9 mx-auto mb-2"/>Nenhum arquivo encontrado.</div>}
      </div>
    </div>
  </div>
}
