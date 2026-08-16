-- ═══════════════════════════════════════════════════════════════════
-- VOZ WEBTV — esquema do banco (Supabase / PostgreSQL)
-- Escola Estadual Teotônio Vilela — Campo Grande, MS
-- ───────────────────────────────────────────────────────────────────
-- GERADO AUTOMATICAMENTE. Mesma fonte de dados de assets/js/mock.js.
--
-- COMO USAR
--   1. Supabase → SQL Editor → New query
--   2. Cole este arquivo inteiro e clique em RUN
--   Pode rodar de novo quando quiser: ele recria tudo do zero.
--   ATENÇÃO: rodar de novo APAGA o que já estiver cadastrado.
--
-- SEGURANÇA
--   RLS ligado nas quatro tabelas:
--     • visitante do site   -> só LEITURA
--     • usuário autenticado -> leitura e escrita
--
--   Depois de rodar, DESLIGUE o cadastro público em
--   Authentication → Providers → Email → "Enable sign ups" = OFF.
--   Sem isso qualquer pessoa cria uma conta e passa a editar a grade.
--   Crie as contas da equipe manualmente em Authentication → Users.
-- ═══════════════════════════════════════════════════════════════════

-- Recomeça do zero, para o arquivo poder ser rodado mais de uma vez.
drop table if exists public.programacao cascade;
drop table if exists public.noticias    cascade;
drop table if exists public.equipe      cascade;
drop table if exists public.config      cascade;

-- Mantém `atualizado_em` correto sem depender de quem escreve.
create or replace function public.toca_atualizado_em()
returns trigger language plpgsql as $funcao$
begin
  new.atualizado_em = now();
  return new;
end
$funcao$;


-- ═══ PROGRAMAÇÃO ═══════════════════════════════════════════════════
-- Horário fica como texto 'HH:MM' de propósito: é o formato que o site
-- usa, ordena certo em ordem alfabética por ser sempre zero-padded, e
-- evita surpresa de fuso na conversão de `time`.
create table public.programacao (
  id            bigint generated always as identity primary key,
  dia           text not null check (dia in ('DOMINGO','SEGUNDA','TERÇA','QUARTA','QUINTA','SEXTA','SÁBADO')),
  hora_inicio   text not null check (hora_inicio ~ '^[0-2][0-9]:[0-5][0-9]$'),
  hora_fim      text not null check (hora_fim    ~ '^[0-2][0-9]:[0-5][0-9]$'),
  programa      text not null check (length(trim(programa)) > 0),
  tipo          text not null default 'AUTOMATICO' check (tipo in ('AO VIVO','AUTOMATICO')),
  apresentador  text not null default '',
  descricao     text not null default '',
  categoria     text not null default '',
  cor           text not null default 'branco' check (cor in ('verde','azul','amarelo','branco')),
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  -- Bloco com locutor precisa dizer quem apresenta.
  constraint apresentador_obrigatorio_ao_vivo
    check (tipo <> 'AO VIVO' or length(trim(apresentador)) > 0)
);
create index programacao_dia_hora on public.programacao (dia, hora_inicio);
create trigger t_programacao before update on public.programacao
  for each row execute function public.toca_atualizado_em();


