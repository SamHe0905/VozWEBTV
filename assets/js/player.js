/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Player de audio ao vivo
   ───────────────────────────────────────────────────────────────────
   Sem stream configurado (MODO_DEMO / AZURACAST.streamUrl vazio), o
   player roda em modo VITRINE: todos os estados visuais funcionam,
   mas nenhum audio e' carregado. Basta preencher `AZURACAST.streamUrl`
   em config.js para ele passar a tocar de verdade.
   ═══════════════════════════════════════════════════════════════════ */

import { AZURACAST, MODO_DEMO, SITE } from './config.js';
import { NOW_PLAYING_DEMO } from './mock.js';
import { programaAtual, proximoPrograma } from './schedule.js';

const el = (id) => document.getElementById(id);

const ESTADOS = {
  parado: { texto: 'Ao vivo', classe: 'bg-amarelo text-azul border-bg', pulsa: false },
  carregando: { texto: 'Conectando', classe: 'bg-bg text-azul border-bg', pulsa: true },
  tocando: { texto: 'No ar', classe: 'bg-verde text-white border-bg', pulsa: true },
  erro: { texto: 'Fora do ar', classe: 'bg-amarelo text-azul border-bg', pulsa: false },
};

let estado = 'parado';
let tentativas = 0;
let timerNowPlaying = null;

/* ── Estado visual ─────────────────────────────────────────────── */

function aplicarEstado(novo) {
  estado = novo;
  const cfg = ESTADOS[novo];

  const selo = el('selo-estado');
  const ponto = el('ponto-live');
  const eq = el('equalizador');
  const btn = el('btn-play');

  if (selo) {
    selo.className =
      'inline-flex items-center gap-2 border-3 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest md:text-xs ' +
      cfg.classe;
  }
  if (ponto) {
    ponto.className = `inline-block h-2 w-2 ${novo === 'tocando' ? 'bg-white' : 'bg-azul'} ${
      cfg.pulsa ? 'animate-live' : ''
    }`;
  }
  const txt = el('texto-estado');
  if (txt) txt.textContent = cfg.texto;

  // Equalizador so existe enquanto toca.
  if (eq) eq.className = novo === 'tocando' ? 'flex h-5 items-end gap-[3px]' : 'hidden h-5 items-end gap-[3px]';

  // Icones do botao
  el('icone-play')?.classList.toggle('hidden', novo === 'tocando' || novo === 'carregando');
  el('icone-pause')?.classList.toggle('hidden', novo !== 'tocando');
  el('icone-load')?.classList.toggle('hidden', novo !== 'carregando');

  if (btn) {
    btn.setAttribute('aria-pressed', String(novo === 'tocando'));
    btn.setAttribute('aria-label', novo === 'tocando' ? 'Pausar a rádio' : 'Tocar a rádio ao vivo');
    // No erro, o botao muda de cor para comunicar a falha sem depender de texto.
    btn.classList.toggle('bg-verde', novo !== 'erro');
    btn.classList.toggle('bg-amarelo', novo === 'erro');
    btn.classList.toggle('text-bg', novo !== 'erro');
    btn.classList.toggle('text-azul', novo === 'erro');
  }
}

/* ── "Tocando agora" ───────────────────────────────────────────── */

function escreverNowPlaying({ titulo, meta }) {
  const t = el('np-titulo');
  const m = el('np-meta');
  if (t) t.textContent = titulo;
  if (m) m.textContent = meta;

  // Tela de bloqueio / notificacao do celular.
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: titulo,
      artist: meta,
      album: SITE.nome,
    });
  }
}

/**
 * Fonte da verdade do "tocando agora", em ordem de preferencia:
 *   1. API do AzuraCast
 *   2. programa calculado pela grade + horario do MS
 *   3. texto institucional
 */
async function atualizarNowPlaying() {
  const doGrade = programaAtual();

  if (!MODO_DEMO && AZURACAST.nowPlaying) {
    try {
      const r = await fetch(AZURACAST.nowPlaying, { cache: 'no-store' });
      const d = await r.json();
      const musica = d?.now_playing?.song?.text;
      const programa = d?.live?.is_live ? d.live.streamer_name : doGrade?.programa;
      if (musica) {
        escreverNowPlaying({
          titulo: musica,
          meta: programa ? `${programa} · ao vivo` : 'Voz WebTV · ao vivo',
        });
        return;
      }
    } catch {
      // Silencioso de proposito: cai no fallback da grade abaixo.
    }
  }

  if (doGrade) {
    escreverNowPlaying({
      titulo: doGrade.programa,
      meta: `${doGrade.hora_inicio} — ${doGrade.hora_fim} · ${doGrade.apresentador || 'Voz WebTV'}`,
    });
  } else if (MODO_DEMO) {
    escreverNowPlaying({
      titulo: NOW_PLAYING_DEMO.programa,
      meta: `${NOW_PLAYING_DEMO.apresentador} · demonstração`,
    });
  } else {
    escreverNowPlaying({ titulo: SITE.nome, meta: 'Programação musical' });
  }

  atualizarHero(doGrade);
}

