/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Painel da equipe
   ───────────────────────────────────────────────────────────────────
   CRUD das quatro tabelas. Quem fala com o banco e' `auth.js`; aqui so
   tem interface, validacao e a conferencia da cobertura 24h.

   A conferencia aparece NA TELA, nao so no console: quem edita a grade
   e' professor, e uma grade com buraco precisa gritar antes de alguem
   descobrir pelo silencio no ar.
   ═══════════════════════════════════════════════════════════════════ */

import { entrar, sair, estaLogado, emailLogado, sessao, listar, criar, atualizar, apagar } from './auth.js?v=202608160207';
import { limparCache } from './dados.js?v=202608160207';
// Mesma funcao que o site usa. Uma implementacao so: duas copias desta
// checagem divergiriam, e e' ela que impede a radio de ficar muda.
import { conferirCobertura } from './schedule.js?v=202608160207';

const $ = (s) => document.querySelector(s);
const DIAS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const DIAS_CURTOS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const CORES = ['branco', 'amarelo', 'verde', 'azul'];

const estado = { programacao: [], noticias: [], equipe: [], config: [], dia: 'SEGUNDA' };
let aoSalvar = null;
let aoExcluir = null;

/* ── Utilidades ────────────────────────────────────────────────────*/

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const paraMinutos = (h) => {
  const [a, b] = String(h).split(':').map(Number);
  return (a || 0) * 60 + (b || 0);
};

function alerta(texto, tipo = 'ok') {
  const cor = tipo === 'erro' ? 'bg-amarelo text-azul' : 'bg-verde text-white';
  const el = document.createElement('div');
  el.className = `border-3 border-azul ${cor} px-4 py-3 font-mono text-xs font-bold uppercase leading-relaxed tracking-wider shadow-hard`;
  el.textContent = texto;
  $('#alertas').append(el);
  setTimeout(() => el.remove(), tipo === 'erro' ? 8000 : 4000);
}

/* ── Login ─────────────────────────────────────────────────────────*/

function mostrarPainel() {
  $('#tela-login').classList.add('hidden');
  $('#tela-painel').classList.remove('hidden');
  $('#tela-painel').classList.add('flex');
  $('#usuario-email').textContent = emailLogado();
  carregarTudo();
}

function mostrarLogin() {
  $('#tela-painel').classList.add('hidden');
  $('#tela-painel').classList.remove('flex');
  $('#tela-login').classList.remove('hidden');
}

$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#btn-entrar');
  const erro = $('#login-erro');
  erro.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Entrando…';

  try {
    await entrar($('#login-email').value.trim(), $('#login-senha').value);
    $('#login-senha').value = '';
    mostrarPainel();
  } catch (err) {
    erro.textContent = err.message;
    erro.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar →';
  }
});

$('#btn-sair').addEventListener('click', async () => {
  await sair();
  mostrarLogin();
});

/* ── Abas ──────────────────────────────────────────────────────────*/

function pintarAbas(ativa) {
  document.querySelectorAll('.aba').forEach((b) => {
    const on = b.dataset.aba === ativa;
    b.className = `aba shrink-0 border-r-3 border-azul px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest ${
      on ? 'bg-azul text-bg' : 'bg-bg text-azul hover:bg-amarelo'
    }`;
    b.setAttribute('aria-selected', String(on));
  });
  document.querySelectorAll('.painel').forEach((p) => p.classList.add('hidden'));
  $(`#painel-${ativa}`).classList.remove('hidden');
}

document.querySelectorAll('.aba').forEach((b) =>
  b.addEventListener('click', () => {
    pintarAbas(b.dataset.aba);
    // A lista de acessos vem da funcao de servidor, nao do banco: so' e'
    // buscada quando alguem abre a aba, para nao pesar o resto do painel.
    if (b.dataset.aba === 'contas') renderContas();
  })
);

/* ── Gaveta (formulário) ───────────────────────────────────────────*/

function abrirGaveta({ titulo, campos, aoSalvarFn, aoExcluirFn }) {
  $('#gaveta-titulo').textContent = titulo;
  $('#gaveta-form').innerHTML = campos;
  $('#btn-excluir').classList.toggle('hidden', !aoExcluirFn);
  aoSalvar = aoSalvarFn;
  aoExcluir = aoExcluirFn;
  $('#gaveta').classList.remove('hidden');
  $('#gaveta-form').querySelector('input, select, textarea')?.focus();
}

