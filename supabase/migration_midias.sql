-- =========================================================================
-- MIGRAÇÃO: fotos e vídeos institucionais da padaria (exibidos na TV
-- junto com as ofertas)
--
-- Como usar: Supabase > SQL Editor > New query > cole tudo > Run.
-- Seguro rodar mais de uma vez.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. TABELA: midias
-- -------------------------------------------------------------------------
create table if not exists public.midias (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('imagem', 'video')),
  url text not null,
  path text not null,
  titulo text,
  ativa boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_midias_ativa on public.midias (ativa);
create index if not exists idx_midias_ordem on public.midias (ordem);

drop trigger if exists trg_midias_updated_at on public.midias;
create trigger trg_midias_updated_at
before update on public.midias
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- -------------------------------------------------------------------------
alter table public.midias enable row level security;

drop policy if exists "Leitura publica midias ativas" on public.midias;
create policy "Leitura publica midias ativas"
on public.midias for select
to anon, authenticated
using (ativa = true);

drop policy if exists "Admin ve todas as midias" on public.midias;
create policy "Admin ve todas as midias"
on public.midias for select
to authenticated
using (true);

drop policy if exists "Admin insere midias" on public.midias;
create policy "Admin insere midias"
on public.midias for insert
to authenticated
with check (true);

drop policy if exists "Admin atualiza midias" on public.midias;
create policy "Admin atualiza midias"
on public.midias for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admin exclui midias" on public.midias;
create policy "Admin exclui midias"
on public.midias for delete
to authenticated
using (true);

-- -------------------------------------------------------------------------
-- 3. GRANTS para a Data API (mesmo motivo do schema.sql original -
--    projetos Supabase não expõem tabelas novas por padrão)
-- -------------------------------------------------------------------------
grant select on public.midias to anon;
grant select, insert, update, delete on public.midias to authenticated;

-- -------------------------------------------------------------------------
-- 4. STORAGE: bucket separado para fotos/vídeos (arquivos maiores que
--    as fotos de produto - até 30MB por arquivo)
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'midias-panificadora',
  'midias-panificadora',
  true,
  31457280, -- 30MB
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 31457280,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'];

drop policy if exists "Leitura publica midias panificadora" on storage.objects;
create policy "Leitura publica midias panificadora"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'midias-panificadora');

drop policy if exists "Admin envia midias panificadora" on storage.objects;
create policy "Admin envia midias panificadora"
on storage.objects for insert
to authenticated
with check (bucket_id = 'midias-panificadora');

drop policy if exists "Admin atualiza midias panificadora" on storage.objects;
create policy "Admin atualiza midias panificadora"
on storage.objects for update
to authenticated
using (bucket_id = 'midias-panificadora');

drop policy if exists "Admin remove midias panificadora" on storage.objects;
create policy "Admin remove midias panificadora"
on storage.objects for delete
to authenticated
using (bucket_id = 'midias-panificadora');

-- -------------------------------------------------------------------------
-- 5. REALTIME
-- -------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'midias'
  ) then
    alter publication supabase_realtime add table public.midias;
  end if;
end $$;

-- Fim da migração.
