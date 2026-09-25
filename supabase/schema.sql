-- Estrutura recomendada para o novo Sistema de Gestão de Atos
create extension if not exists pgcrypto;

create table if not exists public.atos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('portaria','decreto','oficio')),
  subtipo_portaria text,
  numero text not null,
  ano integer not null,
  data date not null,
  ementa text not null default '',
  nome text,
  cpf text,
  cargo text,
  codigo_cargo text,
  portaria_anterior text,
  periodo_inicio date,
  periodo_fim date,
  motivo text,
  destinatario text,
  cargo_destinatario text,
  entidade_destinatario text,
  assunto text,
  considerandos jsonb not null default '[]'::jsonb,
  artigos jsonb not null default '[]'::jsonb,
  municipio text not null default 'Francisco Macedo',
  estado text not null default 'Piauí',
  lei_referencia text,
  autoridade text not null,
  cargo_autoridade text not null,
  site text,
  email text,
  alinhamento text not null default 'justify',
  status text not null default 'rascunho' check (status in ('rascunho','finalizado','revogado','arquivado')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tipo, numero)
);

create index if not exists atos_tipo_ano_idx on public.atos(tipo, ano desc);
create index if not exists atos_data_idx on public.atos(data desc);
create index if not exists atos_busca_idx on public.atos using gin (to_tsvector('portuguese', coalesce(numero,'') || ' ' || coalesce(ementa,'') || ' ' || coalesce(nome,'') || ' ' || coalesce(assunto,'')));

create table if not exists public.ato_arquivos (
  id uuid primary key default gen_random_uuid(),
  ato_id uuid not null references public.atos(id) on delete cascade,
  nome_arquivo text not null,
  storage_path text not null,
  mime_type text not null default 'application/pdf',
  tamanho_bytes bigint,
  versao integer not null default 1,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.ato_historico (
  id bigint generated always as identity primary key,
  ato_id uuid not null references public.atos(id) on delete cascade,
  usuario_id uuid references auth.users(id),
  acao text not null,
  detalhes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.atos enable row level security;
alter table public.ato_arquivos enable row level security;
alter table public.ato_historico enable row level security;

-- Usuários autenticados do sistema podem trabalhar com os atos.
create policy "atos autenticados leitura" on public.atos for select to authenticated using (true);
create policy "atos autenticados inserir" on public.atos for insert to authenticated with check (auth.uid() = created_by);
create policy "atos autenticados atualizar" on public.atos for update to authenticated using (true) with check (true);
create policy "atos autenticados excluir" on public.atos for delete to authenticated using (true);

create policy "arquivos autenticados leitura" on public.ato_arquivos for select to authenticated using (true);
create policy "arquivos autenticados inserir" on public.ato_arquivos for insert to authenticated with check (auth.uid() = created_by);
create policy "historico autenticados leitura" on public.ato_historico for select to authenticated using (true);
create policy "historico autenticados inserir" on public.ato_historico for insert to authenticated with check (auth.uid() = usuario_id);

insert into storage.buckets (id, name, public)
values ('atos', 'atos', false)
on conflict (id) do nothing;

create policy "storage atos autenticados leitura" on storage.objects for select to authenticated using (bucket_id = 'atos');
create policy "storage atos autenticados inserir" on storage.objects for insert to authenticated with check (bucket_id = 'atos');
create policy "storage atos autenticados atualizar" on storage.objects for update to authenticated using (bucket_id = 'atos');
