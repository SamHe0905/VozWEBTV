/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Grade de programacao
   ───────────────────────────────────────────────────────────────────
   Le a grade por `dados.js`, que decide sozinho entre o Supabase e os
   dados de demonstracao. Este arquivo cuida so da logica de horario
   (o que esta no ar, o que vem depois, se as 24h fecham) e do render.
   ═══════════════════════════════════════════════════════════════════ */

import { SITE } from './config.js?v=202608160218';
import { lerProgramacao, ehSim } from './dados.js?v=202608160218';

const DIAS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const DIAS_CURTOS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

/** Paleta de fundo do card conforme a coluna `cor` da planilha. */
const CORES = {
  amarelo: 'bg-amarelo text-azul',
  verde: 'bg-verde text-white',
  azul: 'bg-azul text-bg',
  branco: 'bg-paper text-tinta',
};

/**
 * Periodos do dia, para agrupar a grade de 24h.
 * `ate` e' exclusivo e esta em minutos desde a meia-noite.
 */
const PERIODOS = [
  { id: 'madrugada', rotulo: 'Madrugada', faixa: '00h — 06h', ate: 6 * 60 },
  { id: 'manha', rotulo: 'Manhã', faixa: '06h — 12h', ate: 12 * 60 },
  { id: 'tarde', rotulo: 'Tarde', faixa: '12h — 18h', ate: 18 * 60 },
  { id: 'noite', rotulo: 'Noite', faixa: '18h — 00h', ate: 24 * 60 },
];

function periodoDe(hhmm) {
  const m = paraMinutos(hhmm);
  return (PERIODOS.find((p) => m < p.ate) || PERIODOS[3]).id;
}

/**
 * O bloco e' playlist automatica (sem locutor)?
 *
 * A radio fica no ar 24h, mas o locutor entra so nas janelas marcadas como
 * AO VIVO — o resto e' musica. A coluna `tipo` da planilha e' a fonte da
 * verdade; a ausencia de `apresentador` e' apenas o desempate para linhas
 * antigas ou preenchidas pela metade.
 */
export function ehAutomatico(item) {
  const tipo = String(item.tipo || '')
    .toUpperCase()
    .replace(/[ÁÀÂÃ]/g, 'A')
    .trim();
  if (tipo === 'AUTOMATICO') return true;
  if (tipo === 'AO VIVO') return false;
  return !String(item.apresentador || '').trim();
}

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

/** O dia anterior a `dia` na semana. */
function diaAnterior(dia) {
  return DIAS[(DIAS.indexOf(dia) + 6) % 7];
}

/**
 * Um item esta no ar agora?
 *
 * Numa radio 24h, blocos que cruzam a meia-noite sao rotina (ex.: SEGUNDA
 * 22:00–00:00, ou SABADO 23:00–01:00). Um bloco assim continua no ar depois
 * da virada, mas ja e' o DIA SEGUINTE no relogio — por isso a checagem
 * aceita duas situacoes:
 *
 *   a) o item e' de hoje e o relogio esta dentro da faixa;
 *   b) o item e' de ONTEM, cruza a meia-noite, e o relogio ainda nao passou
 *      do horario de fim.
 */
function estaNoAr(item, agora) {
  const ini = paraMinutos(item.hora_inicio);
  const fim = paraMinutos(item.hora_fim);
  const cruzaMeiaNoite = fim <= ini;

  if (item.dia === agora.dia) {
    return cruzaMeiaNoite ? agora.minutos >= ini : agora.minutos >= ini && agora.minutos < fim;
  }

  // Heranca do dia anterior: so vale para blocos que atravessam a virada.
  if (cruzaMeiaNoite && item.dia === diaAnterior(agora.dia)) {
    return agora.minutos < fim;
  }

  return false;
}

/**
 * Programa no ar neste momento, ou `null`.
 *
 * Se a planilha tiver horarios sobrepostos — erro de digitacao provavel
 * quando varias pessoas editam a grade — vence o bloco que comecou por
 * ULTIMO. E' o que corresponde a intuicao de "o que entrou no ar mais
 * recentemente e' o que esta tocando", e evita que um bloco longo da tarde
 * engula um programa curto cadastrado dentro dele.
 */