function fecharGaveta() {
  $('#gaveta').classList.add('hidden');
  aoSalvar = null;
  aoExcluir = null;
}

$('#btn-fechar-gaveta').addEventListener('click', fecharGaveta);
$('#gaveta-fundo').addEventListener('click', fecharGaveta);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#gaveta').classList.contains('hidden')) fecharGaveta();
});

$('#gaveta-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!aoSalvar) return;
  const btn = $('#btn-salvar');
  btn.disabled = true;
  btn.textContent = 'Salvando…';
  try {
    const dados = Object.fromEntries(new FormData(e.target).entries());
    await aoSalvar(dados);
    limparCache();
    fecharGaveta();
    alerta('Salvo. O site já mostra a mudança.');
    await carregarTudo();
  } catch (err) {
    alerta(err.message, 'erro');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar';
  }
});

$('#btn-excluir').addEventListener('click', async () => {
  if (!aoExcluir) return;
  if (!confirm('Excluir de vez? Para só tirar do ar, desmarque "Ativo" e salve.')) return;
  try {
    await aoExcluir();
    limparCache();
    fecharGaveta();
    alerta('Excluído.');
    await carregarTudo();
  } catch (err) {
    alerta(err.message, 'erro');
  }
});

/* ── Campos de formulário ──────────────────────────────────────────*/

const campoTexto = (nome, rotulo, valor = '', extra = '') => `
  <div>
    <label for="c-${nome}" class="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-azul">${rotulo}</label>
    <input id="c-${nome}" name="${nome}" value="${esc(valor)}" ${extra}
      class="w-full border-3 border-azul bg-paper px-4 py-3 font-sans text-base text-tinta focus:border-verde" />
  </div>`;

const campoArea = (nome, rotulo, valor = '') => `
  <div>
    <label for="c-${nome}" class="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-azul">${rotulo}</label>
    <textarea id="c-${nome}" name="${nome}" rows="3"
      class="w-full border-3 border-azul bg-paper px-4 py-3 font-sans text-base text-tinta focus:border-verde">${esc(valor)}</textarea>
  </div>`;

const campoSelect = (nome, rotulo, opcoes, valor) => `
  <div>
    <label for="c-${nome}" class="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-azul">${rotulo}</label>
    <select id="c-${nome}" name="${nome}"
      class="w-full border-3 border-azul bg-paper px-4 py-3 font-sans text-base text-tinta focus:border-verde">
      ${opcoes.map((o) => `<option value="${esc(o)}" ${o === valor ? 'selected' : ''}>${esc(o)}</option>`).join('')}
    </select>
  </div>`;

const campoCheck = (nome, rotulo, marcado) => `
  <label class="flex items-center gap-3 border-3 border-azul bg-paper px-4 py-3">
    <input type="checkbox" name="${nome}" ${marcado ? 'checked' : ''} class="h-5 w-5 border-3 border-azul accent-verde" />
    <span class="font-mono text-xs font-bold uppercase tracking-widest text-azul">${rotulo}</span>
  </label>`;

/* ── Conferência da cobertura 24h ──────────────────────────────────*/

function renderCobertura() {
  // Só os blocos ativos contam: um bloco desmarcado nao vai ao ar, entao
  // deixa um buraco de verdade na grade.
  const porDia = conferirCobertura(estado.programacao.filter((b) => b.ativo));
  const comProblema = DIAS.filter((d) => porDia[d].length);
  const alvo = $('#cobertura');

  if (!comProblema.length) {
    alvo.innerHTML = `
      <div class="flex items-center gap-3 border-3 border-azul bg-verde px-4 py-3 text-white shadow-hard">
        <span class="font-display text-2xl leading-none">✓</span>
        <p class="font-mono text-xs font-bold uppercase tracking-widest">
          As 24 horas estão cobertas nos 7 dias
        </p>
      </div>`;
    return;
  }

  alvo.innerHTML = `
    <div class="border-6 border-azul bg-amarelo p-4 shadow-hard">
      <p class="font-display text-xl uppercase leading-none text-azul md:text-2xl">
        A grade tem ${comProblema.length === 1 ? 'um problema' : `${comProblema.length} dias com problema`}
      </p>
      <p class="mt-2 font-sans text-sm leading-relaxed text-azul">
        Nesses horários a rádio fica sem nada programado. Corrija para o dia fechar 24h.
      </p>
      <ul class="mt-3 space-y-2 border-t-3 border-azul pt-3">
        ${comProblema
          .map(
            (d) => `
          <li class="font-mono text-xs uppercase tracking-wider text-azul">
            <button type="button" data-ir-dia="${d}" class="font-bold underline decoration-3 underline-offset-2">${d}</button>
            — ${porDia[d].map(esc).join(' · ')}
          </li>`
          )
          .join('')}
      </ul>
    </div>`;

  alvo.querySelectorAll('[data-ir-dia]').forEach((b) =>
    b.addEventListener('click', () => {
      estado.dia = b.dataset.irDia;
      renderProgramacao();
    })
  );
}