-- ═══ NOTÍCIAS ══════════════════════════════════════════════════════
create table public.noticias (
  id            bigint generated always as identity primary key,
  data          date not null default current_date,
  titulo        text not null check (length(trim(titulo)) > 0),
  resumo        text not null default '',
  imagem        text not null default '',
  link          text not null default '',
  destaque      boolean not null default false,
  categoria     text not null default 'NOTÍCIA',
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index noticias_data on public.noticias (data desc);
create trigger t_noticias before update on public.noticias
  for each row execute function public.toca_atualizado_em();


-- ═══ EQUIPE ════════════════════════════════════════════════════════
-- Só nome, função e turma. NUNCA endereço, telefone, CPF ou matrícula:
-- esta tabela é lida publicamente pelo site.
create table public.equipe (
  id            bigint generated always as identity primary key,
  nome          text not null check (length(trim(nome)) > 0),
  funcao        text not null default '',
  turma         text not null default '',
  foto          text not null default '',
  ordem         int  not null default 0,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create trigger t_equipe before update on public.equipe
  for each row execute function public.toca_atualizado_em();


-- ═══ CONFIG ════════════════════════════════════════════════════════
create table public.config (
  chave         text primary key,
  valor         text not null default '',
  descricao     text not null default '',
  atualizado_em timestamptz not null default now()
);
create trigger t_config before update on public.config
  for each row execute function public.toca_atualizado_em();


-- ═══ SEGURANÇA (RLS) ═══════════════════════════════════════════════
alter table public.programacao enable row level security;
alter table public.noticias    enable row level security;
alter table public.equipe      enable row level security;
alter table public.config      enable row level security;

-- programacao
create policy "programacao_leitura_publica" on public.programacao
  for select to anon, authenticated using (true);
create policy "programacao_insere_autenticado" on public.programacao
  for insert to authenticated with check (true);
create policy "programacao_atualiza_autenticado" on public.programacao
  for update to authenticated using (true) with check (true);
create policy "programacao_apaga_autenticado" on public.programacao
  for delete to authenticated using (true);

-- noticias
create policy "noticias_leitura_publica" on public.noticias
  for select to anon, authenticated using (true);
create policy "noticias_insere_autenticado" on public.noticias
  for insert to authenticated with check (true);
create policy "noticias_atualiza_autenticado" on public.noticias
  for update to authenticated using (true) with check (true);
create policy "noticias_apaga_autenticado" on public.noticias
  for delete to authenticated using (true);

-- equipe
create policy "equipe_leitura_publica" on public.equipe
  for select to anon, authenticated using (true);
create policy "equipe_insere_autenticado" on public.equipe
  for insert to authenticated with check (true);
create policy "equipe_atualiza_autenticado" on public.equipe
  for update to authenticated using (true) with check (true);
create policy "equipe_apaga_autenticado" on public.equipe
  for delete to authenticated using (true);

-- config
create policy "config_leitura_publica" on public.config
  for select to anon, authenticated using (true);
create policy "config_insere_autenticado" on public.config
  for insert to authenticated with check (true);
create policy "config_atualiza_autenticado" on public.config
  for update to authenticated using (true) with check (true);
create policy "config_apaga_autenticado" on public.config
  for delete to authenticated using (true);


-- ═══ DADOS INICIAIS ════════════════════════════════════════════════

insert into public.programacao
  (dia, hora_inicio, hora_fim, programa, tipo, apresentador, descricao, categoria, cor, ativo)
values
  ('SEGUNDA', '00:00', '06:00', 'Madrugada Sonora', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('SEGUNDA', '06:00', '07:00', 'Primeira Chamada', 'AUTOMATICO', '', 'A trilha que acorda a escola.', 'MÚSICA', 'branco', true),
  ('SEGUNDA', '07:00', '07:30', 'Bom Dia, Escola', 'AO VIVO', 'Equipe Voz WebTV', 'Avisos da direção, aniversariantes e a trilha para começar o dia.', 'ABERTURA', 'amarelo', true),
  ('SEGUNDA', '07:30', '09:30', 'Manhã Musical', 'AUTOMATICO', '', 'Música durante as primeiras aulas.', 'MÚSICA', 'branco', true),
  ('SEGUNDA', '09:30', '10:30', 'Manhã na Escola', 'AO VIVO', 'Turma do 9º A', 'Notícias da comunidade escolar com pauta produzida pelos alunos.', 'NOTÍCIAS', 'verde', true),
  ('SEGUNDA', '10:30', '13:00', 'Trilha da Manhã', 'AUTOMATICO', '', 'Música até o fim do turno matutino.', 'MÚSICA', 'branco', true),
  ('SEGUNDA', '13:00', '14:00', 'Ciência em 5 Minutos', 'AO VIVO', 'Clube de Ciências', 'Experimentos, curiosidades e o que caiu no vestibular.', 'EDUCAÇÃO', 'azul', true),
  ('SEGUNDA', '14:00', '15:00', 'Tarde Musical', 'AUTOMATICO', '', 'Música durante as aulas da tarde.', 'MÚSICA', 'branco', true),
  ('SEGUNDA', '15:00', '16:00', 'Sinal de Saída', 'AO VIVO', 'DJ da Semana', 'A trilha para fechar o turno da tarde.', 'MÚSICA', 'amarelo', true),
  ('SEGUNDA', '16:00', '19:00', 'Tarde Livre', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('SEGUNDA', '19:00', '20:00', 'Serão Musical', 'AUTOMATICO', '', 'Música para o período noturno, sem locução.', 'MÚSICA', 'branco', true),
  ('SEGUNDA', '20:00', '00:00', 'Trilha da Noite', 'AUTOMATICO', '', 'Música para a madrugada, sem locução.', 'MÚSICA', 'branco', true),
  ('TERÇA', '00:00', '06:00', 'Madrugada Sonora', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('TERÇA', '06:00', '07:00', 'Primeira Chamada', 'AUTOMATICO', '', 'A trilha que acorda a escola.', 'MÚSICA', 'branco', true),
  ('TERÇA', '07:00', '07:30', 'Bom Dia, Escola', 'AO VIVO', 'Equipe Voz WebTV', 'Avisos da direção, aniversariantes e a trilha para começar o dia.', 'ABERTURA', 'amarelo', true),
  ('TERÇA', '07:30', '09:30', 'Manhã Musical', 'AUTOMATICO', '', 'Música durante as primeiras aulas.', 'MÚSICA', 'branco', true),
  ('TERÇA', '09:30', '10:30', 'Playlist do Intervalo', 'AO VIVO', 'Grêmio Estudantil', 'Os pedidos musicais da semana, votados pelas turmas.', 'MÚSICA', 'amarelo', true),
  ('TERÇA', '10:30', '13:00', 'Trilha da Manhã', 'AUTOMATICO', '', 'Música até o fim do turno matutino.', 'MÚSICA', 'branco', true),
  ('TERÇA', '13:00', '14:00', 'Esporte Total', 'AO VIVO', 'Turma do 8º B', 'Cobertura dos jogos internos e da olimpíada escolar.', 'ESPORTE', 'verde', true),
  ('TERÇA', '14:00', '15:00', 'Tarde Musical', 'AUTOMATICO', '', 'Música durante as aulas da tarde.', 'MÚSICA', 'branco', true),
  ('TERÇA', '15:00', '16:00', 'Sinal de Saída', 'AO VIVO', 'DJ da Semana', 'A trilha para fechar o turno da tarde.', 'MÚSICA', 'amarelo', true),
  ('TERÇA', '16:00', '19:00', 'Tarde Livre', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('TERÇA', '19:00', '20:00', 'Serão Cultural', 'AO VIVO', 'Turmas da EJA', 'Programa noturno produzido pelos estudantes da EJA.', 'CULTURA', 'azul', true),
  ('TERÇA', '20:00', '00:00', 'Trilha da Noite', 'AUTOMATICO', '', 'Música para a madrugada, sem locução.', 'MÚSICA', 'branco', true),
  ('QUARTA', '00:00', '06:00', 'Madrugada Sonora', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('QUARTA', '06:00', '07:00', 'Primeira Chamada', 'AUTOMATICO', '', 'A trilha que acorda a escola.', 'MÚSICA', 'branco', true),
  ('QUARTA', '07:00', '07:30', 'Bom Dia, Escola', 'AO VIVO', 'Equipe Voz WebTV', 'Avisos da direção, aniversariantes e a trilha para começar o dia.', 'ABERTURA', 'amarelo', true),
  ('QUARTA', '07:30', '09:30', 'Manhã Musical', 'AUTOMATICO', '', 'Música durante as primeiras aulas.', 'MÚSICA', 'branco', true),
  ('QUARTA', '09:30', '10:30', 'Estúdio Aberto', 'AO VIVO', 'Prof. Marina Alves', 'Entrevistas com professores, servidores e visitantes da escola.', 'ENTREVISTA', 'verde', true),
  ('QUARTA', '10:30', '13:00', 'Trilha da Manhã', 'AUTOMATICO', '', 'Música até o fim do turno matutino.', 'MÚSICA', 'branco', true),
  ('QUARTA', '13:00', '14:00', 'Tecnologia na Prática', 'AO VIVO', 'Clube de Robótica', 'Projetos, códigos e o que a turma constrói no laboratório.', 'TECNOLOGIA', 'azul', true),
  ('QUARTA', '14:00', '15:00', 'Tarde Musical', 'AUTOMATICO', '', 'Música durante as aulas da tarde.', 'MÚSICA', 'branco', true),
  ('QUARTA', '15:00', '16:00', 'Sinal de Saída', 'AO VIVO', 'DJ da Semana', 'A trilha para fechar o turno da tarde.', 'MÚSICA', 'amarelo', true),
  ('QUARTA', '16:00', '19:00', 'Tarde Livre', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('QUARTA', '19:00', '20:00', 'Serão Musical', 'AUTOMATICO', '', 'Música para o período noturno, sem locução.', 'MÚSICA', 'branco', true),
  ('QUARTA', '20:00', '00:00', 'Trilha da Noite', 'AUTOMATICO', '', 'Música para a madrugada, sem locução.', 'MÚSICA', 'branco', true),
  ('QUINTA', '00:00', '06:00', 'Madrugada Sonora', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('QUINTA', '06:00', '07:00', 'Primeira Chamada', 'AUTOMATICO', '', 'A trilha que acorda a escola.', 'MÚSICA', 'branco', true),
  ('QUINTA', '07:00', '07:30', 'Bom Dia, Escola', 'AO VIVO', 'Equipe Voz WebTV', 'Avisos da direção, aniversariantes e a trilha para começar o dia.', 'ABERTURA', 'amarelo', true),
  ('QUINTA', '07:30', '09:30', 'Manhã Musical', 'AUTOMATICO', '', 'Música durante as primeiras aulas.', 'MÚSICA', 'branco', true),
  ('QUINTA', '09:30', '10:30', 'Manhã na Escola', 'AO VIVO', 'Turma do 9º A', 'Notícias da comunidade escolar com pauta produzida pelos alunos.', 'NOTÍCIAS', 'verde', true),
  ('QUINTA', '10:30', '13:00', 'Trilha da Manhã', 'AUTOMATICO', '', 'Música até o fim do turno matutino.', 'MÚSICA', 'branco', true),
  ('QUINTA', '13:00', '14:00', 'Jornal da Voz', 'AO VIVO', 'Equipe de Reportagem', 'A edição da semana, transmitida também pela WebTV.', 'JORNALISMO', 'azul', true),
  ('QUINTA', '14:00', '15:00', 'Tarde Musical', 'AUTOMATICO', '', 'Música durante as aulas da tarde.', 'MÚSICA', 'branco', true),
  ('QUINTA', '15:00', '16:00', 'Sinal de Saída', 'AO VIVO', 'DJ da Semana', 'A trilha para fechar o turno da tarde.', 'MÚSICA', 'amarelo', true),
  ('QUINTA', '16:00', '19:00', 'Tarde Livre', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('QUINTA', '19:00', '20:00', 'Serão Cultural', 'AO VIVO', 'Turmas da EJA', 'Programa noturno produzido pelos estudantes da EJA.', 'CULTURA', 'verde', true),
  ('QUINTA', '20:00', '00:00', 'Trilha da Noite', 'AUTOMATICO', '', 'Música para a madrugada, sem locução.', 'MÚSICA', 'branco', true),
  ('SEXTA', '00:00', '06:00', 'Madrugada Sonora', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('SEXTA', '06:00', '07:00', 'Primeira Chamada', 'AUTOMATICO', '', 'A trilha que acorda a escola.', 'MÚSICA', 'branco', true),
  ('SEXTA', '07:00', '07:30', 'Bom Dia, Escola', 'AO VIVO', 'Equipe Voz WebTV', 'Avisos da direção, aniversariantes e a trilha para começar o dia.', 'ABERTURA', 'amarelo', true),
  ('SEXTA', '07:30', '09:30', 'Manhã Musical', 'AUTOMATICO', '', 'Música durante as primeiras aulas.', 'MÚSICA', 'branco', true),
  ('SEXTA', '09:30', '10:30', 'Sexta Sonora', 'AO VIVO', 'Coletivo de Música', 'Bandas da escola, artistas de MS e a playlist da semana.', 'MÚSICA', 'amarelo', true),
  ('SEXTA', '10:30', '13:00', 'Trilha da Manhã', 'AUTOMATICO', '', 'Música até o fim do turno matutino.', 'MÚSICA', 'branco', true),
  ('SEXTA', '13:00', '14:00', 'Cine Voz', 'AO VIVO', 'Clube de Cinema', 'Resenhas, indicações e a produção audiovisual da turma.', 'CINEMA', 'verde', true),
  ('SEXTA', '14:00', '15:00', 'Tarde Musical', 'AUTOMATICO', '', 'Música durante as aulas da tarde.', 'MÚSICA', 'branco', true),
  ('SEXTA', '15:00', '16:00', 'Sinal de Saída', 'AO VIVO', 'DJ da Semana', 'A trilha para fechar o turno da tarde.', 'MÚSICA', 'amarelo', true),
  ('SEXTA', '16:00', '19:00', 'Tarde Livre', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('SEXTA', '19:00', '20:00', 'Serão Musical', 'AUTOMATICO', '', 'Música para o período noturno, sem locução.', 'MÚSICA', 'branco', true),
  ('SEXTA', '20:00', '00:00', 'Trilha da Noite', 'AUTOMATICO', '', 'Música para a madrugada, sem locução.', 'MÚSICA', 'branco', true),
  ('SÁBADO', '00:00', '09:00', 'Madrugada Sonora', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('SÁBADO', '09:00', '11:00', 'Especial de Sábado', 'AO VIVO', 'Alunos convidados', 'Programa temático produzido por uma turma diferente a cada semana.', 'ESPECIAL', 'verde', true),
  ('SÁBADO', '11:00', '16:00', 'Trilha Livre', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('SÁBADO', '16:00', '17:00', 'Oficina no Ar', 'AO VIVO', 'Oficina de Locução', 'Os alunos da oficina assumem os microfones.', 'OFICINA', 'amarelo', true),
  ('SÁBADO', '17:00', '00:00', 'Sábado Sonoro', 'AUTOMATICO', '', 'Música para a noite de sábado, sem locução.', 'MÚSICA', 'branco', true),
  ('DOMINGO', '00:00', '10:00', 'Madrugada Sonora', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('DOMINGO', '10:00', '12:00', 'Reprise da Semana', 'AUTOMATICO', '', 'Os melhores momentos dos programas, reprisados automaticamente.', 'REPRISE', 'amarelo', true),
  ('DOMINGO', '12:00', '18:00', 'Trilha Livre', 'AUTOMATICO', '', 'Seleção musical contínua, sem locução.', 'MÚSICA', 'branco', true),
  ('DOMINGO', '18:00', '19:00', 'Semana que Vem', 'AO VIVO', 'Equipe Voz WebTV', 'O que está programado para os próximos dias.', 'ESPECIAL', 'verde', true),
  ('DOMINGO', '19:00', '00:00', 'Trilha da Noite', 'AUTOMATICO', '', 'Música para a madrugada, sem locução.', 'MÚSICA', 'branco', true);

insert into public.noticias
  (data, titulo, resumo, imagem, link, destaque, categoria, ativo)
values
  ('2026-08-12', 'Voz WebTV passa a transmitir 24 horas por dia', 'A rádio agora fica no ar sem interrupção: programas ao vivo durante o período letivo e seleção musical automática na madrugada e nos intervalos.', '', '#', true, 'DESTAQUE', true),
  ('2026-08-08', 'Inscrições abertas para a oficina de locução', 'Vinte vagas para alunos do 8º ano ao 3º ano. As aulas acontecem às quartas, no contraturno.', '', '#', false, 'OFICINA', true),
  ('2026-08-05', 'Estúdio ganha nova mesa de som', 'O equipamento foi conquistado com o projeto aprovado pela direção e já está em operação.', '', '#', false, 'ESTRUTURA', true),
  ('2026-08-01', 'Podcast da escola chega ao 10º episódio', 'A série produzida pelo 2º ano já soma mais de mil reproduções nas plataformas.', '', '#', false, 'PODCAST', true),
  ('2026-07-28', 'Cobertura completa dos Jogos Escolares', 'A equipe de esportes transmitiu as finais direto da quadra, com narração ao vivo.', '', '#', false, 'ESPORTE', true);

insert into public.equipe
  (nome, funcao, turma, foto, ordem, ativo)
values
  ('Ana Beatriz', 'Locução', '9º A', '', 0, true),
  ('Lucas Ferreira', 'Operação de áudio', '2º ano', '', 1, true),
  ('Marina Alves', 'Coordenação', 'Professora', '', 2, true),
  ('Pedro Nunes', 'Pauta e reportagem', '8º B', '', 3, true);

insert into public.config
  (chave, valor, descricao)
values
  ('marquee_texto', 'NO AR 24 HORAS • A RÁDIO FEITA POR ALUNOS • VOZ WEBTV • SINTONIZE AGORA • NOTÍCIA, MÚSICA E CULTURA', 'Letreiro rolante do topo. Separe os trechos com o sinal •'),
  ('marquee_rodape', 'VOZ WEBTV • ESCOLA ESTADUAL TEOTÔNIO VILELA • EDUCAÇÃO QUE SE ESCUTA • PARTICIPE VOCÊ TAMBÉM', 'Letreiro rolante antes do rodapé. Separe os trechos com o sinal •'),
  ('aviso_topo', 'No ar 24 horas por dia, todos os dias', 'Frase curta no cabeçalho, ao lado do menu'),
  ('youtube_id', '', 'ID do vídeo/live do YouTube (só o código, não a URL inteira)'),
  ('youtube_ativo', 'NAO', 'SIM mostra o vídeo; NAO mostra o aviso de sem transmissão'),
  ('instagram_url', '', 'Link do Instagram da rádio. Deixe vazio para o item sumir do rodapé'),
  ('youtube_url', '', 'Link do canal no YouTube. Deixe vazio para o item sumir'),
  ('spotify_url', '', 'Link no Spotify. Deixe vazio para o item sumir'),
  ('email_contato', 'contato@vozwebtv.com.br', 'E-mail exibido no rodapé');


-- ═══ CONFERÊNCIA ═══════════════════════════════════════════════════
-- Deve devolver 7 linhas, todas com cobertura_em_minutos = 1440.
-- 1440 min = 24h. Qualquer valor diferente é buraco ou sobreposição.
select dia,
       sum(
         case
           when hora_fim > hora_inicio then
             (split_part(hora_fim,':',1)::int * 60 + split_part(hora_fim,':',2)::int)
           - (split_part(hora_inicio,':',1)::int * 60 + split_part(hora_inicio,':',2)::int)
           else
             1440
           - (split_part(hora_inicio,':',1)::int * 60 + split_part(hora_inicio,':',2)::int)
           + (split_part(hora_fim,':',1)::int * 60 + split_part(hora_fim,':',2)::int)
         end
       ) as cobertura_em_minutos
from public.programacao
where ativo
group by dia
order by dia;
