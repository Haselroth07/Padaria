-- =========================================================================
-- Sistema de Ofertas para TV — Panificadora
-- Script de criacao do banco de dados (Supabase / PostgreSQL)
--
-- Como usar: no painel do Supabase, abra "SQL Editor" > "New query",
-- cole TODO este arquivo e clique em "Run". O script pode ser executado
-- mais de uma vez sem erro (é seguro rodar novamente se precisar).
-- =========================================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------------
-- 1. TABELA: ofertas
-- -------------------------------------------------------------------------
create table if not exists public.ofertas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco numeric(10,2) not null check (preco >= 0),
  preco_promocional numeric(10,2) check (preco_promocional is null or preco_promocional >= 0),
  imagem_url text,
  imagem_path text,
  categoria text,
  data_inicio date not null default current_date,
  data_fim date not null,
  ativa boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint datas_validas check (data_fim >= data_inicio)
);

create index if not exists idx_ofertas_ativa on public.ofertas (ativa);
create index if not exists idx_ofertas_datas on public.ofertas (data_inicio, data_fim);
create index if not exists idx_ofertas_ordem on public.ofertas (ordem);
create index if not exists idx_ofertas_categoria on public.ofertas (categoria);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ofertas_updated_at on public.ofertas;
create trigger trg_ofertas_updated_at
before update on public.ofertas
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- 2. TABELA: configuracoes (linha unica, id fixo = 1)
-- -------------------------------------------------------------------------
create table if not exists public.configuracoes (
  id integer primary key default 1,
  nome_padaria text not null default 'Minha Padaria',
  logo_url text,
  logo_path text,
  mensagem_rodape text default 'Ofertas válidas enquanto durarem os estoques.',
  tempo_exibicao integer not null default 6 check (tempo_exibicao between 3 and 60),
  modo_transicao text not null default 'fade' check (modo_transicao in ('fade','slide')),
  exibir_preco_antigo boolean not null default true,
  exibir_categoria boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

insert into public.configuracoes (id) values (1)
on conflict (id) do nothing;

drop trigger if exists trg_configuracoes_updated_at on public.configuracoes;
create trigger trg_configuracoes_updated_at
before update on public.configuracoes
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- -------------------------------------------------------------------------
alter table public.ofertas enable row level security;
alter table public.configuracoes enable row level security;

drop policy if exists "Leitura publica ofertas ativas" on public.ofertas;
create policy "Leitura publica ofertas ativas"
on public.ofertas for select
to anon, authenticated
using (ativa = true);

drop policy if exists "Admin ve todas as ofertas" on public.ofertas;
create policy "Admin ve todas as ofertas"
on public.ofertas for select
to authenticated
using (true);

drop policy if exists "Admin insere ofertas" on public.ofertas;
create policy "Admin insere ofertas"
on public.ofertas for insert
to authenticated
with check (true);

drop policy if exists "Admin atualiza ofertas" on public.ofertas;
create policy "Admin atualiza ofertas"
on public.ofertas for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admin exclui ofertas" on public.ofertas;
create policy "Admin exclui ofertas"
on public.ofertas for delete
to authenticated
using (true);

drop policy if exists "Leitura publica configuracoes" on public.configuracoes;
create policy "Leitura publica configuracoes"
on public.configuracoes for select
to anon, authenticated
using (true);

drop policy if exists "Admin atualiza configuracoes" on public.configuracoes;
create policy "Admin atualiza configuracoes"
on public.configuracoes for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admin insere configuracoes" on public.configuracoes;
create policy "Admin insere configuracoes"
on public.configuracoes for insert
to authenticated
with check (true);

-- -------------------------------------------------------------------------
-- 4. GRANTS PARA A DATA API (obrigatorio em projetos Supabase criados a
--    partir de 30/05/2026 - o Supabase deixou de expor tabelas novas
--    automaticamente para a Data API/PostgREST). Sem isso o app recebe
--    404 do Supabase mesmo com o RLS certo.
-- -------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.ofertas to anon;
grant select, insert, update, delete on public.ofertas to authenticated;

grant select on public.configuracoes to anon;
grant select, insert, update on public.configuracoes to authenticated;

-- -------------------------------------------------------------------------
-- 5. STORAGE: bucket para as imagens das ofertas/logo
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ofertas-imagens',
  'ofertas-imagens',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Leitura publica imagens ofertas" on storage.objects;
create policy "Leitura publica imagens ofertas"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'ofertas-imagens');

