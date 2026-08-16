/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Bootstrap
   Ordem importa: a grade carrega antes do player, porque o player usa
   `programaAtual()` como fonte do "tocando agora" quando a API do
   AzuraCast nao esta disponivel.
   ═══════════════════════════════════════════════════════════════════ */

import { lerConfig } from './dados.js';
import { iniciarGrade } from './schedule.js';
import { iniciarPlayer } from './player.js';
import { iniciarNoticias, iniciarEquipe } from './news.js';
import { iniciarWebTV } from './webtv.js';

/* ── Marquee ───────────────────────────────────────────────────── */

/**
 * Monta a trilha do letreiro. O conteudo e' duplicado porque a animacao
 * translada -50%: sem a copia, o loop mostraria um vao vazio.
 */
function montarMarquee(id, texto, corSeparador) {
  const alvo = document.getElementById(id);
  if (!alvo) return;

  const partes = texto
    .split('•')
    .map((t) => t.trim())
    .filter(Boolean);

  const bloco = partes
    .map(
      (t) =>
        `<span class="marquee__item">${t}<span class="${corSeparador} px-4">★</span></span>`
    )
    .join('');

  alvo.innerHTML = bloco + bloco; // a copia e' o que torna o loop continuo
}

/* ── Menu mobile ───────────────────────────────────────────────── */

function iniciarMenu() {
  const btn = document.getElementById('btn-menu');
  const painel = document.getElementById('menu-mobile');
  const fechar = document.getElementById('btn-fechar-menu');
  if (!btn || !painel) return;

  const abrir = (aberto) => {
    painel.classList.toggle('hidden', !aberto);
    btn.setAttribute('aria-expanded', String(aberto));
    // Trava o scroll do fundo enquanto o painel esta aberto.
    document.body.style.overflow = aberto ? 'hidden' : '';
    if (aberto) fechar?.focus();
    else btn.focus();
  };

  btn.addEventListener('click', () => abrir(painel.classList.contains('hidden')));
  fechar?.addEventListener('click', () => abrir(false));
  painel.querySelectorAll('[data-fecha-menu]').forEach((a) =>
    a.addEventListener('click', () => abrir(false))
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !painel.classList.contains('hidden')) abrir(false);
  });
}

/* ── Entrada ───────────────────────────────────────────────────── */

/** Frase curta no cabecalho, editavel pela tabela `config`. */
function aplicarAvisoTopo(texto) {
  const alvo = document.getElementById('aviso-topo');
  if (alvo && texto) alvo.textContent = texto;
}

async function iniciar() {
  iniciarMenu();

  // A tabela `config` guarda o que a equipe edita sem mexer em codigo:
  // letreiros, aviso do topo e qual video a WebTV mostra.
  const cfg = await lerConfig();

  montarMarquee('marquee-topo', cfg.marquee_texto, 'text-verde');
  montarMarquee('marquee-rodape', cfg.marquee_rodape, 'text-amarelo');
  aplicarAvisoTopo(cfg.aviso_topo);
  iniciarWebTV(cfg);

  // A grade precisa estar pronta antes do player consultar o programa atual.
  await iniciarGrade();
  iniciarPlayer();

  iniciarNoticias();
  iniciarEquipe();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
