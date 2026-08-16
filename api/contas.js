/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Contas de acesso ao painel
   ───────────────────────────────────────────────────────────────────
   POR QUE ISTO E' UMA FUNCAO DE SERVIDOR, E NAO CODIGO DO PAINEL

   Criar conta exige a chave `service_role`, que IGNORA todo o RLS. Se ela
   fosse para o navegador, qualquer pessoa que abrisse o painel — logada ou
   nao — teria acesso irrestrito ao banco. Entao a chave fica so' aqui, numa
   variavel de ambiente da Vercel, e o painel conversa com esta rota.

   TODA requisicao passa por duas checagens antes de qualquer escrita:
     1. o token enviado e' de um usuario valido?
     2. esse usuario esta na tabela `editores`?

   Estar logado NAO basta. Sem o passo 2, qualquer conta criada no futuro
   poderia criar outras contas.

   Rotas:
     POST   /api/contas   { email, senha, nome }  -> cria conta e vira editor
     GET    /api/contas                           -> lista quem tem acesso
     DELETE /api/contas   { user_id }             -> tira o acesso (nao apaga a conta)
   ═══════════════════════════════════════════════════════════════════ */

const URL_SUPA = process.env.SUPABASE_URL;
const CHAVE_PUBLICA = process.env.SUPABASE_ANON_KEY;
const CHAVE_MESTRA = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Cabecalhos com a chave mestra. NUNCA sai desta funcao. */
const comoAdmin = () => ({
  apikey: CHAVE_MESTRA,
  Authorization: `Bearer ${CHAVE_MESTRA}`,
  'Content-Type': 'application/json',
});

/**
 * Confere quem esta chamando. Devolve o usuario ou lanca.
 * As duas checagens sao obrigatorias: token valido E estar em `editores`.
 */
async function exigirEditor(req) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : '';
  if (!token) {
    const e = new Error('Você precisa estar logado.');
    e.status = 401;
    throw e;
  }

  // 1. O token e' de alguem de verdade?
  const rUser = await fetch(`${URL_SUPA}/auth/v1/user`, {
    headers: { apikey: CHAVE_PUBLICA, Authorization: `Bearer ${token}` },
  });
  if (!rUser.ok) {
    const e = new Error('Sua sessão expirou. Entre de novo.');
    e.status = 401;
    throw e;
  }
  const usuario = await rUser.json();

  // 2. Esse alguem pode editar? Consultado com a chave mestra de proposito:
  //    nao depende do RLS nem do que o navegador afirma ser.
  const rEd = await fetch(
    `${URL_SUPA}/rest/v1/editores?select=user_id&user_id=eq.${usuario.id}`,
    { headers: comoAdmin() }
  );
  const editores = rEd.ok ? await rEd.json() : [];
  if (!editores.length) {
    const e = new Error('Sua conta não tem permissão para gerenciar acessos.');
    e.status = 403;
    throw e;
  }

  return usuario;
}

const ehEmailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());

export default async function handler(req, res) {
  if (!URL_SUPA || !CHAVE_PUBLICA || !CHAVE_MESTRA) {
    return res.status(500).json({
      erro:
        'Faltam variáveis de ambiente na Vercel. Configure SUPABASE_URL, ' +
        'SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.',
    });
  }

  let solicitante;
  try {
    solicitante = await exigirEditor(req);
  } catch (e) {
    return res.status(e.status || 401).json({ erro: e.message });
  }

  /* ── Listar quem tem acesso ────────────────────────────────────── */
  if (req.method === 'GET') {
    const r = await fetch(
      `${URL_SUPA}/rest/v1/editores?select=user_id,email,nome,criado_em&order=criado_em.asc`,
      { headers: comoAdmin() }
    );
    return res.status(200).json(await r.json());
  }

  /* ── Criar conta ───────────────────────────────────────────────── */
  if (req.method === 'POST') {
    const { email, senha, nome } = req.body || {};

    if (!ehEmailValido(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
    if (!senha || String(senha).length < 8) {
      return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' });
    }

    // `email_confirm: true` deixa a conta usável na hora. O projeto não tem
    // SMTP próprio, então esperar confirmação por e-mail travaria o cadastro.
    const rNovo = await fetch(`${URL_SUPA}/auth/v1/admin/users`, {
      method: 'POST',
      headers: comoAdmin(),
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password: String(senha),
        email_confirm: true,
        user_metadata: { name: String(nome || '').trim() },
      }),
    });

    const novo = await rNovo.json();
    if (!rNovo.ok) {
      const msg = String(novo.msg || novo.message || '').toLowerCase();
      if (msg.includes('already been registered') || msg.includes('already exists')) {
        return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
      }
      if (msg.includes('password')) {
        return res.status(400).json({ erro: 'Senha recusada: use pelo menos 8 caracteres.' });
      }
      return res.status(rNovo.status).json({ erro: novo.msg || novo.message || 'Não foi possível criar a conta.' });
    }

    // Conta criada não serve de nada sem entrar na lista de editores.
    const rEd = await fetch(`${URL_SUPA}/rest/v1/editores`, {
      method: 'POST',
      headers: { ...comoAdmin(), Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: novo.id,
        email: novo.email,
        nome: String(nome || '').trim(),
      }),
    });

    if (!rEd.ok) {
      // A conta existe mas não vira editor: avisa em vez de fingir sucesso.
      return res.status(500).json({
        erro:
          'A conta foi criada, mas não entrou na lista de editores. ' +
          'Rode o reforcar-permissoes.sql de novo para corrigir.',
      });
    }

    console.log(`[contas] ${solicitante.email} criou ${novo.email}`);
    return res.status(201).json({ ok: true, email: novo.email, user_id: novo.id });
  }

  /* ── Tirar o acesso ────────────────────────────────────────────── */
  if (req.method === 'DELETE') {
    const { user_id } = req.body || {};
    if (!user_id) return res.status(400).json({ erro: 'Falta o user_id.' });

    // Deixar alguém se remover sozinho pode trancar todo mundo para fora.
    if (user_id === solicitante.id) {
      return res.status(400).json({ erro: 'Você não pode remover o próprio acesso.' });
    }

    // Só sai da lista de editores; a conta continua existindo. Apagar conta
    // é destrutivo demais para um botão de painel — isso fica no Supabase.
    const r = await fetch(`${URL_SUPA}/rest/v1/editores?user_id=eq.${user_id}`, {
      method: 'DELETE',
      headers: comoAdmin(),
    });
    if (!r.ok) return res.status(500).json({ erro: 'Não foi possível remover o acesso.' });

    console.log(`[contas] ${solicitante.email} removeu acesso de ${user_id}`);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ erro: 'Método não permitido.' });
}
