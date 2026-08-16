/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Noticias e equipe
   Le tudo por `dados.js`, que decide sozinho entre Supabase e os dados
   de demonstracao. Este arquivo so cuida de montar os cards.
   ═══════════════════════════════════════════════════════════════════ */

import { lerNoticias, lerEquipe, ehSim } from './dados.js';

const ativos = (linhas) => linhas.filter((l) => l && ehSim(l.ativo));

/**
 * A URL leva a algum lugar de verdade?
 * Vazio, "#" ou "-" sao placeholders que voltariam ao topo da pagina.
 */
export function temLink(url) {
  const v = String(url || '').trim();
  return v !== '' && v !== '#' && v !== '-';
}

/** Iniciais do nome, para o avatar tipografico da equipe. */
function iniciais(nome) {
  return String(nome)
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase();
}

/* ── Noticias ──────────────────────────────────────────────────── */

function cardNoticia(n, destaque) {
  // O card de destaque ocupa duas colunas e inverte a paleta.
  const span = destaque ? 'md:col-span-2 lg:col-span-2' : '';
  const fundo = destaque ? 'bg-azul text-bg' : 'bg-paper text-tinta';
  const apoio = destaque ? 'text-bg/75' : 'text-cinza';
  const tag = destaque ? 'border-bg bg-amarelo text-azul' : 'border-azul bg-amarelo text-azul';
  // Entrelinha junto do tamanho: um `leading-*` solto seria sobrescrito
  // pela variante `md:text-*`, que tambem define line-height.
  const titulo = destaque ? 'text-2xl/[1.02] md:text-4xl/[1.02]' : 'text-xl/[1.05] md:text-2xl/[1.05]';

  return `
    <article class="card flex flex-col ${span} ${fundo} hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-hard-sm">
      <!-- Faixa grafica no lugar da imagem: sem foto, o card ainda tem peso visual -->
      <div class="relative overflow-hidden border-b-3 border-azul ${destaque ? 'h-40 bg-verde md:h-56' : 'h-28 bg-amarelo'}">
        <p class="absolute -bottom-3 left-3 select-none font-display text-[5rem]/[0.8] uppercase tracking-tighter ${
          destaque ? 'text-white/20' : 'text-azul/15'
        } md:text-[7rem]/[0.8]" aria-hidden="true">Voz</p>
        <span class="absolute left-3 top-3 inline-block border-3 px-2 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-widest ${tag}">
          ${n.categoria || 'NOTÍCIA'}
        </span>
      </div>

      <div class="flex flex-1 flex-col p-5">
        <p class="font-mono text-xs font-bold uppercase tracking-widest ${apoio}">${n.data || ''}</p>
        <h3 class="mt-2 font-display ${titulo} uppercase">${n.titulo}</h3>
        <p class="mt-3 flex-1 font-sans text-sm leading-relaxed ${apoio}">${n.resumo || ''}</p>
        ${
          // "Ler mais" so' existe quando ha' para onde ir. Um href="#" leva o
          // leitor de volta ao topo da pagina, que e' pior que nao ter link.
          temLink(n.link)
            ? `<a href="${esc(n.link)}" class="link-grosso mt-5 self-start font-mono text-xs font-bold uppercase tracking-widest ${
                destaque ? 'text-amarelo' : 'text-azul'
              }">Ler mais →</a>`
            : ''
        }
      </div>
    </article>`;
}

export async function iniciarNoticias() {
  const alvo = document.getElementById('lista-noticias');
  if (!alvo) return;

  alvo.innerHTML =
    '<div class="skeleton h-80 md:col-span-2"></div>' +
    Array.from({ length: 2 }, () => '<div class="skeleton h-80"></div>').join('');

  const lista = ativos(await lerNoticias());
  if (!lista.length) {
    alvo.innerHTML = `
      <div class="col-span-full border-6 border-azul bg-amarelo/40 p-10 text-center">
        <p class="font-display text-2xl uppercase text-azul">Nada por aqui ainda</p>
      </div>`;
    return;
  }

  const iDestaque = lista.findIndex((n) => String(n.destaque).toUpperCase() === 'SIM');
  alvo.innerHTML = lista.map((n, i) => cardNoticia(n, i === (iDestaque < 0 ? 0 : iDestaque))).join('');
}

/* ── Equipe ────────────────────────────────────────────────────── */

export async function iniciarEquipe() {
  const alvo = document.getElementById('lista-equipe');
  if (!alvo) return;

  const lista = ativos(await lerEquipe()).slice(0, 4);

  alvo.innerHTML = lista
    .map(
      (p, i) => `
    <div class="border-3 border-azul ${i % 2 === 0 ? 'bg-amarelo' : 'bg-paper'} p-4 text-azul shadow-hard-bg">
      <p class="font-display text-3xl uppercase leading-none text-azul/35" aria-hidden="true">${iniciais(p.nome)}</p>
      <p class="mt-3 font-display text-base uppercase leading-tight">${p.nome}</p>
      <p class="mt-1 font-mono text-[10px] uppercase tracking-widest text-azul/80">${p.funcao}</p>
      <p class="font-mono text-[10px] uppercase tracking-widest text-azul/80">${p.turma}</p>
    </div>`
    )
    .join('');
}
