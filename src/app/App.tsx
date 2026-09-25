import { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import {
  Archive, BarChart3, Bot, ChevronRight, FilePlus2, Files, FileText,
  Home, Menu, Plus, Search, ScrollText, Settings, Sparkles, X
} from 'lucide-react';
import { AtoForm } from './components/AtoForm';
import { AtosList } from './components/AtosList';
import { AIAssistant } from './components/AIAssistant';
import { ReportsCenter } from './components/ReportsCenter';
import { FilesCenter } from './components/FilesCenter';
import { Ato, TipoAto } from './types/ato';
import { atosApi } from './services/atosApi';
import { generatePDF } from './utils/pdfGenerator';
import crest from '../assets/6696c35842e33b23360c8ccb64a30130ceed3cde.png';

type View = 'dashboard' | 'atos' | 'novo' | 'ia' | 'relatorios' | 'arquivos';

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Painel', icon: Home },
  { id: 'atos', label: 'Atos administrativos', icon: Files },
  { id: 'novo', label: 'Criar ato', icon: FilePlus2 },
  { id: 'ia', label: 'Assistente IA', icon: Bot },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'arquivos', label: 'Arquivo digital', icon: Archive },
];

export default function App() {
  const [atos, setAtos] = useState<Ato[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [selectedTipo, setSelectedTipo] = useState<TipoAto>('portaria');
  const [editingAto, setEditingAto] = useState<Ato | null>(null);
  const [draftIsNew, setDraftIsNew] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => { loadAtos(); }, []);

  async function loadAtos() {
    try { setLoading(true); setAtos(await atosApi.getAll()); }
    catch (e) { console.error(e); toast.error('Não foi possível carregar os atos.'); }
    finally { setLoading(false); }
  }

  function getNextNumero(tipo: TipoAto) {
    const year = new Date().getFullYear().toString();
    const max = atos.filter(a => a.tipo === tipo && a.numero.includes(`/${year}`)).reduce((acc, a) => {
      const n = Number(a.numero.match(/^(\d+)/)?.[1] || 0); return Math.max(acc, n);
    }, 0) + 1;
    const pad = tipo === 'portaria' ? 2 : 3;
    const base = `${String(max).padStart(pad, '0')}/${year}`;
    return tipo === 'portaria' ? `${base}/GP` : base;
  }

  async function handleAddAto(ato: Ato) {
    try {
      const saved = await atosApi.create(ato);
      setAtos(prev => [saved, ...prev.filter(a => a.id !== saved.id)]);
      generatePDF(saved);
      toast.success('Ato salvo com sucesso.');
      setEditingAto(null); setDraftIsNew(false); setView('atos');
    } catch (e) { console.error(e); toast.error('Erro ao salvar o ato.'); }
  }

  async function handleUpdateAto(ato: Ato) {
    try {
      const saved = await atosApi.update(ato.id, ato);
      setAtos(prev => prev.map(a => a.id === ato.id ? saved : a));
      toast.success('Ato atualizado com sucesso.');
      setEditingAto(null); setDraftIsNew(false); setView('atos');
    } catch (e) { console.error(e); toast.error('Erro ao atualizar o ato.'); }
  }

  async function handleDeleteAto(id: string) {
    await atosApi.delete(id);
    setAtos(prev => prev.filter(a => a.id !== id));
  }

  function openNew(tipo: TipoAto) {
    setSelectedTipo(tipo); setEditingAto(null); setDraftIsNew(false); setView('novo');
  }

  function editAto(ato: Ato) {
    setSelectedTipo(ato.tipo); setEditingAto(ato); setDraftIsNew(false); setView('novo');
  }

  function useAIDraft(ato: Ato) {
    setSelectedTipo(ato.tipo); setEditingAto(ato); setDraftIsNew(true); setView('novo');
  }

  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    return atos.filter(a => [a.numero, a.ementa, a.assunto, a.nome, a.destinatario, a.cargo].filter(Boolean).join(' ').toLowerCase().includes(q)).slice(0,6);
  }, [atos, globalSearch]);

  const counts = {
    portaria: atos.filter(a => a.tipo === 'portaria').length,
    decreto: atos.filter(a => a.tipo === 'decreto').length,
    oficio: atos.filter(a => a.tipo === 'oficio').length,
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <Toaster position="top-right" richColors />

      {mobileMenu && <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={()=>setMobileMenu(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[276px] bg-[#0e1b2a] text-white transition-transform lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-20 px-5 border-b border-white/10 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white p-1.5 flex items-center justify-center overflow-hidden"><img src={crest} className="max-h-full max-w-full object-contain" /></div>
            <div className="min-w-0"><p className="font-semibold tracking-tight">Gestão de Atos</p><p className="text-xs text-slate-400 truncate">Prefeitura de Francisco Macedo</p></div>
            <button className="ml-auto lg:hidden" onClick={()=>setMobileMenu(false)}><X className="h-5 w-5"/></button>
          </div>

          <nav className="p-3 space-y-1 flex-1">
            {navItems.map(item => {
              const Icon = item.icon; const active = view === item.id;
              return <button key={item.id} onClick={()=>{ setView(item.id); setMobileMenu(false); if(item.id!=='novo'){setEditingAto(null);setDraftIsNew(false);} }} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}><Icon className="h-4.5 w-4.5"/><span>{item.label}</span>{item.id==='ia' && <Sparkles className="ml-auto h-3.5 w-3.5 text-amber-300"/>}</button>
            })}
          </nav>

          <div className="p-4 border-t border-white/10"><div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-400">Armazenamento</p><div className="mt-2 flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-emerald-400"></span>Base preparada para nuvem</div></div></div>
        </div>
      </aside>

      <div className="lg:pl-[276px] min-h-screen">
        <header className="sticky top-0 z-30 h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur flex items-center gap-4 px-4 md:px-7">
          <button className="lg:hidden h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center" onClick={()=>setMobileMenu(true)}><Menu className="h-5 w-5"/></button>
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={globalSearch} onChange={e=>setGlobalSearch(e.target.value)} placeholder="Pesquisar ato, número, servidor ou assunto..." className="w-full rounded-xl bg-slate-100/80 border border-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:bg-white focus:border-slate-300" />
            {globalSearch && <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">{searchResults.map(a=><button key={a.id} onClick={()=>{editAto(a);setGlobalSearch('')}} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 border-b last:border-0 border-slate-100"><FileText className="h-4 w-4 text-slate-400"/><div className="min-w-0"><p className="text-sm font-medium capitalize">{a.tipo} {a.numero}</p><p className="text-xs text-slate-500 truncate">{a.assunto || a.ementa}</p></div></button>)}{searchResults.length===0&&<p className="p-4 text-sm text-slate-500">Nenhum resultado.</p>}</div>}
          </div>
          <button onClick={()=>openNew('portaria')} className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"><Plus className="h-4 w-4"/> Novo ato</button>
          <button className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600"><Settings className="h-4 w-4"/></button>
        </header>

        <main className="p-4 md:p-7 xl:p-8 max-w-[1550px] mx-auto">
          {view === 'dashboard' && <>
            <div className="mb-7 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4"><div><p className="text-sm font-medium text-emerald-700">GESTÃO DOCUMENTAL</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 mt-1">Painel de Atos Administrativos</h1><p className="text-slate-500 mt-2">Acompanhe, produza e organize os documentos oficiais do município.</p></div><button onClick={()=>setView('ia')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-50"><Bot className="h-4 w-4"/> Criar com IA</button></div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
              <SummaryCard label="Todos os atos" value={atos.length} icon={Files} onClick={()=>setView('atos')} />
              <SummaryCard label="Portarias" value={counts.portaria} icon={FileText} onClick={()=>openNew('portaria')} />
              <SummaryCard label="Decretos" value={counts.decreto} icon={ScrollText} onClick={()=>openNew('decreto')} />
              <SummaryCard label="Ofícios" value={counts.oficio} icon={FilePlus2} onClick={()=>openNew('oficio')} />
            </div>
            <div className="grid xl:grid-cols-[1.5fr_.75fr] gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-semibold">Atos recentes</h2><p className="text-sm text-slate-500 mt-1">Últimos documentos registrados</p></div><button onClick={()=>setView('atos')} className="text-sm font-medium text-slate-600 hover:text-slate-950 flex items-center gap-1">Ver todos <ChevronRight className="h-4 w-4"/></button></div><RecentList atos={atos.slice(0,7)} onEdit={editAto}/></div>
              <div className="space-y-5"><div className="rounded-3xl bg-[#0e1b2a] p-6 text-white shadow-sm"><div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center mb-5"><Bot className="h-5 w-5"/></div><h3 className="text-lg font-semibold">Assistente com IA</h3><p className="mt-2 text-sm leading-6 text-slate-300">Descreva o que precisa e receba uma minuta pronta para revisar, ajustar e salvar.</p><button onClick={()=>setView('ia')} className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950">Abrir assistente</button></div><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Arquivo digital</p><p className="text-2xl font-semibold mt-1">{atos.length} documentos</p><button onClick={()=>setView('arquivos')} className="mt-4 text-sm font-medium text-emerald-700">Acessar arquivos →</button></div></div>
            </div>
          </>}

          {view === 'atos' && <div><div className="mb-6"><h1 className="text-2xl font-semibold">Atos administrativos</h1><p className="text-sm text-slate-500 mt-1">Consulte, edite, baixe ou exclua documentos.</p></div>{loading ? <Loading/> : <AtosList atos={atos} onDelete={handleDeleteAto} onEdit={editAto}/>}</div>}

          {view === 'novo' && <div><div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><h1 className="text-2xl font-semibold">{editingAto && !draftIsNew ? 'Editar ato' : draftIsNew ? 'Revisar minuta da IA' : 'Novo ato'}</h1><p className="text-sm text-slate-500 mt-1">Revise as informações antes de salvar e gerar o documento.</p></div>{!editingAto && <div className="flex gap-2">{(['portaria','decreto','oficio'] as TipoAto[]).map(t=><button key={t} onClick={()=>setSelectedTipo(t)} className={`rounded-xl px-3 py-2 text-sm capitalize border ${selectedTipo===t?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-200 text-slate-600'}`}>{t}</button>)}</div>}</div><AtoForm tipo={selectedTipo} onSubmit={editingAto && !draftIsNew ? handleUpdateAto : handleAddAto} nextNumero={editingAto?.numero || getNextNumero(selectedTipo)} editingAto={editingAto} onCancelEdit={()=>{setEditingAto(null);setDraftIsNew(false);setView('atos')}} /></div>}

          {view === 'ia' && <AIAssistant onUseDraft={useAIDraft} nextNumber={getNextNumero}/>}          
          {view === 'relatorios' && <ReportsCenter atos={atos}/>}          
          {view === 'arquivos' && <FilesCenter atos={atos}/>}          
        </main>
      </div>
    </div>
  );
}

