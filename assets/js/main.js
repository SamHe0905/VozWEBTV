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

/**
 * Secoes que a equipe pode ligar e desligar pela tabela `config`.
 * Chave ausente = secao ligada, para nao apagar nada de bancos antigos.
 */
const SECOES = [
  { chave: 'secao_programacao', id: 'programacao' },
  { chave: 'secao_webtv', id: 'webtv' },
  { chave: 'secao_noticias', id: 'noticias' },
  { chave: 'secao_participe', id: 'participe' },
];

/**
 * Remove do site as secoes desligadas — E TAMBEM os links que apontam
 * para elas. Esconder so' a secao deixaria o item do menu levando a
 * lugar nenhum, que e' o mesmo defeito de um href="#".
 */
export function aplicarSecoes(cfg) {
  for (const s of SECOES) {
    const valor = cfg[s.chave];
    if (valor === undefined) continue; // chave nao cadastrada: mantem ligada
    if (String(valor).trim().toUpperCase() !== 'NAO') continue;

    document.getElementById(s.id)?.remove();
    document.querySelectorAll(`a[href="#${s.id}"]`).forEach((a) => (a.closest('li') || a).remove());
  }
}

/** Vazio, "#" ou "-" sao placeholders: nao servem como destino. */
const temDestino = (v) => {
  const s = String(v || '').trim();
  return s !== '' && s !== '#' && s !== '-';
};

/**
 * Preenche os links marcados com `data-link` usando a tabela `config`.
 *
 * Quem nao tem URL cadastrada e' REMOVIDO, nao deixado com href="#".
 * Um "#" navega para o topo do documento — o leitor clica em "Ler mais"
 * ou "Participe" e e' jogado de volta ao inicio da pagina, sem entender
 * o que aconteceu.
 */
function aplicarLinks(cfg) {
  document.querySelectorAll('[data-link]').forEach((a) => {
    const chave = a.dataset.link;
    const valor = cfg[chave];
    const item = a.closest('li') || a;

    if (!temDestino(valor)) {
      item.remove();
      return;
    }

    // `email_contato` guarda um e-mail, nao uma URL.
    a.href = chave === 'email_contato' ? `mailto:${String(valor).trim()}` : String(valor).trim();
    if (a.href.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    a.hidden = false;
    item.hidden = false;
  });
}

async function iniciar() {
  iniciarMenu();

  // A tabela `config` guarda o que a equipe edita sem mexer em codigo:
  // letreiros, aviso do topo e qual video a WebTV mostra.
  const cfg = await lerConfig();

  montarMarquee('marquee-topo', cfg.marquee_texto, 'text-verde');
  montarMarquee('marquee-rodape', cfg.marquee_rodape, 'text-amarelo');
  aplicarAvisoTopo(cfg.aviso_topo);
  // Antes dos links: nao adianta preencher o que vai ser removido.
  aplicarSecoes(cfg);
  aplicarLinks(cfg);
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
