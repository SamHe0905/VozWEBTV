/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Configuracao central
   ───────────────────────────────────────────────────────────────────
   ESTE E' O UNICO ARQUIVO QUE PRECISA SER EDITADO quando as APIs
   estiverem prontas. Todo o resto do site le daqui.

   Enquanto `MODO_DEMO` for true, o site roda com os dados de exemplo
   em `assets/js/mock.js` e nao faz nenhuma chamada de rede.
   ═══════════════════════════════════════════════════════════════════ */

/** Liga os dados de demonstracao. Trocar para `false` na Fase 3/4. */
export const MODO_DEMO = true;

/* ── AzuraCast (audio ao vivo) ─────────────────────────────────────
   Preencher quando a instancia estiver no ar. Ver memory.md > Pendencias. */
export const AZURACAST = {
  /** URL do stream. Ex.: https://radio.exemplo.br/listen/voz_webtv/radio.mp3 */
  streamUrl: '',
  /** API publica de "tocando agora". Ex.: https://radio.exemplo.br/api/nowplaying/voz_webtv */
  nowPlaying: '',
  /** Intervalo de atualizacao do "tocando agora", em ms. */
  pollMs: 15000,
};

/* ── Google Sheets (CMS) ───────────────────────────────────────────
   Planilha > Arquivo > Compartilhar > Publicar na web > aba + CSV.
   Formato: https://docs.google.com/spreadsheets/d/e/<TOKEN>/pub?gid=<GID>&single=true&output=csv */
export const PLANILHAS = {
  programacao: '',
  noticias: '',
  equipe: '',
  config: '',
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
  cidade: 'Mato Grosso do Sul',
  email: 'contato@vozwebtv.com.br',
  instagram: '#',
  youtube: '#',
  /** Fuso fixo do MS: o "no ar agora" nao pode depender do relogio do visitante. */
  fusoHorario: 'America/Campo_Grande',
};

/* ── Cache dos dados da planilha ───────────────────────────────────*/
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
