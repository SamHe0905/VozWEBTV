-- ═══════════════════════════════════════════════════════════════════
-- VOZ WEBTV — Reforço de permissões (defesa em profundidade)
-- ───────────────────────────────────────────────────────────────────
-- POR QUE ISTO EXISTE
--
-- O schema.sql original libera escrita para QUALQUER usuário autenticado:
--
--     for insert to authenticated with check (true)
--
-- Isso só é seguro enquanto o cadastro público estiver desligado. Se
-- alguém ligar o cadastro de novo — sem querer, ou um ano depois, ou
-- outra pessoa que assumir o projeto — o site volta a ficar exposto:
-- a chave publicável está no código, qualquer um cria conta e passa a
-- poder apagar a grade inteira.
--
-- Este arquivo troca esse critério: escrever passa a exigir estar numa
-- lista de editores, mantida só por quem tem acesso ao SQL Editor.
-- Criar uma conta deixa de dar qualquer poder por si só.
--
-- COMO USAR
--   1. Crie as contas em Authentication → Users
--   2. Ajuste a lista de e-mails no passo 3 abaixo
--   3. Cole tudo no SQL Editor e clique em RUN
--
-- Pode rodar quantas vezes quiser.
-- ═══════════════════════════════════════════════════════════════════


-- ═══ 1. Lista de quem pode editar ══════════════════════════════════
create table if not exists public.editores (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  nome      text not null default '',
  criado_em timestamptz not null default now()
);

alter table public.editores enable row level security;

-- A própria lista só pode ser lida por quem está autenticado, e não pode
-- ser alterada pela API de jeito nenhum: só pelo SQL Editor. Sem isso,
-- um editor poderia se promover ou promover outra pessoa.
drop policy if exists "editores_leitura" on public.editores;
create policy "editores_leitura" on public.editores
  for select to authenticated using (true);


-- ═══ 2. Quem é editor? ═════════════════════════════════════════════
-- `security definer` faz a função enxergar a tabela mesmo com RLS ligado.
-- `search_path` fixo evita que alguém redirecione a consulta.
create or replace function public.eh_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $funcao$
  select exists (
    select 1 from public.editores where user_id = auth.uid()
  );
$funcao$;


-- ═══ 3. Cadastre a equipe ══════════════════════════════════════════
-- Promove a editor TODA conta que já existe em Authentication → Users.
--
-- Isso é seguro porque o cadastro público está desligado: só existe conta
-- que alguém criou de propósito no painel do Supabase. E evita o erro mais
-- provável aqui — digitar um e-mail diferente do cadastrado e descobrir
-- depois, tentando salvar e levando "sem permissão".
--
-- Nenhum e-mail escrito no arquivo também é de propósito: o repositório é
-- público, e endereço em repositório público vira alvo de spam.
insert into public.editores (user_id, email, nome)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', '')
from auth.users u
on conflict (user_id) do nothing;

-- Se um dia quiser dar acesso a só algumas contas, troque o insert acima
-- por este e liste os e-mails:
--
-- insert into public.editores (user_id, email, nome)
-- select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', '')
-- from auth.users u
-- where u.email in ('fulano@exemplo.com', 'ciclana@exemplo.com')
-- on conflict (user_id) do nothing;
--
-- Para TIRAR o acesso de alguém sem apagar a conta:
--   delete from public.editores where email = 'fulano@exemplo.com';


-- ═══ 4. Escrita passa a exigir estar na lista ══════════════════════
do $bloco$
declare
  t text;
begin
  foreach t in array array['programacao', 'noticias', 'equipe', 'config'] loop
    -- Remove as políticas antigas, que confiavam em "autenticado".
    execute format('drop policy if exists %I on public.%I', t || '_insere_autenticado', t);
    execute format('drop policy if exists %I on public.%I', t || '_atualiza_autenticado', t);
    execute format('drop policy if exists %I on public.%I', t || '_apaga_autenticado', t);

    execute format($p$
      create policy %I on public.%I
        for insert to authenticated with check (public.eh_editor())
    $p$, t || '_insere_editor', t);

    execute format($p$
      create policy %I on public.%I
        for update to authenticated using (public.eh_editor()) with check (public.eh_editor())
    $p$, t || '_atualiza_editor', t);

    execute format($p$
      create policy %I on public.%I
        for delete to authenticated using (public.eh_editor())
    $p$, t || '_apaga_editor', t);
  end loop;
end
$bloco$;


-- ═══ CONFERÊNCIA ═══════════════════════════════════════════════════
-- Deve listar as contas que podem editar.
select e.email, e.nome, e.criado_em
from public.editores e
order by e.criado_em;

-- Deve mostrar 4 tabelas × 4 políticas = 16, sendo 12 com "editor" no nome.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('programacao', 'noticias', 'equipe', 'config')
order by tablename, cmd;