export function programaAtual() {
  const agora = agoraNoMS();
  const noAr = itens.filter((i) => estaNoAr(i, agora));
  if (!noAr.length) return null;

  // Blocos herdados de ontem comecaram antes de qualquer bloco de hoje.
  const inicioRelativo = (i) =>
    i.dia === agora.dia ? paraMinutos(i.hora_inicio) : paraMinutos(i.hora_inicio) - 1440;

  return noAr.reduce((a, b) => (inicioRelativo(b) > inicioRelativo(a) ? b : a));
}

/**
 * Confere a cobertura 24h e avisa no console o que estiver errado.
 *
 * Nao interrompe nada: o site continua funcionando. Serve para quem cuida
 * da planilha descobrir buracos e sobreposicoes sem precisar conferir 70
 * linhas na mao.
 */
export function validarGrade(lista = itens) {
  const porDia = conferirCobertura(lista);
  const avisos = [];
  for (const dia of DIAS) {
    for (const p of porDia[dia]) avisos.push(`${dia}: ${p}`);
  }

  if (avisos.length) {
    console.warn(
      `[Voz WebTV] A grade nao cobre as 24h em ${avisos.length} ponto(s):\n  • ` +
        avisos.join('\n  • ')
    );
  }
  return avisos;
}

/**
 * Nucleo da conferencia 24h: devolve `{ DIA: [problemas] }`, dia vazio
 * significa dia certo.
 *
 * Vive aqui e e' importado tambem pelo painel admin. Ter duas copias
 * desta logica seria pedir para elas divergirem — e ela e' justamente a
 * checagem que impede a radio de ficar muda sem ninguem notar.
 *
 * `lista` deve conter apenas os blocos ATIVOS; quem chama decide isso,
 * porque o site ja recebe filtrado e o painel precisa mostrar os dois.
 */
export function conferirCobertura(lista) {
  // Cada dia recebe os intervalos que realmente tocam nele. Um bloco que
  // cruza a meia-noite (ex.: 23:00–01:00) contribui em DOIS dias: o trecho
  // ate 00:00 no proprio dia, e o resto no dia seguinte.
  const cobertura = Object.fromEntries(DIAS.map((d) => [d, []]));

  for (const b of lista) {
    if (!cobertura[b.dia]) continue;
    const ini = paraMinutos(b.hora_inicio);
    const fim = paraMinutos(b.hora_fim);

    if (fim > ini) {
      cobertura[b.dia].push({ ini, fim, nome: b.programa });
    } else {
      const seguinte = DIAS[(DIAS.indexOf(b.dia) + 1) % 7];
      cobertura[b.dia].push({ ini, fim: 1440, nome: b.programa });
      if (fim > 0) cobertura[seguinte].push({ ini: 0, fim, nome: `${b.programa} (vindo de ${b.dia})` });
    }
  }

  const porDia = {};
  for (const dia of DIAS) {
    const faixas = cobertura[dia].sort((a, b) => a.ini - b.ini);
    const problemas = [];

    if (!faixas.length) {
      porDia[dia] = ['nenhum programa cadastrado'];
      continue;
    }

    let coberto = 0;
    for (const f of faixas) {
      if (f.ini > coberto) problemas.push(`buraco entre ${fmt(coberto)} e ${fmt(f.ini)}`);
      else if (f.ini < coberto) problemas.push(`"${f.nome}" (${fmt(f.ini)}) sobrepoe o bloco anterior`);
      coberto = Math.max(coberto, f.fim);
    }
    if (coberto < 1440) problemas.push(`nada no ar entre ${fmt(coberto)} e 00:00`);

    porDia[dia] = problemas;
  }
  return porDia;
}

function fmt(min) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
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