/* ── Programação ───────────────────────────────────────────────────*/

function formBloco(b = null) {
  const novo = !b;
  return {
    titulo: novo ? 'Novo bloco' : 'Editar bloco',
    campos: [
      campoSelect('dia', 'Dia', DIAS, b?.dia || estado.dia),
      `<div class="grid grid-cols-2 gap-4">
         ${campoTexto('hora_inicio', 'Começa', b?.hora_inicio || '', 'placeholder="07:30" pattern="[0-2][0-9]:[0-5][0-9]" required')}
         ${campoTexto('hora_fim', 'Termina', b?.hora_fim || '', 'placeholder="08:30" pattern="[0-2][0-9]:[0-5][0-9]" required')}
       </div>`,
      campoTexto('programa', 'Nome do programa', b?.programa || '', 'required'),
      campoSelect('tipo', 'Tipo', ['AUTOMATICO', 'AO VIVO'], b?.tipo || 'AUTOMATICO'),
      campoTexto('apresentador', 'Apresentador', b?.apresentador || '', 'placeholder="Só para AO VIVO"'),
      campoTexto('categoria', 'Categoria', b?.categoria || '', 'placeholder="MÚSICA, NOTÍCIAS…"'),
      campoArea('descricao', 'Descrição', b?.descricao || ''),
      campoSelect('cor', 'Cor do card', CORES, b?.cor || 'branco'),
      campoCheck('ativo', 'Ativo (aparece no site)', b ? b.ativo : true),
      `<p class="border-3 border-azul bg-bg px-4 py-3 font-sans text-xs leading-relaxed text-cinza">
         Um bloco pode passar da meia-noite (ex.: 23:00 → 01:00). Cadastre no dia em que ele
         <strong>começa</strong>. O último bloco do dia termina em 00:00.
       </p>`,
    ].join(''),
    aoSalvarFn: async (d) => {
      const reg = {
        dia: d.dia,
        hora_inicio: d.hora_inicio.trim(),
        hora_fim: d.hora_fim.trim(),
        programa: d.programa.trim(),
        tipo: d.tipo,
        apresentador: d.apresentador.trim(),
        categoria: d.categoria.trim(),
        descricao: d.descricao.trim(),
        cor: d.cor,
        ativo: d.ativo === 'on',
      };
      // Checagem local antes de bater no banco: erro daqui é mais claro.
      if (reg.tipo === 'AO VIVO' && !reg.apresentador) {
        throw new Error('Bloco AO VIVO precisa de apresentador.');
      }
      if (novo) await criar('programacao', reg);
      else await atualizar('programacao', `id=eq.${b.id}`, reg);
    },
    aoExcluirFn: novo ? null : () => apagar('programacao', `id=eq.${b.id}`),
  };
}

