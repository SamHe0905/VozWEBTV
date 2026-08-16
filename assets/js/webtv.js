/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Area de video (YouTube)
   ───────────────────────────────────────────────────────────────────
   Padrao FACADE: nenhum iframe entra na pagina no carregamento. Um
   embed do YouTube custa ~1 MB de JS de terceiros; aqui ele so e'
   injetado quando o visitante clica no play.
   Dominio: youtube-nocookie.com (privacidade dos alunos).
   ═══════════════════════════════════════════════════════════════════ */

import { WEBTV } from './config.js?v=202608160215';

function botaoPlay() {
  return `
    <span class="grid h-20 w-20 place-items-center border-6 border-bg bg-verde text-bg shadow-hard-bg
                 transition-transform duration-100 group-hover:translate-x-[3px] group-hover:translate-y-[3px] md:h-24 md:w-24">
      <svg class="h-8 w-8 md:h-10 md:w-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5 2l16 10L5 22z" />
      </svg>
    </span>`;
}

function renderSemTransmissao(container, legenda) {
  container.innerHTML = `
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-azul-mid text-center"
         style="background-image:repeating-linear-gradient(45deg,rgba(255,199,44,.12) 0 18px,transparent 18px 36px)">
      <span class="border-3 border-bg bg-amarelo px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-azul md:text-xs">
        Sem transmissão agora
      </span>
      <p class="px-6 font-display text-2xl/[1.05] uppercase text-bg md:text-4xl/[1.05]">
        A próxima edição<br />vai ao ar na quinta
      </p>
      <a href="#programacao" class="btn btn-claro">Ver a programação →</a>
    </div>`;
  if (legenda) legenda.textContent = 'Transmissão em vídeo · toda quinta, às 14h';
}

function renderFacade(container, legenda, videoId) {
  const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  container.innerHTML = `
    <button type="button" class="group absolute inset-0 flex items-center justify-center bg-tinta"
            aria-label="Assistir: ${WEBTV.titulo}">
      <img src="${thumb}" alt="" width="1280" height="720" loading="lazy"
           class="absolute inset-0 h-full w-full object-cover opacity-80" />
      <span class="absolute inset-0 bg-azul/40"></span>
      <span class="relative">${botaoPlay()}</span>
      <span class="absolute bottom-0 left-0 right-0 border-t-3 border-bg bg-azul/90 p-4 text-left">
        <span class="block font-display text-lg/[1.1] uppercase text-bg md:text-2xl/[1.1]">${WEBTV.titulo}</span>
      </span>
    </button>`;

  container.querySelector('button').addEventListener('click', () => {
    container.innerHTML = `
      <iframe class="absolute inset-0 h-full w-full"
        src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
        title="${WEBTV.titulo}" allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  });

  if (legenda) legenda.textContent = WEBTV.descricao || '';
}

/**
 * @param {object} [cfg] Linhas da tabela `config` do banco. Quando vem
 *   preenchida, `youtube_id` e `youtube_ativo` mandam mais que o config.js:
 *   e' assim que a equipe troca a transmissao sem mexer em codigo.
 */
export function iniciarWebTV(cfg = {}) {
  const container = document.getElementById('webtv-container');
  const legenda = document.getElementById('webtv-legenda');
  if (!container) return;

  const videoId = (cfg.youtube_id || WEBTV.videoId || '').trim();
  const ativo = cfg.youtube_ativo !== undefined
    ? String(cfg.youtube_ativo).trim().toUpperCase() === 'SIM'
    : WEBTV.ativo;

  if (!ativo || !videoId) {
    renderSemTransmissao(container, legenda);
    return;
  }
  renderFacade(container, legenda, videoId);
}
