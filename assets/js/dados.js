/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Camada de dados
   ───────────────────────────────────────────────────────────────────
   Unico ponto do site que sabe DE ONDE os dados vem. O resto do codigo
   recebe objetos ja normalizados e nao faz ideia se vieram do Supabase
   ou do arquivo de demonstracao.

   Fala com o PostgREST do Supabase por `fetch` puro, sem a biblioteca
   supabase-js: o site publico so precisa de leitura, e isso e' uma
   requisicao HTTP comum. Economiza ~40 KB de JS na pagina que mais
   importa. O painel admin, esse sim, usa a biblioteca — ele precisa de
   sessao, renovacao de token e escrita.
   ═══════════════════════════════════════════════════════════════════ */

import { MODO_DEMO, SUPABASE, CACHE_TTL_MS } from './config.js';
import { PROGRAMACAO, NOTICIAS, EQUIPE, CONFIG_SITE } from './mock.js';

/** O site esta ligado a um banco de verdade? */
export const temBanco = () => !MODO_DEMO && Boolean(SUPABASE.url && SUPABASE.anonKey);

/* ── Normalizacao ──────────────────────────────────────────────────
   O banco devolve boolean; o mock usa "SIM"/"NAO". As duas formas
   chegam aqui e saem iguais, para o resto do codigo nao precisar saber. */

/** Aceita true, "SIM", "sim", "TRUE", 1. Qualquer outra coisa e' falso. */
export function ehSim(v) {
  if (typeof v === 'boolean') return v;
  const s = String(v ?? '').trim().toUpperCase();
  return s === 'SIM' || s === 'TRUE' || s === '1';
}

/** Data ISO (2026-08-12) ou brasileira (12/08/2026) -> "12/08/2026". */
export function dataBR(valor) {
  const s = String(valor ?? '').trim();
  if (!s) return '';
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : s;
}

/** "07:30:00" (tipo `time`) ou "07:30" -> "07:30". */
function hhmm(valor) {
  const s = String(valor ?? '').trim();
  return /^\d{2}:\d{2}/.test(s) ? s.slice(0, 5) : s;
}

/* ── Cache de sessao ───────────────────────────────────────────────
   Evita bater no banco a cada navegacao interna. Curto de proposito:
   quem edita no painel quer ver a mudanca no ar rapido. */

function doCache(chave) {
  try {
    const bruto = sessionStorage.getItem(`voz:${chave}`);
    if (!bruto) return null;
    const { em, dados } = JSON.parse(bruto);
    return Date.now() - em < CACHE_TTL_MS ? dados : null;
  } catch {
    return null;
  }
}

function paraCache(chave, dados) {
  try {
    sessionStorage.setItem(`voz:${chave}`, JSON.stringify({ em: Date.now(), dados }));
  } catch {
    // sessionStorage cheio ou bloqueado: seguir sem cache e' aceitavel.
  }
}

/* ── Leitura ───────────────────────────────────────────────────────*/

async function buscar(tabela, query, reserva) {
  if (!temBanco()) return reserva;

  const emCache = doCache(tabela);
  if (emCache) return emCache;

  try {
    const r = await fetch(`${SUPABASE.url}/rest/v1/${tabela}?${query}`, {
      headers: {
        apikey: SUPABASE.anonKey,
        Authorization: `Bearer ${SUPABASE.anonKey}`,
        Accept: 'application/json',
      },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${await r.text()}`);

    const dados = await r.json();
    if (!Array.isArray(dados) || !dados.length) {
      console.warn(`[Voz WebTV] "${tabela}" veio vazia do banco; usando os dados locais.`);
      return reserva;
    }
    paraCache(tabela, dados);
    return dados;
  } catch (erro) {
    // O site nunca fica em branco por causa do banco.
    console.warn(`[Voz WebTV] Falha ao ler "${tabela}" do Supabase; usando os dados locais.`, erro);
    return reserva;
  }
}

export async function lerProgramacao() {
  const linhas = await buscar(
    'programacao',
    'select=*&ativo=eq.true&order=dia.asc,hora_inicio.asc',
    PROGRAMACAO
  );
  return linhas.map((l) => ({
    ...l,
    hora_inicio: hhmm(l.hora_inicio),
    hora_fim: hhmm(l.hora_fim),
    ativo: ehSim(l.ativo) ? 'SIM' : 'NAO',
  }));
}

export async function lerNoticias() {
  const linhas = await buscar('noticias', 'select=*&ativo=eq.true&order=data.desc', NOTICIAS);
  return linhas.map((l) => ({
    ...l,
    data: dataBR(l.data),
    destaque: ehSim(l.destaque) ? 'SIM' : 'NAO',
    ativo: ehSim(l.ativo) ? 'SIM' : 'NAO',
  }));
}

export async function lerEquipe() {
  const linhas = await buscar('equipe', 'select=*&ativo=eq.true&order=ordem.asc', EQUIPE);
  return linhas.map((l) => ({ ...l, ativo: ehSim(l.ativo) ? 'SIM' : 'NAO' }));
}

/** A aba `config` e' chave/valor; aqui vira um objeto simples. */
export async function lerConfig() {
  if (!temBanco()) return CONFIG_SITE;
  const linhas = await buscar('config', 'select=chave,valor', null);
  if (!linhas) return CONFIG_SITE;
  const obj = Object.fromEntries(linhas.map((l) => [l.chave, l.valor]));
  // Uma chave apagada no banco nao pode apagar o letreiro do site.
  return { ...CONFIG_SITE, ...obj };
}

/** Usado pelo painel admin depois de salvar, para o site refletir na hora. */
export function limparCache() {
  for (const t of ['programacao', 'noticias', 'equipe', 'config']) {
    try {
      sessionStorage.removeItem(`voz:${t}`);
    } catch {
      /* ignorado */
    }
  }
}