function renderProgramacao() {
  const filtro = $('#filtro-dias-admin');
  filtro.innerHTML = DIAS.map((d, i) => {
    const on = d === estado.dia;
    const n = estado.programacao.filter((b) => b.dia === d).length;
    return `<button type="button" role="tab" data-dia="${d}" aria-selected="${on}"
      class="border-3 border-azul px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest shadow-hard-sm
             ${on ? 'bg-azul text-bg' : 'bg-paper text-azul'}">
      ${DIAS_CURTOS[i]} <span class="${on ? 'text-amarelo' : 'text-cinza'}">${n}</span>
    </button>`;
  }).join('');
  filtro.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      estado.dia = b.dataset.dia;
      renderProgramacao();
    })
  );

  const doDia = estado.programacao
    .filter((b) => b.dia === estado.dia)
    .sort((a, b) => paraMinutos(a.hora_inicio) - paraMinutos(b.hora_inicio));

  $('#lista-programacao').innerHTML = doDia.length
    ? doDia
        .map(
          (b) => `
      <article class="flex flex-wrap items-center gap-3 border-3 border-azul ${b.ativo ? 'bg-paper' : 'bg-bg'} p-4 shadow-hard">
        <span class="w-32 shrink-0 font-mono text-sm font-bold tracking-wider text-azul">
          ${esc(b.hora_inicio)}–${esc(b.hora_fim)}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-display text-lg/[1.1] uppercase text-azul">${esc(b.programa)}</span>
          <span class="mt-1 block font-mono text-[11px] uppercase tracking-widest text-cinza">
            ${b.tipo === 'AO VIVO' ? `Ao vivo · ${esc(b.apresentador)}` : 'Só música'}
            ${b.ativo ? '' : ' · <strong class="text-azul">fora do ar</strong>'}
          </span>
        </span>
        <span class="inline-block border-3 border-azul px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest
          ${b.tipo === 'AO VIVO' ? 'bg-amarelo text-azul' : 'bg-bg text-cinza'}">
          ${b.tipo === 'AO VIVO' ? 'Ao vivo' : 'Auto'}
        </span>
        <button type="button" data-editar="${b.id}"
          class="border-3 border-azul bg-paper px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-azul hover:bg-amarelo">
          Editar
        </button>
      </article>`
        )
        .join('')
    : `<p class="border-6 border-azul bg-amarelo/40 p-8 text-center font-display text-xl uppercase text-azul">
         Nenhum bloco neste dia
       </p>`;

  $('#lista-programacao')
    .querySelectorAll('[data-editar]')
    .forEach((btn) =>
      btn.addEventListener('click', () => {
        const b = estado.programacao.find((x) => String(x.id) === btn.dataset.editar);
        abrirGaveta(formBloco(b));
      })
    );

  renderCobertura();
}

$('#btn-novo-bloco').addEventListener('click', () => abrirGaveta(formBloco()));

/* ── Notícias ──────────────────────────────────────────────────────*/

function formNoticia(n = null) {
  const novo = !n;
  return {
    titulo: novo ? 'Nova notícia' : 'Editar notícia',
    campos: [
      campoTexto('data', 'Data', n?.data || new Date().toISOString().slice(0, 10), 'type="date" required'),
      campoTexto('titulo', 'Título', n?.titulo || '', 'required'),
      campoArea('resumo', 'Resumo', n?.resumo || ''),
      campoTexto('categoria', 'Categoria', n?.categoria || 'NOTÍCIA'),
      campoTexto('imagem', 'Imagem (URL)', n?.imagem || ''),
      campoTexto('link', 'Link', n?.link || ''),
      campoCheck('destaque', 'Destaque (card grande)', n?.destaque ?? false),
      campoCheck('ativo', 'Ativo (aparece no site)', n ? n.ativo : true),
    ].join(''),
    aoSalvarFn: async (d) => {
      const reg = {
        data: d.data,
        titulo: d.titulo.trim(),
        resumo: d.resumo.trim(),
        categoria: d.categoria.trim() || 'NOTÍCIA',
        imagem: d.imagem.trim(),
        link: d.link.trim(),
        destaque: d.destaque === 'on',
        ativo: d.ativo === 'on',
      };
      if (novo) await criar('noticias', reg);
      else await atualizar('noticias', `id=eq.${n.id}`, reg);
    },
    aoExcluirFn: novo ? null : () => apagar('noticias', `id=eq.${n.id}`),
  };
}

