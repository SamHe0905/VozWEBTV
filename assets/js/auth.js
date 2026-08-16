/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Autenticacao e escrita no banco (painel admin)
   ───────────────────────────────────────────────────────────────────
   Fala direto com a API REST do Supabase, sem a biblioteca supabase-js.

   POR QUE NAO USAR A BIBLIOTECA: o build ESM dela nao e' autossuficiente
   — ele reexporta de outros arquivos do CDN, entao "self-hospedar" seria
   ilusao: em tempo de execucao ainda buscaria no jsDelivr. Rede de escola
   costuma bloquear CDN, o que derrubaria o painel justamente no lugar
   onde ele e' usado. A superficie de que precisamos e' pequena: entrar,
   sair, renovar o token e fazer CRUD.

   O QUE FICA GUARDADO: `access_token` e `refresh_token` no localStorage.
   E' o mesmo que a biblioteca oficial faz. O access_token expira em 1h;
   este modulo renova sozinho antes disso.
   ═══════════════════════════════════════════════════════════════════ */

import { SUPABASE } from './config.js?v=202608160218';

const CHAVE_SESSAO = 'voz:sessao';
/** Renova com esta antecedencia, para nao esbarrar no vencimento. */
const MARGEM_MS = 60_000;

/* ── Sessao ────────────────────────────────────────────────────────*/

export function sessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null');
  } catch {
    return null;
  }
}

function guardarSessao(s) {
  if (!s) {
    localStorage.removeItem(CHAVE_SESSAO);
    return null;
  }
  // `expires_at` vem em segundos; guardamos em ms para comparar com Date.now().
  const gravar = {
    access_token: s.access_token,
    refresh_token: s.refresh_token,
    expira_em: (s.expires_at ? s.expires_at * 1000 : Date.now() + (s.expires_in || 3600) * 1000),
    email: s.user?.email || sessao()?.email || '',
  };
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(gravar));
  return gravar;
}

export const estaLogado = () => Boolean(sessao()?.access_token);
export const emailLogado = () => sessao()?.email || '';

/* ── Chamadas de autenticacao ──────────────────────────────────────*/

async function postAuth(caminho, corpo) {
  const r = await fetch(`${SUPABASE.url}/auth/v1/${caminho}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(corpo),
  });

  const texto = await r.text();
  let dados = {};
  try {
    dados = JSON.parse(texto);
  } catch {
    /* resposta sem corpo, como no logout */
  }

  if (!r.ok) {
    const msg = dados.error_description || dados.msg || dados.message || `HTTP ${r.status}`;
    throw new Error(traduzirErro(msg, r.status));
  }
  return dados;
}

/** As mensagens do Supabase vem em ingles; quem usa o painel e' professor. */
function traduzirErro(msg, status) {
  const m = String(msg).toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Este e-mail ainda não foi confirmado.';
  // Acontece quando desligam o provedor de e-mail inteiro achando que
  // estao so fechando o cadastro. Sao dois botoes diferentes na mesma tela.
  if (m.includes('email logins are disabled') || m.includes('email provider')) {
    return (
      'O login por e-mail está desligado no Supabase. ' +
      'Em Authentication → Sign In / Providers → Email, ligue "Enable Email provider" ' +
      'e mantenha "Allow new users to sign up" desligado.'
    );
  }
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) {
    return 'O cadastro está fechado, como deve ser. Peça uma conta a quem cuida da rádio.';
  }
  if (m.includes('invalid refresh token') || m.includes('refresh_token_not_found')) {
    return 'Sua sessão expirou. Entre de novo.';
  }
  if (m.includes('rate limit') || status === 429) {
    return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  }
  if (status === 0 || m.includes('failed to fetch')) return 'Sem conexão com o servidor.';
  return `Não foi possível entrar: ${msg}`;
}

export async function entrar(email, senha) {
  const s = await postAuth('token?grant_type=password', { email, password: senha });
  return guardarSessao(s);
}

export async function sair() {
  const s = sessao();
  if (s?.access_token) {
    // Se falhar, tudo bem: o que importa e' apagar a sessao local.
    try {
      await fetch(`${SUPABASE.url}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: SUPABASE.anonKey, Authorization: `Bearer ${s.access_token}` },
      });
    } catch {
      /* ignorado de proposito */
    }
  }
  guardarSessao(null);
}

