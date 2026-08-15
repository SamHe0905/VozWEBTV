/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Dados de demonstracao
   ───────────────────────────────────────────────────────────────────
   Os objetos aqui usam EXATAMENTE os mesmos nomes de campo das colunas
   da planilha do Google (ver project.md > secao 5). Quando a integracao
   com o PapaParse entrar, o formato de saida sera identico a este e
   nenhum codigo de renderizacao precisara mudar.
   ═══════════════════════════════════════════════════════════════════ */

export const PROGRAMACAO = [
  // ── SEGUNDA ──────────────────────────────────────────────────────
  { dia: 'SEGUNDA', hora_inicio: '07:00', hora_fim: '07:30', programa: 'Bom Dia, Escola', apresentador: 'Equipe Voz WebTV', descricao: 'Avisos da direção, aniversariantes e a trilha para começar o dia.', categoria: 'ABERTURA', cor: 'amarelo', ativo: 'SIM' },
  { dia: 'SEGUNDA', hora_inicio: '07:30', hora_fim: '08:30', programa: 'Manhã na Escola', apresentador: 'Turma do 9º A', descricao: 'Notícias da comunidade escolar com pauta produzida pelos alunos.', categoria: 'NOTÍCIAS', cor: 'branco', ativo: 'SIM' },
  { dia: 'SEGUNDA', hora_inicio: '09:00', hora_fim: '10:00', programa: 'Estúdio Aberto', apresentador: 'Prof. Marina Alves', descricao: 'Entrevistas com professores, servidores e visitantes.', categoria: 'ENTREVISTA', cor: 'verde', ativo: 'SIM' },
  { dia: 'SEGUNDA', hora_inicio: '10:30', hora_fim: '11:30', programa: 'Playlist do Intervalo', apresentador: 'Grêmio Estudantil', descricao: 'Os pedidos musicais da semana, votados pelas turmas.', categoria: 'MÚSICA', cor: 'azul', ativo: 'SIM' },
  { dia: 'SEGUNDA', hora_inicio: '13:00', hora_fim: '14:00', programa: 'Ciência em 5 Minutos', apresentador: 'Clube de Ciências', descricao: 'Experimentos, curiosidades e o que caiu no vestibular.', categoria: 'EDUCAÇÃO', cor: 'branco', ativo: 'SIM' },
  { dia: 'SEGUNDA', hora_inicio: '15:00', hora_fim: '16:00', programa: 'Sinal de Saída', apresentador: 'DJ Convidado', descricao: 'A trilha para fechar o turno da tarde.', categoria: 'MÚSICA', cor: 'amarelo', ativo: 'SIM' },

  // ── TERCA ────────────────────────────────────────────────────────
  { dia: 'TERÇA', hora_inicio: '07:00', hora_fim: '07:30', programa: 'Bom Dia, Escola', apresentador: 'Equipe Voz WebTV', descricao: 'Avisos da direção, aniversariantes e a trilha para começar o dia.', categoria: 'ABERTURA', cor: 'amarelo', ativo: 'SIM' },
  { dia: 'TERÇA', hora_inicio: '08:00', hora_fim: '09:00', programa: 'Palavra Puxa Palavra', apresentador: 'Prof. Ricardo Lima', descricao: 'Literatura, cordel e sarau com produções dos alunos.', categoria: 'CULTURA', cor: 'verde', ativo: 'SIM' },
  { dia: 'TERÇA', hora_inicio: '10:30', hora_fim: '11:30', programa: 'Playlist do Intervalo', apresentador: 'Grêmio Estudantil', descricao: 'Os pedidos musicais da semana, votados pelas turmas.', categoria: 'MÚSICA', cor: 'branco', ativo: 'SIM' },
  { dia: 'TERÇA', hora_inicio: '13:30', hora_fim: '14:30', programa: 'Esporte Total', apresentador: 'Turma do 8º B', descricao: 'Cobertura dos jogos internos e da olimpíada escolar.', categoria: 'ESPORTE', cor: 'azul', ativo: 'SIM' },
  { dia: 'TERÇA', hora_inicio: '15:00', hora_fim: '16:00', programa: 'Rádio Livre', apresentador: 'Alunos convidados', descricao: 'O microfone aberto para quem quiser apresentar.', categoria: 'ABERTO', cor: 'amarelo', ativo: 'SIM' },

  // ── QUARTA ───────────────────────────────────────────────────────
  { dia: 'QUARTA', hora_inicio: '07:00', hora_fim: '07:30', programa: 'Bom Dia, Escola', apresentador: 'Equipe Voz WebTV', descricao: 'Avisos da direção, aniversariantes e a trilha para começar o dia.', categoria: 'ABERTURA', cor: 'amarelo', ativo: 'SIM' },
  { dia: 'QUARTA', hora_inicio: '07:30', hora_fim: '08:30', programa: 'Manhã na Escola', apresentador: 'Turma do 9º A', descricao: 'Notícias da comunidade escolar com pauta produzida pelos alunos.', categoria: 'NOTÍCIAS', cor: 'branco', ativo: 'SIM' },
  { dia: 'QUARTA', hora_inicio: '09:30', hora_fim: '10:30', programa: 'Memória de MS', apresentador: 'Prof. Helena Souza', descricao: 'História, cultura pantaneira e as raízes de Mato Grosso do Sul.', categoria: 'CULTURA', cor: 'verde', ativo: 'SIM' },
  { dia: 'QUARTA', hora_inicio: '13:00', hora_fim: '14:00', programa: 'Tecnologia na Prática', apresentador: 'Clube de Robótica', descricao: 'Projetos, códigos e o que a turma está construindo no laboratório.', categoria: 'TECNOLOGIA', cor: 'azul', ativo: 'SIM' },
  { dia: 'QUARTA', hora_inicio: '15:00', hora_fim: '16:00', programa: 'Sinal de Saída', apresentador: 'DJ Convidado', descricao: 'A trilha para fechar o turno da tarde.', categoria: 'MÚSICA', cor: 'amarelo', ativo: 'SIM' },

  // ── QUINTA ───────────────────────────────────────────────────────
  { dia: 'QUINTA', hora_inicio: '07:00', hora_fim: '07:30', programa: 'Bom Dia, Escola', apresentador: 'Equipe Voz WebTV', descricao: 'Avisos da direção, aniversariantes e a trilha para começar o dia.', categoria: 'ABERTURA', cor: 'amarelo', ativo: 'SIM' },
  { dia: 'QUINTA', hora_inicio: '08:00', hora_fim: '09:00', programa: 'Estúdio Aberto', apresentador: 'Prof. Marina Alves', descricao: 'Entrevistas com professores, servidores e visitantes.', categoria: 'ENTREVISTA', cor: 'branco', ativo: 'SIM' },
  { dia: 'QUINTA', hora_inicio: '10:30', hora_fim: '11:30', programa: 'Playlist do Intervalo', apresentador: 'Grêmio Estudantil', descricao: 'Os pedidos musicais da semana, votados pelas turmas.', categoria: 'MÚSICA', cor: 'verde', ativo: 'SIM' },
  { dia: 'QUINTA', hora_inicio: '13:00', hora_fim: '14:30', programa: 'Debate Aberto', apresentador: 'Turma do 3º ano', descricao: 'Temas de atualidade discutidos com mediação dos professores.', categoria: 'DEBATE', cor: 'azul', ativo: 'SIM' },

  // ── SEXTA ────────────────────────────────────────────────────────
  { dia: 'SEXTA', hora_inicio: '07:00', hora_fim: '07:30', programa: 'Bom Dia, Escola', apresentador: 'Equipe Voz WebTV', descricao: 'Avisos da direção, aniversariantes e a trilha para começar o dia.', categoria: 'ABERTURA', cor: 'amarelo', ativo: 'SIM' },
  { dia: 'SEXTA', hora_inicio: '08:00', hora_fim: '09:30', programa: 'Sexta Sonora', apresentador: 'Coletivo de Música', descricao: 'Bandas da escola, artistas de MS e a playlist da semana.', categoria: 'MÚSICA', cor: 'verde', ativo: 'SIM' },
  { dia: 'SEXTA', hora_inicio: '10:30', hora_fim: '11:30', programa: 'Playlist do Intervalo', apresentador: 'Grêmio Estudantil', descricao: 'Os pedidos musicais da semana, votados pelas turmas.', categoria: 'MÚSICA', cor: 'branco', ativo: 'SIM' },
  { dia: 'SEXTA', hora_inicio: '13:00', hora_fim: '14:00', programa: 'Cine Voz', apresentador: 'Clube de Cinema', descricao: 'Resenhas, indicações e a produção audiovisual da turma.', categoria: 'CINEMA', cor: 'amarelo', ativo: 'SIM' },
  { dia: 'SEXTA', hora_inicio: '15:00', hora_fim: '16:30', programa: 'Sexta de Encerramento', apresentador: 'Equipe Voz WebTV', descricao: 'Retrospectiva da semana e a chamada do que vem por aí.', categoria: 'ESPECIAL', cor: 'azul', ativo: 'SIM' },

  // ── SABADO ───────────────────────────────────────────────────────
  { dia: 'SÁBADO', hora_inicio: '09:00', hora_fim: '11:00', programa: 'Especial de Sábado', apresentador: 'Alunos convidados', descricao: 'Programa temático produzido por uma turma diferente a cada semana.', categoria: 'ESPECIAL', cor: 'verde', ativo: 'SIM' },
  { dia: 'SÁBADO', hora_inicio: '14:00', hora_fim: '16:00', programa: 'Trilha Livre', apresentador: 'Automático', descricao: 'Seleção musical contínua, sem locução.', categoria: 'MÚSICA', cor: 'branco', ativo: 'SIM' },

  // ── DOMINGO ──────────────────────────────────────────────────────
  { dia: 'DOMINGO', hora_inicio: '10:00', hora_fim: '12:00', programa: 'Reprise da Semana', apresentador: 'Automático', descricao: 'Os melhores momentos dos programas de segunda a sexta.', categoria: 'REPRISE', cor: 'amarelo', ativo: 'SIM' },
];

