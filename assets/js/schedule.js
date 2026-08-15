/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Grade de programacao
   ───────────────────────────────────────────────────────────────────
   Em MODO_DEMO le de mock.js. Na Fase 3, `carregarProgramacao()` passa
   a buscar o CSV publicado e roda o PapaParse — o resto do arquivo
   (normalizacao, "no ar agora", render) continua igual.
   ═══════════════════════════════════════════════════════════════════ */

import { MODO_DEMO, PLANILHAS, SITE } from './config.js';
import { PROGRAMACAO } from './mock.js';

const DIAS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const DIAS_CURTOS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

/** Paleta de fundo do card conforme a coluna `cor` da planilha. */
const CORES = {
  amarelo: 'bg-amarelo text-azul',
  verde: 'bg-verde text-white',
  azul: 'bg-azul text-bg',
  branco: 'bg-paper text-tinta',
};

let itens = [];
let diaSelecionado = null;

/* ── Utilitarios de horario ────────────────────────────────────── */

/** Converte "07:30" em minutos desde a meia-noite. */
function paraMinutos(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Retorna { dia, minutos } no fuso do MS.
 * O relogio do visitante nao serve: alguem abrindo de São Paulo veria
 * o programa errado como "no ar agora".
 */
export function agoraNoMS() {
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: SITE.fusoHorario,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const partes = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const mapaDia = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sáb: 6, sab: 6 };
  const chave = String(partes.weekday || '').toLowerCase().replace('.', '').slice(0, 3);

  return {
    dia: DIAS[mapaDia[chave] ?? new Date().getDay()],
    minutos: Number(partes.hour) * 60 + Number(partes.minute),
  };
}

/** Um item esta no ar agora? Trata programas que cruzam a meia-noite. */
function estaNoAr(item, agora) {
  if (item.dia !== agora.dia) return false;
  const ini = paraMinutos(item.hora_inicio);
  const fim = paraMinutos(item.hora_fim);
  return fim > ini
    ? agora.minutos >= ini && agora.minutos < fim
    : agora.minutos >= ini || agora.minutos < fim;
}

/** Programa no ar neste momento, ou `null`. */
export function programaAtual() {
  const agora = agoraNoMS();
  return itens.find((i) => estaNoAr(i, agora)) || null;
}

/**
 * Proximo programa a entrar no ar, varrendo ate 7 dias a frente.
 * Fora do horario de transmissao, e' isto que o site mostra em vez de
 * um espaco vazio.
 */
export function proximoPrograma() {
  const agora = agoraNoMS();
  const iAgora = DIAS.indexOf(agora.dia);

  for (let salto = 0; salto < 7; salto += 1) {
    const dia = DIAS[(iAgora + salto) % 7];
    const doDia = itens
      .filter((i) => i.dia === dia)
      .filter((i) => salto > 0 || paraMinutos(i.hora_inicio) > agora.minutos);
    if (doDia.length) return { ...doDia[0], emDias: salto };
  }
  return null;
}

/* ── Carregamento ──────────────────────────────────────────────── */

async function carregarProgramacao() {
  if (MODO_DEMO || !PLANILHAS.programacao) return PROGRAMACAO;

  // Fase 3: PapaParse sobre o CSV publicado.
  return new Promise((resolve) => {
    window.Papa.parse(PLANILHAS.programacao, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data),
      error: () => resolve(PROGRAMACAO), // fallback: nunca deixa a secao vazia
    });
  });
}

/** Descarta linhas inativas/incompletas e ordena por horario. */
function normalizar(linhas) {
  return linhas
    .filter((l) => l && String(l.ativo).toUpperCase() === 'SIM' && l.programa && l.hora_inicio)
    .map((l) => ({
      ...l,
      dia: String(l.dia).toUpperCase().trim(),
      cor: String(l.cor || 'branco').toLowerCase().trim(),
    }))
    .sort((a, b) => paraMinutos(a.hora_inicio) - paraMinutos(b.hora_inicio));
}

/* ── Render ────────────────────────────────────────────────────── */