/**
 * Bloco verde do hero: mostra o programa no ar; fora do horario de
 * transmissao, mostra o proximo — nunca fica generico a toa.
 */
function atualizarHero(noAr) {
  const hp = el('hero-programa');
  const hh = el('hero-horario');
  const selo = el('hero-selo');
  if (!hp || !hh) return;

  if (noAr) {
    hp.textContent = noAr.programa;
    hh.textContent = `${noAr.hora_inicio} — ${noAr.hora_fim} · ${noAr.apresentador || ''}`;
    if (selo) selo.textContent = 'Agora na rádio';
    return;
  }

  const proximo = proximoPrograma();
  if (proximo) {
    const dia = proximo.emDias === 0 ? 'Hoje' : proximo.dia;
    hp.textContent = proximo.programa;
    hh.textContent = `${dia} · ${proximo.hora_inicio} — ${proximo.hora_fim}`;
    if (selo) selo.textContent = 'A seguir';
  }
}

/* ── Controle de reproducao ────────────────────────────────────── */

function iniciar(audio) {
  if (!AZURACAST.streamUrl) {
    // Modo vitrine: simula a conexao para a demonstracao ficar completa.
    aplicarEstado('carregando');
    setTimeout(() => aplicarEstado('tocando'), 700);
    return;
  }

  aplicarEstado('carregando');
  // Cache-buster: sem isso o navegador pode servir um pedaco antigo do stream.
  audio.src = `${AZURACAST.streamUrl}${AZURACAST.streamUrl.includes('?') ? '&' : '?'}_=${Date.now()}`;
  audio.play().catch(() => aplicarEstado('erro'));
}

function parar(audio) {
  audio.pause();
  audio.removeAttribute('src');
  audio.load(); // encerra a conexao de verdade, em vez de so pausar o buffer
  aplicarEstado('parado');
}

/** Reconexao com backoff: 3s, 6s, 12s, 24s, teto de 30s. */
function agendarReconexao(audio) {
  tentativas += 1;
  const espera = Math.min(3000 * 2 ** (tentativas - 1), 30000);
  aplicarEstado('erro');
  setTimeout(() => {
    if (estado === 'erro') iniciar(audio);
  }, espera);
}

/* ── Inicializacao ─────────────────────────────────────────────── */

export function iniciarPlayer() {
  const audio = el('audio');
  const btn = el('btn-play');
  const volume = el('volume');
  const btnMute = el('btn-mute');
  if (!audio || !btn) return;

  // Volume salvo entre visitas. A reproducao NAO e' retomada sozinha.
  const salvo = Number(localStorage.getItem('voz:volume'));
  audio.volume = Number.isFinite(salvo) && salvo > 0 ? salvo : 0.8;
  if (volume) volume.value = String(audio.volume * 100);

  btn.addEventListener('click', () => {
    if (estado === 'tocando' || estado === 'carregando') {
      parar(audio);
    } else {
      tentativas = 0;
      iniciar(audio);
    }
  });

  volume?.addEventListener('input', () => {
    audio.volume = Number(volume.value) / 100;
    audio.muted = false;
    localStorage.setItem('voz:volume', String(audio.volume));
    sincronizarIconeSom(audio);
  });

  btnMute?.addEventListener('click', () => {
    audio.muted = !audio.muted;
    btnMute.setAttribute('aria-label', audio.muted ? 'Ativar som' : 'Silenciar');
    sincronizarIconeSom(audio);
  });

  audio.addEventListener('playing', () => {
    tentativas = 0;
    aplicarEstado('tocando');
  });
  audio.addEventListener('waiting', () => aplicarEstado('carregando'));
  audio.addEventListener('pause', () => estado !== 'erro' && aplicarEstado('parado'));
  audio.addEventListener('error', () => agendarReconexao(audio));
  audio.addEventListener('stalled', () => agendarReconexao(audio));

  // Controles de midia do sistema operacional.
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => iniciar(audio));
    navigator.mediaSession.setActionHandler('pause', () => parar(audio));
  }

  aplicarEstado('parado');
  atualizarNowPlaying();
  timerNowPlaying = setInterval(atualizarNowPlaying, AZURACAST.pollMs || 15000);
}

function sincronizarIconeSom(audio) {
  const mudo = audio.muted || audio.volume === 0;
  el('icone-som')?.classList.toggle('hidden', mudo);
  el('icone-mudo')?.classList.toggle('hidden', !mudo);
}

export function pararPolling() {
  clearInterval(timerNowPlaying);
}