export const NOTICIAS = [
  {
    data: '12/08/2026',
    titulo: 'Voz WebTV estreia transmissão ao vivo no intervalo',
    resumo: 'A partir desta semana, a rádio passa a transmitir ao vivo todos os dias durante o intervalo do turno matutino, com participação aberta às turmas.',
    imagem: '',
    link: '#',
    destaque: 'SIM',
    categoria: 'DESTAQUE',
    ativo: 'SIM',
  },
  {
    data: '08/08/2026',
    titulo: 'Inscrições abertas para a oficina de locução',
    resumo: 'Vinte vagas para alunos do 8º ano ao 3º ano. As aulas acontecem às quartas, no contraturno.',
    imagem: '',
    link: '#',
    destaque: 'NAO',
    categoria: 'OFICINA',
    ativo: 'SIM',
  },
  {
    data: '05/08/2026',
    titulo: 'Estúdio ganha nova mesa de som',
    resumo: 'O equipamento foi conquistado com o projeto aprovado junto à SED MS e já está em operação.',
    imagem: '',
    link: '#',
    destaque: 'NAO',
    categoria: 'ESTRUTURA',
    ativo: 'SIM',
  },
  {
    data: '01/08/2026',
    titulo: 'Podcast da escola chega ao 10º episódio',
    resumo: 'A série produzida pelo 2º ano já soma mais de mil reproduções nas plataformas.',
    imagem: '',
    link: '#',
    destaque: 'NAO',
    categoria: 'PODCAST',
    ativo: 'SIM',
  },
  {
    data: '28/07/2026',
    titulo: 'Cobertura completa dos Jogos Escolares',
    resumo: 'A equipe de esportes transmitiu as finais direto da quadra, com narração ao vivo.',
    imagem: '',
    link: '#',
    destaque: 'NAO',
    categoria: 'ESPORTE',
    ativo: 'SIM',
  },
];

