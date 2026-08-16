/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Bootstrap
   Ordem importa: a grade carrega antes do player, porque o player usa
   `programaAtual()` como fonte do "tocando agora" quando a API do
   AzuraCast nao esta disponivel.
   ═══════════════════════════════════════════════════════════════════ */

import { testeAtivo } from './config.js?v=202608160218';
import { lerConfig } from './dados.js?v=202608160218';
import { iniciarGrade } from './schedule.js?v=202608160218';
import { iniciarPlayer } from './player.js?v=202608160218';
import { iniciarNoticias, iniciarEquipe } from './news.js?v=202608160218';
import { iniciarWebTV } from './webtv.js?v=202608160218';

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

/**
 * Faixa de aviso quando o site esta tocando um stream de teste.
 * Sem isto, alguem podia abrir o link com `?stream=demo`, ouvir outra
 * emissora e achar que era a radio da escola.
 */
function avisarModoTeste() {
  const teste = testeAtivo();
  if (!teste) return;

  const faixa = document.createElement('div');
  faixa.className =
    'sticky top-0 z-[60] border-b-6 border-azul bg-amarelo px-4 py-2 text-center ' +
    'font-mono text-[11px] font-bold uppercase tracking-widest text-azul md:text-xs';
  faixa.innerHTML =
    'Modo de teste — o áudio é de uma rádio de demonstração, não da escola. ' +
    '<a href="./" class="underline decoration-3 underline-offset-2">Sair do teste</a>';
  document.body.prepend(faixa);
}

async function iniciar() {
  avisarModoTeste();
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