async function renovar() {
  const s = sessao();
  if (!s?.refresh_token) throw new Error('Sua sessão expirou. Entre de novo.');
  const nova = await postAuth('token?grant_type=refresh_token', { refresh_token: s.refresh_token });
  return guardarSessao(nova);
}

/** Devolve um access_token valido, renovando se estiver perto de vencer. */
async function tokenValido() {
  const s = sessao();
  if (!s) throw new Error('Você não está autenticado.');
  if (Date.now() < s.expira_em - MARGEM_MS) return s.access_token;
  return (await renovar()).access_token;
}

/* ── CRUD autenticado ──────────────────────────────────────────────*/

/**
 * Requisicao ao PostgREST com o token do usuario.
 * Numa resposta 401 tenta renovar UMA vez e repetir — cobre o caso do
 * token ter vencido entre a checagem e o envio.
 */
async function comAuth(caminho, opcoes = {}, jaTentou = false) {
  const token = await tokenValido();

  const r = await fetch(`${SUPABASE.url}/rest/v1/${caminho}`, {
    ...opcoes,
    headers: {
      apikey: SUPABASE.anonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(opcoes.headers || {}),
    },
  });

  if (r.status === 401 && !jaTentou) {
    await renovar();
    return comAuth(caminho, opcoes, true);
  }

  const texto = await r.text();
  let dados = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    dados = texto;
  }

  if (!r.ok) {
    throw new Error(traduzirErroBanco(dados, r.status));
  }
  return dados;
}

/**
 * As CHECK constraints do banco sao a ultima linha de defesa contra dado
 * errado. Quando alguma barra a escrita, o Postgres devolve um texto
 * tecnico — aqui ele vira uma frase que diz o que corrigir.
 */
function traduzirErroBanco(dados, status) {
  const msg = String(dados?.message || dados?.hint || dados || `HTTP ${status}`);

  if (msg.includes('apresentador_obrigatorio_ao_vivo')) {
    return 'Bloco AO VIVO precisa ter apresentador preenchido.';
  }
  if (msg.includes('programacao_dia_check') || msg.includes('violates check constraint "programacao_dia')) {
    return 'Dia inválido. Use SEGUNDA, TERÇA, QUARTA, QUINTA, SEXTA, SÁBADO ou DOMINGO.';
  }
  if (msg.includes('hora_inicio_check') || msg.includes('hora_fim_check')) {
    return 'Horário fora do formato. Use HH:MM, com dois dígitos (ex.: 07:30).';
  }
  if (msg.includes('_cor_check')) {
    return 'Cor inválida. Use verde, azul, amarelo ou branco.';
  }
  if (msg.includes('_tipo_check')) {
    return 'Tipo inválido. Use AO VIVO ou AUTOMATICO.';
  }
  if (msg.includes('violates check constraint') && msg.includes('programa')) {
    return 'O nome do programa não pode ficar vazio.';
  }
  if (msg.includes('duplicate key')) {
    return 'Já existe um registro com essa chave.';
  }
  if (status === 401 || status === 403) {
    return 'Sua sessão perdeu a permissão. Entre de novo.';
  }
  return `O banco recusou a gravação: ${msg}`;
}

export const listar = (tabela, query = 'select=*') => comAuth(`${tabela}?${query}`);

export const criar = (tabela, registro) =>
  comAuth(tabela, { method: 'POST', body: JSON.stringify(registro) });

export const atualizar = (tabela, filtro, mudancas) =>
  comAuth(`${tabela}?${filtro}`, { method: 'PATCH', body: JSON.stringify(mudancas) });

export const apagar = (tabela, filtro) => comAuth(`${tabela}?${filtro}`, { method: 'DELETE' });