function renderNoticias() {
  $('#lista-noticias-admin').innerHTML = estado.noticias.length
    ? estado.noticias
        .map(
          (n) => `
      <article class="flex flex-wrap items-center gap-3 border-3 border-azul ${n.ativo ? 'bg-paper' : 'bg-bg'} p-4 shadow-hard">
        <span class="w-28 shrink-0 font-mono text-xs font-bold tracking-wider text-cinza">${esc(n.data)}</span>
        <span class="min-w-0 flex-1 font-display text-lg/[1.1] uppercase text-azul">${esc(n.titulo)}</span>
        ${n.destaque ? '<span class="border-3 border-azul bg-amarelo px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-azul">Destaque</span>' : ''}
        ${n.ativo ? '' : '<span class="font-mono text-[10px] uppercase tracking-widest text-cinza">fora do ar</span>'}
        <button type="button" data-editar="${n.id}"
          class="border-3 border-azul bg-paper px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-azul hover:bg-amarelo">
          Editar
        </button>
      </article>`
        )
        .join('')
    : '<p class="border-6 border-azul bg-amarelo/40 p-8 text-center font-display text-xl uppercase text-azul">Nenhuma notícia</p>';

  $('#lista-noticias-admin')
    .querySelectorAll('[data-editar]')
    .forEach((btn) =>
      btn.addEventListener('click', () =>
        abrirGaveta(formNoticia(estado.noticias.find((x) => String(x.id) === btn.dataset.editar)))
      )
    );
}

$('#btn-nova-noticia').addEventListener('click', () => abrirGaveta(formNoticia()));

/* ── Equipe ────────────────────────────────────────────────────────*/

function formPessoa(p = null) {
  const novo = !p;
  return {
    titulo: novo ? 'Nova pessoa' : 'Editar pessoa',
    campos: [
      campoTexto('nome', 'Nome', p?.nome || '', 'required'),
      campoTexto('funcao', 'Função', p?.funcao || '', 'placeholder="Locução, Operação de áudio…"'),
      campoTexto('turma', 'Turma', p?.turma || '', 'placeholder="9º A, Professora…"'),
      campoTexto('ordem', 'Ordem', p?.ordem ?? 0, 'type="number" min="0"'),
      campoCheck('ativo', 'Ativo (aparece no site)', p ? p.ativo : true),
      `<p class="border-3 border-azul bg-amarelo px-4 py-3 font-sans text-xs leading-relaxed text-azul">
         Esta lista é pública. Nunca preencha endereço, telefone, CPF ou matrícula.
       </p>`,
    ].join(''),
    aoSalvarFn: async (d) => {
      const reg = {
        nome: d.nome.trim(),
        funcao: d.funcao.trim(),
        turma: d.turma.trim(),
        ordem: Number(d.ordem) || 0,
        ativo: d.ativo === 'on',
      };
      if (novo) await criar('equipe', reg);
      else await atualizar('equipe', `id=eq.${p.id}`, reg);
    },
    aoExcluirFn: novo ? null : () => apagar('equipe', `id=eq.${p.id}`),
  };
}

function renderEquipe() {
  $('#lista-equipe-admin').innerHTML = estado.equipe.length
    ? estado.equipe
        .map(
          (p) => `
      <article class="flex flex-wrap items-center gap-3 border-3 border-azul ${p.ativo ? 'bg-paper' : 'bg-bg'} p-4 shadow-hard">
        <span class="min-w-0 flex-1">
          <span class="block font-display text-lg/[1.1] uppercase text-azul">${esc(p.nome)}</span>
          <span class="mt-1 block font-mono text-[11px] uppercase tracking-widest text-cinza">
            ${esc(p.funcao)}${p.turma ? ' · ' + esc(p.turma) : ''}${p.ativo ? '' : ' · fora do ar'}
          </span>
        </span>
        <button type="button" data-editar="${p.id}"
          class="border-3 border-azul bg-paper px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-azul hover:bg-amarelo">
          Editar
        </button>
      </article>`
        )
        .join('')
    : '<p class="border-6 border-azul bg-amarelo/40 p-8 text-center font-display text-xl uppercase text-azul">Ninguém cadastrado</p>';

  $('#lista-equipe-admin')
    .querySelectorAll('[data-editar]')
    .forEach((btn) =>
      btn.addEventListener('click', () =>
        abrirGaveta(formPessoa(estado.equipe.find((x) => String(x.id) === btn.dataset.editar)))
      )
    );
}

$('#btn-nova-pessoa').addEventListener('click', () => abrirGaveta(formPessoa()));

/* ── Ajustes (config) ──────────────────────────────────────────────*/

/** Chaves `secao_*` viram interruptores; o resto vira campo de texto. */
const SECOES_ROTULO = {
  secao_programacao: 'Programação',
  secao_webtv: 'WebTV (vídeo)',
  secao_noticias: 'Notícias',
  secao_participe: 'Participe',
};

