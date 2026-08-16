/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Mantém o projeto Supabase acordado
   ───────────────────────────────────────────────────────────────────
   O plano free do Supabase PAUSA o projeto depois de ~7 dias sem
   nenhuma requisição. Numa rádio escolar isso acontece exatamente no
   pior momento: recesso de dezembro a fevereiro, ninguém acessa o site,
   o banco dorme — e a grade some quando as aulas voltam.

   Esta função faz uma consulta minúscula no banco. Qualquer requisição
   conta como atividade e zera o contador de inatividade.

   Chamada pelo cron do Vercel (ver `crons` em vercel.json), uma vez por
   dia. O workflow do GitHub em .github/workflows/ faz o mesmo por outro
   caminho, como rede de segurança — se um dos dois falhar, o outro
   segura. Ver SUPABASE.md.
   ═══════════════════════════════════════════════════════════════════ */

export default async function handler(req, res) {
  // O Vercel manda este header quando CRON_SECRET esta configurado.
  // Sem isso, a rota fica aberta para qualquer um chamar em looping.
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.authorization !== `Bearer ${segredo}`) {
    return res.status(401).json({ erro: 'nao autorizado' });
  }

  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_ANON_KEY;

  if (!url || !chave) {
    return res.status(500).json({
      ok: false,
      erro: 'Faltam as variaveis SUPABASE_URL e SUPABASE_ANON_KEY no projeto do Vercel.',
    });
  }

  const inicio = Date.now();
  try {
    // Consulta de propósito minúscula: uma coluna, uma linha.
    const r = await fetch(`${url}/rest/v1/config?select=chave&limit=1`, {
      headers: {
        apikey: chave,
        Authorization: `Bearer ${chave}`,
        Accept: 'application/json',
      },
    });

    if (!r.ok) {
      const corpo = await r.text();
      console.error('[keep-alive] Supabase respondeu', r.status, corpo);
      return res.status(502).json({ ok: false, status: r.status, detalhe: corpo.slice(0, 300) });
    }

    const linhas = await r.json();
    const ms = Date.now() - inicio;
    console.log(`[keep-alive] ok em ${ms}ms, ${linhas.length} linha(s)`);

    return res.status(200).json({
      ok: true,
      mensagem: 'Supabase respondeu; contador de inatividade zerado.',
      linhas: linhas.length,
      ms,
      em: new Date().toISOString(),
    });
  } catch (erro) {
    console.error('[keep-alive] falhou', erro);
    return res.status(500).json({ ok: false, erro: String(erro) });
  }
}