drop policy if exists "Admin envia imagens ofertas" on storage.objects;
create policy "Admin envia imagens ofertas"
on storage.objects for insert
to authenticated
with check (bucket_id = 'ofertas-imagens');

drop policy if exists "Admin atualiza imagens ofertas" on storage.objects;
create policy "Admin atualiza imagens ofertas"
on storage.objects for update
to authenticated
using (bucket_id = 'ofertas-imagens');

drop policy if exists "Admin remove imagens ofertas" on storage.objects;
create policy "Admin remove imagens ofertas"
on storage.objects for delete
to authenticated
using (bucket_id = 'ofertas-imagens');

-- -------------------------------------------------------------------------
-- 6. REALTIME: garante que as tabelas estao na publicacao usada pelo
--    supabase-js para o Realtime (INSERT/UPDATE/DELETE ao vivo na TV)
-- -------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ofertas'
  ) then
    alter publication supabase_realtime add table public.ofertas;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'configuracoes'
  ) then
    alter publication supabase_realtime add table public.configuracoes;
  end if;
end $$;

-- -------------------------------------------------------------------------
-- 7. DADOS DE EXEMPLO (para testar o sistema imediatamente)
--    Cobre os 4 status possiveis: ativa, agendada, expirada e inativa.
--    Rode só uma vez - se rodar de novo vai duplicar os exemplos
--    (não tem problema, é só apagar depois pelo painel).
-- -------------------------------------------------------------------------
insert into public.ofertas
  (nome, descricao, preco, preco_promocional, categoria, data_inicio, data_fim, ativa, ordem, imagem_url)
values
  ('Pão de Queijo', 'Pão de queijo quentinho, feito na hora', 8.90, 6.90, 'Salgados',
   current_date - 2, current_date + 10, true, 1,
   'https://images.unsplash.com/photo-1619535860434-ba1d8fa72c50?w=1200'),

  ('Café + Pão na Chapa', 'Café coado + pão francês na chapa com manteiga', 12.90, 9.90, 'Combos',
   current_date, current_date + 7, true, 2,
   'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=1200'),

  ('Bolo de Fubá', 'Fatia generosa, receita da vovó', 7.50, 5.90, 'Doces',
   current_date - 1, current_date + 14, true, 3,
   'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=1200'),

  ('Croissant Folhado', null, 9.90, null, 'Salgados',
   current_date, current_date + 30, true, 4, null),

  ('Torta de Frango', 'Fatia individual, recheio cremoso', 11.90, 8.90, 'Salgados',
   current_date, current_date + 5, true, 5,
   'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200'),

  ('Suco Natural 300ml', 'Laranja, abacaxi ou maracujá', 6.90, null, 'Bebidas',
   current_date, current_date + 20, true, 6, null),

  ('Combo Café da Manhã', 'Pão na chapa + suco + café', 18.90, 14.90, 'Combos',
   current_date + 3, current_date + 12, true, 7,
   'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200'),

  ('Sonho de Doce de Leite', 'Edição de inverno - exemplo de oferta EXPIRADA', 6.50, 4.90, 'Doces',
   current_date - 20, current_date - 5, true, 8,
   'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200'),

  ('Torrada com Requeijão', 'Exemplo de oferta INATIVA (desligada manualmente)', 5.90, null, 'Salgados',
   current_date, current_date + 10, false, 9, null)
on conflict do nothing;

-- Fim do script. Se tudo rodou sem erro, seu banco está pronto.