const estaLigada = (v) => String(v ?? 'SIM').trim().toUpperCase() !== 'NAO';

function renderSecoes() {
  const alvo = $('#lista-secoes');
  if (!alvo) return;

  const chaves = estado.config.filter((c) => c.chave in SECOES_ROTULO);

  if (!chaves.length) {
    alvo.innerHTML = `
      <div class="border-3 border-azul bg-amarelo px-4 py-3 font-sans text-sm leading-relaxed text-azul">
        <strong>Ainda não dá para ligar e desligar seções.</strong> Falta cadastrar
        as chaves no banco — peça para rodar o trecho de SQL que está no
        <code>SUPABASE.md</code>, seção “Ligar e desligar seções”.
      </div>`;
    return;
  }

  alvo.innerHTML = chaves
    .map((c) => {
      const on = estaLigada(c.valor);
      return `
      <label class="flex cursor-pointer items-center gap-4 border-3 border-azul ${on ? 'bg-paper' : 'bg-bg'} p-4 shadow-hard">
        <input type="checkbox" data-secao="${esc(c.chave)}" ${on ? 'checked' : ''}
          class="h-6 w-6 shrink-0 border-3 border-azul accent-verde" />
        <span class="min-w-0 flex-1">
          <span class="block font-display text-lg/[1.1] uppercase text-azul">${esc(SECOES_ROTULO[c.chave])}</span>
          <span class="mt-1 block font-mono text-[11px] uppercase tracking-widest text-cinza">
            ${on ? 'Aparece no site' : 'Escondida do site'}
          </span>
        </span>
      </label>`;
    })
    .join('');

  alvo.querySelectorAll('[data-secao]').forEach((inp) =>
    inp.addEventListener('change', async () => {
      const valor = inp.checked ? 'SIM' : 'NAO';
      try {
        await atualizar('config', `chave=eq.${encodeURIComponent(inp.dataset.secao)}`, { valor });
        limparCache();
        const c = estado.config.find((x) => x.chave === inp.dataset.secao);
        if (c) c.valor = valor;
        renderSecoes();
        alerta(inp.checked ? 'Seção ligada.' : 'Seção escondida do site.');
      } catch (err) {
        inp.checked = !inp.checked; // desfaz o visual se o banco recusou
        alerta(err.message, 'erro');
      }
    })
  );
}

function renderConfig() {
  renderSecoes();

  $('#lista-config').innerHTML = estado.config
    .filter((c) => !(c.chave in SECOES_ROTULO))
    .map(
      (c) => `
      <form data-chave="${esc(c.chave)}" class="border-3 border-azul bg-paper p-4 shadow-hard">
        <label class="mb-1 block font-mono text-xs font-bold uppercase tracking-widest text-azul">${esc(c.chave)}</label>
        ${c.descricao ? `<p class="mb-3 font-sans text-xs leading-relaxed text-cinza">${esc(c.descricao)}</p>` : ''}
        <div class="flex flex-wrap gap-3">
          <input name="valor" value="${esc(c.valor)}"
            class="min-w-0 flex-1 border-3 border-azul bg-bg px-4 py-3 font-sans text-sm text-tinta focus:border-verde" />
          <button type="submit" class="btn btn-primario">Salvar</button>
        </div>
      </form>`
    )
    .join('');

  $('#lista-config')
    .querySelectorAll('form')
    .forEach((f) =>
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = f.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Salvando…';
        try {
          await atualizar('config', `chave=eq.${encodeURIComponent(f.dataset.chave)}`, {
            valor: f.querySelector('[name=valor]').value,
          });
          limparCache();
          alerta('Salvo. O site já mostra a mudança.');
        } catch (err) {
          alerta(err.message, 'erro');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Salvar';
        }
      })
    );
}

/* ── Acessos (contas de login) ─────────────────────────────────────
   Criar conta exige a chave `service_role`, que ignora todo o RLS e nao
   pode existir no navegador. Por isso estas chamadas vao para a funcao
   `/api/contas` na Vercel, que guarda a chave e confere se quem pediu
   esta na tabela `editores`. Localmente nao funciona: nao ha servidor. */