export const EQUIPE = [
  { nome: 'Ana Beatriz', funcao: 'Locução', turma: '9º A', foto: '', ativo: 'SIM' },
  { nome: 'Lucas Ferreira', funcao: 'Operação de áudio', turma: '2º ano', foto: '', ativo: 'SIM' },
  { nome: 'Marina Alves', funcao: 'Coordenação', turma: 'Professora', foto: '', ativo: 'SIM' },
  { nome: 'Pedro Nunes', funcao: 'Pauta e reportagem', turma: '8º B', foto: '', ativo: 'SIM' },
];

export const CONFIG_SITE = {
  marquee_texto:
    'AO VIVO DA ESCOLA • A RÁDIO FEITA POR ALUNOS • VOZ WEBTV • SINTONIZE AGORA • NOTÍCIA, MÚSICA E CULTURA',
  marquee_rodape:
    'VOZ WEBTV • SED MATO GROSSO DO SUL • EDUCAÇÃO QUE SE ESCUTA • PARTICIPE VOCÊ TAMBÉM',
  aviso_topo: 'Transmissão ao vivo de segunda a sexta, das 7h às 16h',
};

/** Estado exibido pelo player enquanto o AzuraCast nao esta conectado. */
export const NOW_PLAYING_DEMO = {
  programa: 'Playlist do Intervalo',
  apresentador: 'Grêmio Estudantil',
  musica: 'Rádio Escolar — Trilha de demonstração',
};
