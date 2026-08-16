-- ═══════════════════════════════════════════════════════════════════
-- VOZ WEBTV — Chaves novas de `config`
-- ───────────────────────────────────────────────────────────────────
-- Para bancos que já existem. Só ACRESCENTA chaves; não apaga nem
-- altera nada do que já está cadastrado.
--
-- Pode rodar quantas vezes quiser: o `on conflict do nothing` ignora
-- o que já existir.
--
-- COMO USAR: Supabase → SQL Editor → New query → colar → RUN
-- ═══════════════════════════════════════════════════════════════════

insert into public.config (chave, valor, descricao) values

  -- ── Ligar e desligar seções do site ──────────────────────────────
  -- SIM mostra a seção; NAO esconde. Ao esconder, o link do menu para
  -- ela some junto — ninguém clica e cai no vazio.
  -- Depois de rodar isto, os interruptores aparecem no painel, na aba
  -- Ajustes. Não é preciso mexer em SQL de novo.
  ('secao_programacao', 'SIM', 'Mostrar a seção Programação no site'),
  ('secao_webtv',       'SIM', 'Mostrar a seção WebTV no site'),
  ('secao_noticias',    'SIM', 'Mostrar a seção Notícias no site'),
  ('secao_participe',   'SIM', 'Mostrar a seção Participe no site'),

  -- ── Redes sociais do rodapé ──────────────────────────────────────
  -- Deixe vazio para o item sumir do rodapé. Nunca vira link morto.
  ('youtube_url', '', 'Link do canal no YouTube. Vazio faz o item sumir do rodapé'),
  ('spotify_url', '', 'Link no Spotify. Vazio faz o item sumir do rodapé')

on conflict (chave) do nothing;


-- ═══ CONFERÊNCIA ═══════════════════════════════════════════════════
-- Deve listar 13 chaves, sendo 4 começando com `secao_`.
select chave, valor, descricao
from public.config
order by chave;