function SummaryCard({label,value,icon:Icon,onClick}:{label:string;value:number;icon:any;onClick:()=>void}){
  return <button onClick={onClick} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"><div className="flex items-center justify-between"><div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"><Icon className="h-5 w-5"/></div><ChevronRight className="h-4 w-4 text-slate-300"/></div><p className="mt-5 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></button>
}

function RecentList({atos,onEdit}:{atos:Ato[];onEdit:(a:Ato)=>void}){
  if(!atos.length) return <div className="py-16 text-center text-sm text-slate-400">Nenhum ato cadastrado.</div>;
  return <div className="divide-y divide-slate-100">{atos.map(a=><button key={a.id} onClick={()=>onEdit(a)} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-slate-50"><div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><FileText className="h-4 w-4 text-slate-600"/></div><div className="min-w-0 flex-1"><p className="text-sm font-medium capitalize text-slate-900">{a.tipo} nº {a.numero}</p><p className="text-xs text-slate-500 truncate mt-1">{a.assunto || a.ementa}</p></div><span className="hidden sm:block text-xs text-slate-400">{new Date(a.data).toLocaleDateString('pt-BR')}</span><ChevronRight className="h-4 w-4 text-slate-300"/></button>)}</div>
}

function Loading(){return <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center text-slate-500">Carregando atos...</div>}