function renderFiltro() {
  const alvo = document.getElementById('filtro-dias');
  if (!alvo) return;

  alvo.innerHTML = DIAS.map((dia, i) => {
    const ativo = dia === diaSelecionado;
    const total = itens.filter((it) => it.dia === dia).length;
    return `
      <button type="button" role="tab" data-dia="${dia}" aria-selected="${ativo}"
        class="border-3 border-azul px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest
               shadow-hard-sm transition-transform duration-100
               hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
               ${ativo ? 'bg-azul text-bg' : 'bg-paper text-azul'}">
        ${DIAS_CURTOS[i]}
        <span class="ml-1 ${ativo ? 'text-amarelo' : 'text-cinza'}">${total}</span>
      </button>`;
  }).join('');

  alvo.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      diaSelecionado = b.dataset.dia;
      renderFiltro();
      renderGrade();
    })
  );
}

function cardVazio() {
  return `
    <div class="col-span-full border-6 border-azul bg-amarelo/40 p-10 text-center">
      <p class="font-display text-2xl uppercase text-azul md:text-3xl">Sem programa neste dia</p>
      <p class="mt-2 font-mono text-xs uppercase tracking-widest text-azul/70">
        Escolha outro dia da semana
      </p>
    </div>`;
}

function renderGrade() {
  const alvo = document.getElementById('grade');
  if (!alvo) return;

  const agora = agoraNoMS();
  const doDia = itens.filter((i) => i.dia === diaSelecionado);

  if (!doDia.length) {
    alvo.innerHTML = cardVazio();
    return;
  }

  alvo.innerHTML = doDia
    .map((item, i) => {
      const noAr = estaNoAr(item, agora);

      // Rotacao alternada e sutil (-1.5deg / +1.5deg), so a partir de `md`.
      // No mobile o card fica reto: em coluna unica a inclinacao quebra o alinhamento.
      const giro = noAr ? '' : i % 2 === 0 ? 'md:-rotate-[1.5deg]' : 'md:rotate-[1.5deg]';

      const base = noAr
        ? 'bg-verde text-white border-6 shadow-hard-lg'
        : `${CORES[item.cor] || CORES.branco} border-3 shadow-hard`;

      // O texto de apoio e a tag seguem a luminosidade do fundo do card,
      // nao a cor especifica: azul, verde e o destaque "no ar" sao escuros
      // e pedem texto claro; amarelo e branco pedem texto escuro.
      const fundoEscuro = noAr || item.cor === 'azul' || item.cor === 'verde';
      const apoio = fundoEscuro ? 'text-white/90' : 'text-tinta/75';
      const tag = noAr
        ? 'border-white bg-amarelo text-azul'
        : fundoEscuro
          ? 'border-bg bg-bg text-azul'
          : 'border-azul bg-azul text-bg';

      return `
        <article class="flex flex-col border-azul p-5 transition-transform duration-150 ease-out
                        hover:rotate-0 ${giro} ${base}">
          <div class="flex items-start justify-between gap-3">
            <span class="inline-block border-3 px-2 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-widest ${tag}">
              ${item.categoria || 'PROGRAMA'}
            </span>
            ${
              noAr
                ? `<span class="inline-flex shrink-0 items-center gap-1.5 border-3 border-white bg-amarelo px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-azul">
                     <span class="block h-2 w-2 animate-live bg-azul"></span>No ar
                   </span>`
                : ''
            }
          </div>

          <p class="mt-4 font-mono text-sm font-bold tracking-widest">
            ${item.hora_inicio} — ${item.hora_fim}
          </p>
          <h3 class="mt-1 font-display text-xl/[1.05] uppercase md:text-2xl/[1.05]">
            ${item.programa}
          </h3>
          <p class="mt-2 font-sans text-sm ${apoio}">${item.apresentador || ''}</p>
          <p class="mt-3 flex-1 font-sans text-sm leading-relaxed ${apoio}">
            ${item.descricao || ''}
          </p>
        </article>`;
    })
    .join('');
}

/* ── API do modulo ─────────────────────────────────────────────── */

export async function iniciarGrade() {
  const alvo = document.getElementById('grade');

  // Skeletons com a altura final do card: evita layout shift (CLS).
  if (alvo) {
    alvo.innerHTML = Array.from({ length: 4 }, () => '<div class="skeleton h-64"></div>').join('');
  }

  itens = normalizar(await carregarProgramacao());
  diaSelecionado = agoraNoMS().dia;

  renderFiltro();
  renderGrade();

  // Revalida a marcacao "no ar" a cada minuto.
  setInterval(() => {
    if (diaSelecionado === agoraNoMS().dia) renderGrade();
  }, 60000);

  const stat = document.getElementById('stat-programas');
  if (stat) stat.textContent = new Set(itens.map((i) => i.programa)).size;

  return itens;
}