/** Descarta linhas inativas/incompletas e ordena por horario. */
function normalizar(linhas) {
  return linhas
    .filter((l) => l && ehSim(l.ativo) && l.programa && l.hora_inicio)
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

/** Icone de nota musical, para marcar os blocos sem locutor. */
const ICONE_MUSICA = `
  <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>`;

function cardPrograma(item, i, agora) {
  const noAr = estaNoAr(item, agora);
  const automatico = ehAutomatico(item);

  // Rotacao alternada e sutil, so a partir de `md`. No mobile o card fica
  // reto: em coluna unica a inclinacao quebra o alinhamento.
  const giro = noAr ? '' : i % 2 === 0 ? 'md:-rotate-[1.5deg]' : 'md:rotate-[1.5deg]';

  const base = noAr
    ? 'bg-verde text-white border-6 shadow-hard-lg'
    : `${CORES[item.cor] || CORES.branco} border-3 shadow-hard`;

  // O texto de apoio e a tag seguem a luminosidade do fundo do card, nao a
  // cor especifica: azul, verde e o destaque "no ar" sao escuros e pedem
  // texto claro; amarelo e branco pedem texto escuro.
  const fundoEscuro = noAr || item.cor === 'azul' || item.cor === 'verde';
  const apoio = fundoEscuro ? 'text-white/90' : 'text-tinta/75';
  const tag = noAr
    ? 'border-white bg-amarelo text-azul'
    : fundoEscuro
      ? 'border-bg bg-bg text-azul'
      : 'border-azul bg-azul text-bg';

  // Blocos automaticos ja se distinguem pela cor `branco`, pela linha
  // "Só música" e pelo cabecalho do periodo. Nao usar `opacity-*` aqui:
  // opacidade no card reduz o contraste de tudo que esta dentro dele.
  const selo = noAr
    ? `<span class="inline-flex shrink-0 items-center gap-1.5 border-3 border-white bg-amarelo px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-azul">
         <span class="block h-2 w-2 animate-live bg-azul"></span>${automatico ? 'Tocando' : 'No ar'}
       </span>`
    : '';

  // Sem locutor, o card informa o regime no lugar do nome do apresentador.
  const linhaApresentador = automatico
    ? `<p class="mt-2 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest ${apoio}">
         ${ICONE_MUSICA} Só música · sem locutor
       </p>`
    : `<p class="mt-2 font-sans text-sm font-semibold ${apoio}">${item.apresentador}</p>`;

  return `
    <article class="flex flex-col border-azul p-5 transition-transform duration-150 ease-out
                    hover:rotate-0 ${giro} ${base}">
      <div class="flex items-start justify-between gap-3">
        <span class="inline-block border-3 px-2 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-widest ${tag}">
          ${item.categoria || 'PROGRAMA'}
        </span>
        ${selo}
      </div>

      <p class="mt-4 font-mono text-sm font-bold tracking-widest">
        ${item.hora_inicio} — ${item.hora_fim}
      </p>
      <h3 class="mt-1 font-display text-xl/[1.05] uppercase md:text-2xl/[1.05]">
        ${item.programa}
      </h3>
      ${linhaApresentador}
      <p class="mt-3 flex-1 font-sans text-sm leading-relaxed ${apoio}">
        ${item.descricao || ''}
      </p>
    </article>`;
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

  // Com 24h de grade sao ~12 blocos por dia. Agrupar por periodo evita uma
  // parede de cards e ajuda a achar o horario de interesse.
  let indice = 0;
  alvo.innerHTML = PERIODOS.map((p) => {
    const doPeriodo = doDia.filter((it) => periodoDe(it.hora_inicio) === p.id);
    if (!doPeriodo.length) return '';

    const temAoVivo = doPeriodo.some((it) => !ehAutomatico(it));
    const cards = doPeriodo.map((it) => cardPrograma(it, indice++, agora)).join('');

    return `
      <div class="col-span-full mt-4 flex items-center gap-4 border-b-3 border-azul pb-2 first:mt-0">
        <span class="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-azul">
          ${p.rotulo}
        </span>
        <span class="font-mono text-[11px] uppercase tracking-widest text-cinza">${p.faixa}</span>
        ${
          temAoVivo
            ? '<span class="ml-auto border-3 border-azul bg-amarelo px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-azul">Com locutor</span>'
            : '<span class="ml-auto font-mono text-[10px] uppercase tracking-widest text-cinza">Só música</span>'
        }
      </div>
      ${cards}`;
  }).join('');
}

/* ── API do modulo ─────────────────────────────────────────────── */

export async function iniciarGrade() {
  const alvo = document.getElementById('grade');

  // Skeletons com a altura final do card: evita layout shift (CLS).
  if (alvo) {
    alvo.innerHTML = Array.from({ length: 4 }, () => '<div class="skeleton h-64"></div>').join('');
  }

  itens = normalizar(await lerProgramacao());
  validarGrade();
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
