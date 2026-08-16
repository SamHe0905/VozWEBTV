/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Configuracao central
   ───────────────────────────────────────────────────────────────────
   ESTE E' O UNICO ARQUIVO QUE PRECISA SER EDITADO quando as APIs
   estiverem prontas. Todo o resto do site le daqui.

   Enquanto `MODO_DEMO` for true, o site roda com os dados de exemplo
   em `assets/js/mock.js` e nao faz nenhuma chamada de rede.
   ═══════════════════════════════════════════════════════════════════ */

/**
 * `true` = ignora o banco e usa os dados de `mock.js`.
 * `false` = le do Supabase, caindo em `mock.js` se o banco falhar.
 *
 * Ja esta em `false`: assim que `supabase/schema.sql` for rodado, o site
 * passa a ler do banco sozinho, sem precisar mexer aqui de novo.
 */
export const MODO_DEMO = false;

/* ── AzuraCast (audio ao vivo) ─────────────────────────────────────
   Preencher quando a instancia da escola estiver no ar. */
const AZURACAST_REAL = {
  /** URL do stream. Ex.: https://radio.exemplo.br/listen/voz_webtv/radio.mp3 */
  streamUrl: '',
  /** API publica de "tocando agora". Ex.: https://radio.exemplo.br/api/nowplaying/voz_webtv */
  nowPlaying: '',
  /** Intervalo de atualizacao do "tocando agora", em ms. */
  pollMs: 15000,
};

/* ── Streams de teste ──────────────────────────────────────────────
   Acionados por `?stream=demo` na URL. Servem para experimentar o
   player antes de a radio da escola existir — inclusive no celular,
   pelo site publicado.

   Fica FORA da configuracao normal de proposito: deixar o stream de
   outra emissora fixo no site seria retransmitir a radio dela sob o
   nome da escola. Assim, so ouve quem digita o parametro.

   A lista e' FECHADA: `?stream=` so aceita as chaves abaixo, nunca uma
   URL qualquer. Se aceitasse, um link montado por terceiros faria o
   site da escola tocar qualquer coisa. */
const STREAMS_DE_TESTE = {
  // Instancia publica de demonstracao do proprio AzuraCast.
  demo: {
    streamUrl: 'https://demo.azuracast.com/listen/azuratest_radio/radio.mp3',
    nowPlaying: 'https://demo.azuracast.com/api/nowplaying/azuratest_radio',
  },
};

/** Qual teste esta ativo agora, ou `null`. */
export function testeAtivo() {
  try {
    const escolha = new URLSearchParams(window.location.search).get('stream');
    return escolha && STREAMS_DE_TESTE[escolha] ? escolha : null;
  } catch {
    return null;
  }
}

const emTeste = testeAtivo();

export const AZURACAST = emTeste
  ? { ...AZURACAST_REAL, ...STREAMS_DE_TESTE[emTeste] }
  : AZURACAST_REAL;

/* ── Supabase (banco + painel admin) ───────────────────────────────
   Supabase > Project Settings > API.

   A chave `anonKey` E' PUBLICA por design — ela vai no codigo do cliente
   de qualquer site Supabase. Quem protege os dados sao as policies de RLS
   em `supabase/schema.sql`: com ela da' para LER, nunca para escrever.

   NUNCA colocar aqui a chave `service_role`: ela ignora todo o RLS. */
export const SUPABASE = {
  url: 'https://bkmjzyrkxhfahoxcjiby.supabase.co',
  /**
   * Chave PUBLICAVEL (formato novo do Supabase, prefixo `sb_publishable_`).
   * Equivale a antiga `anon` e e' feita para ficar no codigo do cliente —
   * com ela da' para LER o que o RLS permite, nunca para escrever.
   * A chave `sb_secret_` NUNCA pode aparecer aqui.
   */
  anonKey: 'sb_publishable_5qaU-gKFPbqVXo9zqBkSFQ_APbA_n1k',
};

/* ── WebTV (YouTube) ───────────────────────────────────────────────
   `videoId` aceita tanto um video normal quanto uma live.
   Com `ativo: false`, a secao mostra o estado "sem transmissao". */
export const WEBTV = {
  ativo: true,
  videoId: '',
  titulo: 'Jornal da Voz — Edição de agosto',
  descricao: 'Reportagens, entrevistas e bastidores produzidos pelos alunos.',
};

/* ── Identidade e contato ──────────────────────────────────────────*/
export const SITE = {
  /** "Voz WebTV": o TV vem de Teotonio Vilela, nao de televisao. */
  nome: 'Voz WebTV',
  escola: 'Escola Estadual Teotônio Vilela',
  endereco: {
    rua: 'Av. Souza Lima, 506',
    bairro: 'Núcleo Habitacional Universitário',
    cidade: 'Campo Grande',
    uf: 'MS',
    cep: '79071-340',
  },
  cidade: 'Campo Grande — MS',
  email: 'contato@vozwebtv.com.br',
  instagram: '#',
  youtube: '#',
  /** Fuso fixo do MS: o "no ar agora" nao pode depender do relogio do visitante. */
  fusoHorario: 'America/Campo_Grande',
};

/* ── Cache dos dados da planilha ───────────────────────────────────*/
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