async function chamarApiContas(metodo, corpo) {
  const s = sessao();
  const r = await fetch('/api/contas', {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s?.access_token || ''}`,
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const txt = await r.text();
  let d = null;
  try {
    d = txt ? JSON.parse(txt) : null;
  } catch {
    // Sem servidor de funcoes, o que volta e' o HTML de erro do servidor.
    throw new Error(
      'A área de acessos só funciona no site publicado. ' +
        'No teste local não existe servidor para criar contas.'
    );
  }
  if (!r.ok) throw new Error(d?.erro || `Falha (HTTP ${r.status}).`);
  return d;
}

function formConta() {
  return {
    titulo: 'Nova conta',
    campos: [
      campoTexto('nome', 'Nome da pessoa', '', 'placeholder="Ana Beatriz"'),
      campoTexto('email', 'E-mail', '', 'type="email" required placeholder="pessoa@exemplo.com"'),
      campoTexto('senha', 'Senha inicial', '', 'type="text" required minlength="8" placeholder="mínimo 8 caracteres"'),
      `<p class="border-3 border-azul bg-amarelo px-4 py-3 font-sans text-xs leading-relaxed text-azul">
         A senha aparece à mostra para você conseguir passá-la à pessoa. Combine
         que ela troque depois. Quem receber esta conta poderá alterar a
         programação inteira.
       </p>`,
    ].join(''),
    aoSalvarFn: async (d) => {
      await chamarApiContas('POST', {
        nome: d.nome.trim(),
        email: d.email.trim(),
        senha: d.senha,
      });
    },
    aoExcluirFn: null,
  };
}

async function renderContas() {
  const alvo = $('#lista-contas');
  if (!alvo) return;

  let contas;
  try {
    contas = await chamarApiContas('GET');
  } catch (err) {
    alvo.innerHTML = `
      <div class="border-6 border-azul bg-amarelo p-6">
        <p class="font-display text-xl uppercase text-azul">Não foi possível listar os acessos</p>
        <p class="mt-2 font-sans text-sm leading-relaxed text-azul">${esc(err.message)}</p>
      </div>`;
    return;
  }

  const eu = emailLogado();
  alvo.innerHTML = contas
    .map((c) => {
      const souEu = c.email === eu;
      return `
      <article class="flex flex-wrap items-center gap-3 border-3 border-azul bg-paper p-4 shadow-hard">
        <span class="min-w-0 flex-1">
          <span class="block font-display text-lg/[1.1] uppercase text-azul">
            ${esc(c.nome || c.email)}
          </span>
          <span class="mt-1 block font-mono text-[11px] uppercase tracking-widest text-cinza">
            ${esc(c.email)}${souEu ? ' · você' : ''}
          </span>
        </span>
        ${
          souEu
            ? '<span class="border-3 border-azul bg-amarelo px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-azul">Sua conta</span>'
            : `<button type="button" data-remover="${esc(c.user_id)}" data-email="${esc(c.email)}"
                 class="border-3 border-azul bg-paper px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-azul hover:bg-amarelo">
                 Tirar acesso
               </button>`
        }
      </article>`;
    })
    .join('');

  alvo.querySelectorAll('[data-remover]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm(`Tirar o acesso de ${btn.dataset.email}? A conta continua existindo, mas deixa de poder editar.`)) return;
      try {
        await chamarApiContas('DELETE', { user_id: btn.dataset.remover });
        alerta('Acesso removido.');
        renderContas();
      } catch (err) {
        alerta(err.message, 'erro');
      }
    })
  );
}

$('#btn-nova-conta').addEventListener('click', () => abrirGaveta(formConta()));

/* ── Carregamento ──────────────────────────────────────────────────*/

async function carregarTudo() {
  try {
    const [p, n, e, c] = await Promise.all([
      listar('programacao', 'select=*&order=dia.asc,hora_inicio.asc'),
      listar('noticias', 'select=*&order=data.desc'),
      listar('equipe', 'select=*&order=ordem.asc'),
      listar('config', 'select=*&order=chave.asc'),
    ]);
    Object.assign(estado, { programacao: p, noticias: n, equipe: e, config: c });
    renderProgramacao();
    renderNoticias();
    renderEquipe();
    renderConfig();
  } catch (err) {
    alerta(err.message, 'erro');
    if (/autenticado|expirou|permissão/i.test(err.message)) mostrarLogin();
  }
}

/* ── Entrada ───────────────────────────────────────────────────────*/

pintarAbas('programacao');
if (estaLogado()) mostrarPainel();
else mostrarLogin();
