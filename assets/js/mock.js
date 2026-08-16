/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Dados de demonstracao
   ───────────────────────────────────────────────────────────────────
   GERADO AUTOMATICAMENTE. Os objetos usam EXATAMENTE os mesmos nomes de
   campo das colunas da planilha do Google (ver project.md secao 5) e o
   mesmo conteudo de `planilha-MODELO-inicial.xlsx`. Quando a integracao com o
   PapaParse entrar, o formato de saida sera identico e nenhum codigo de
   renderizacao precisara mudar.

   A radio opera 24 HORAS, mas NAO com locutor 24 horas: a grade cobre
   00:00 as 00:00 em todos os sete dias, sem buraco, e a coluna `tipo`
   separa os dois regimes:

     AO VIVO     -> tem locutor no estudio, campo `apresentador` preenchido
     AUTOMATICO  -> so musica, sem locucao, `apresentador` vazio

   A maior parte do dia e' AUTOMATICO. O locutor entra apenas nos horarios
   marcados como AO VIVO.
   ═══════════════════════════════════════════════════════════════════ */

export const PROGRAMACAO = [
  // ── SEGUNDA ─────────────────────────────────────────────────
  { dia: "SEGUNDA", hora_inicio: "00:00", hora_fim: "06:00", programa: "Madrugada Sonora", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "06:00", hora_fim: "07:00", programa: "Primeira Chamada", tipo: "AUTOMATICO", apresentador: "", descricao: "A trilha que acorda a escola.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "07:00", hora_fim: "07:30", programa: "Bom Dia, Escola", tipo: "AO VIVO", apresentador: "Equipe Voz WebTV", descricao: "Avisos da direção, aniversariantes e a trilha para começar o dia.", categoria: "ABERTURA", cor: "amarelo", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "07:30", hora_fim: "09:30", programa: "Manhã Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as primeiras aulas.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "09:30", hora_fim: "10:30", programa: "Manhã na Escola", tipo: "AO VIVO", apresentador: "Turma do 9º A", descricao: "Notícias da comunidade escolar com pauta produzida pelos alunos.", categoria: "NOTÍCIAS", cor: "verde", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "10:30", hora_fim: "13:00", programa: "Trilha da Manhã", tipo: "AUTOMATICO", apresentador: "", descricao: "Música até o fim do turno matutino.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "13:00", hora_fim: "14:00", programa: "Ciência em 5 Minutos", tipo: "AO VIVO", apresentador: "Clube de Ciências", descricao: "Experimentos, curiosidades e o que caiu no vestibular.", categoria: "EDUCAÇÃO", cor: "azul", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "14:00", hora_fim: "15:00", programa: "Tarde Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as aulas da tarde.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "15:00", hora_fim: "16:00", programa: "Sinal de Saída", tipo: "AO VIVO", apresentador: "DJ da Semana", descricao: "A trilha para fechar o turno da tarde.", categoria: "MÚSICA", cor: "amarelo", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "16:00", hora_fim: "19:00", programa: "Tarde Livre", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "19:00", hora_fim: "20:00", programa: "Serão Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para o período noturno, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEGUNDA", hora_inicio: "20:00", hora_fim: "00:00", programa: "Trilha da Noite", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para a madrugada, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  // ── TERÇA ─────────────────────────────────────────────────
  { dia: "TERÇA", hora_inicio: "00:00", hora_fim: "06:00", programa: "Madrugada Sonora", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "06:00", hora_fim: "07:00", programa: "Primeira Chamada", tipo: "AUTOMATICO", apresentador: "", descricao: "A trilha que acorda a escola.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "07:00", hora_fim: "07:30", programa: "Bom Dia, Escola", tipo: "AO VIVO", apresentador: "Equipe Voz WebTV", descricao: "Avisos da direção, aniversariantes e a trilha para começar o dia.", categoria: "ABERTURA", cor: "amarelo", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "07:30", hora_fim: "09:30", programa: "Manhã Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as primeiras aulas.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "09:30", hora_fim: "10:30", programa: "Playlist do Intervalo", tipo: "AO VIVO", apresentador: "Grêmio Estudantil", descricao: "Os pedidos musicais da semana, votados pelas turmas.", categoria: "MÚSICA", cor: "amarelo", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "10:30", hora_fim: "13:00", programa: "Trilha da Manhã", tipo: "AUTOMATICO", apresentador: "", descricao: "Música até o fim do turno matutino.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "13:00", hora_fim: "14:00", programa: "Esporte Total", tipo: "AO VIVO", apresentador: "Turma do 8º B", descricao: "Cobertura dos jogos internos e da olimpíada escolar.", categoria: "ESPORTE", cor: "verde", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "14:00", hora_fim: "15:00", programa: "Tarde Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as aulas da tarde.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "15:00", hora_fim: "16:00", programa: "Sinal de Saída", tipo: "AO VIVO", apresentador: "DJ da Semana", descricao: "A trilha para fechar o turno da tarde.", categoria: "MÚSICA", cor: "amarelo", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "16:00", hora_fim: "19:00", programa: "Tarde Livre", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "19:00", hora_fim: "20:00", programa: "Serão Cultural", tipo: "AO VIVO", apresentador: "Turmas da EJA", descricao: "Programa noturno produzido pelos estudantes da EJA.", categoria: "CULTURA", cor: "azul", ativo: "SIM" },
  { dia: "TERÇA", hora_inicio: "20:00", hora_fim: "00:00", programa: "Trilha da Noite", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para a madrugada, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  // ── QUARTA ─────────────────────────────────────────────────
  { dia: "QUARTA", hora_inicio: "00:00", hora_fim: "06:00", programa: "Madrugada Sonora", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "06:00", hora_fim: "07:00", programa: "Primeira Chamada", tipo: "AUTOMATICO", apresentador: "", descricao: "A trilha que acorda a escola.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "07:00", hora_fim: "07:30", programa: "Bom Dia, Escola", tipo: "AO VIVO", apresentador: "Equipe Voz WebTV", descricao: "Avisos da direção, aniversariantes e a trilha para começar o dia.", categoria: "ABERTURA", cor: "amarelo", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "07:30", hora_fim: "09:30", programa: "Manhã Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as primeiras aulas.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "09:30", hora_fim: "10:30", programa: "Estúdio Aberto", tipo: "AO VIVO", apresentador: "Prof. Marina Alves", descricao: "Entrevistas com professores, servidores e visitantes da escola.", categoria: "ENTREVISTA", cor: "verde", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "10:30", hora_fim: "13:00", programa: "Trilha da Manhã", tipo: "AUTOMATICO", apresentador: "", descricao: "Música até o fim do turno matutino.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "13:00", hora_fim: "14:00", programa: "Tecnologia na Prática", tipo: "AO VIVO", apresentador: "Clube de Robótica", descricao: "Projetos, códigos e o que a turma constrói no laboratório.", categoria: "TECNOLOGIA", cor: "azul", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "14:00", hora_fim: "15:00", programa: "Tarde Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as aulas da tarde.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "15:00", hora_fim: "16:00", programa: "Sinal de Saída", tipo: "AO VIVO", apresentador: "DJ da Semana", descricao: "A trilha para fechar o turno da tarde.", categoria: "MÚSICA", cor: "amarelo", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "16:00", hora_fim: "19:00", programa: "Tarde Livre", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "19:00", hora_fim: "20:00", programa: "Serão Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para o período noturno, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUARTA", hora_inicio: "20:00", hora_fim: "00:00", programa: "Trilha da Noite", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para a madrugada, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  // ── QUINTA ─────────────────────────────────────────────────
  { dia: "QUINTA", hora_inicio: "00:00", hora_fim: "06:00", programa: "Madrugada Sonora", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "06:00", hora_fim: "07:00", programa: "Primeira Chamada", tipo: "AUTOMATICO", apresentador: "", descricao: "A trilha que acorda a escola.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "07:00", hora_fim: "07:30", programa: "Bom Dia, Escola", tipo: "AO VIVO", apresentador: "Equipe Voz WebTV", descricao: "Avisos da direção, aniversariantes e a trilha para começar o dia.", categoria: "ABERTURA", cor: "amarelo", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "07:30", hora_fim: "09:30", programa: "Manhã Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as primeiras aulas.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "09:30", hora_fim: "10:30", programa: "Manhã na Escola", tipo: "AO VIVO", apresentador: "Turma do 9º A", descricao: "Notícias da comunidade escolar com pauta produzida pelos alunos.", categoria: "NOTÍCIAS", cor: "verde", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "10:30", hora_fim: "13:00", programa: "Trilha da Manhã", tipo: "AUTOMATICO", apresentador: "", descricao: "Música até o fim do turno matutino.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "13:00", hora_fim: "14:00", programa: "Jornal da Voz", tipo: "AO VIVO", apresentador: "Equipe de Reportagem", descricao: "A edição da semana, transmitida também pela WebTV.", categoria: "JORNALISMO", cor: "azul", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "14:00", hora_fim: "15:00", programa: "Tarde Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as aulas da tarde.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "15:00", hora_fim: "16:00", programa: "Sinal de Saída", tipo: "AO VIVO", apresentador: "DJ da Semana", descricao: "A trilha para fechar o turno da tarde.", categoria: "MÚSICA", cor: "amarelo", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "16:00", hora_fim: "19:00", programa: "Tarde Livre", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "19:00", hora_fim: "20:00", programa: "Serão Cultural", tipo: "AO VIVO", apresentador: "Turmas da EJA", descricao: "Programa noturno produzido pelos estudantes da EJA.", categoria: "CULTURA", cor: "verde", ativo: "SIM" },
  { dia: "QUINTA", hora_inicio: "20:00", hora_fim: "00:00", programa: "Trilha da Noite", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para a madrugada, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  // ── SEXTA ─────────────────────────────────────────────────
  { dia: "SEXTA", hora_inicio: "00:00", hora_fim: "06:00", programa: "Madrugada Sonora", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "06:00", hora_fim: "07:00", programa: "Primeira Chamada", tipo: "AUTOMATICO", apresentador: "", descricao: "A trilha que acorda a escola.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "07:00", hora_fim: "07:30", programa: "Bom Dia, Escola", tipo: "AO VIVO", apresentador: "Equipe Voz WebTV", descricao: "Avisos da direção, aniversariantes e a trilha para começar o dia.", categoria: "ABERTURA", cor: "amarelo", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "07:30", hora_fim: "09:30", programa: "Manhã Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as primeiras aulas.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "09:30", hora_fim: "10:30", programa: "Sexta Sonora", tipo: "AO VIVO", apresentador: "Coletivo de Música", descricao: "Bandas da escola, artistas de MS e a playlist da semana.", categoria: "MÚSICA", cor: "amarelo", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "10:30", hora_fim: "13:00", programa: "Trilha da Manhã", tipo: "AUTOMATICO", apresentador: "", descricao: "Música até o fim do turno matutino.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "13:00", hora_fim: "14:00", programa: "Cine Voz", tipo: "AO VIVO", apresentador: "Clube de Cinema", descricao: "Resenhas, indicações e a produção audiovisual da turma.", categoria: "CINEMA", cor: "verde", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "14:00", hora_fim: "15:00", programa: "Tarde Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música durante as aulas da tarde.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "15:00", hora_fim: "16:00", programa: "Sinal de Saída", tipo: "AO VIVO", apresentador: "DJ da Semana", descricao: "A trilha para fechar o turno da tarde.", categoria: "MÚSICA", cor: "amarelo", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "16:00", hora_fim: "19:00", programa: "Tarde Livre", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "19:00", hora_fim: "20:00", programa: "Serão Musical", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para o período noturno, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SEXTA", hora_inicio: "20:00", hora_fim: "00:00", programa: "Trilha da Noite", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para a madrugada, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  // ── SÁBADO ─────────────────────────────────────────────────
  { dia: "SÁBADO", hora_inicio: "00:00", hora_fim: "09:00", programa: "Madrugada Sonora", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SÁBADO", hora_inicio: "09:00", hora_fim: "11:00", programa: "Especial de Sábado", tipo: "AO VIVO", apresentador: "Alunos convidados", descricao: "Programa temático produzido por uma turma diferente a cada semana.", categoria: "ESPECIAL", cor: "verde", ativo: "SIM" },
  { dia: "SÁBADO", hora_inicio: "11:00", hora_fim: "16:00", programa: "Trilha Livre", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "SÁBADO", hora_inicio: "16:00", hora_fim: "17:00", programa: "Oficina no Ar", tipo: "AO VIVO", apresentador: "Oficina de Locução", descricao: "Os alunos da oficina assumem os microfones.", categoria: "OFICINA", cor: "amarelo", ativo: "SIM" },
  { dia: "SÁBADO", hora_inicio: "17:00", hora_fim: "00:00", programa: "Sábado Sonoro", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para a noite de sábado, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  // ── DOMINGO ─────────────────────────────────────────────────
  { dia: "DOMINGO", hora_inicio: "00:00", hora_fim: "10:00", programa: "Madrugada Sonora", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "DOMINGO", hora_inicio: "10:00", hora_fim: "12:00", programa: "Reprise da Semana", tipo: "AUTOMATICO", apresentador: "", descricao: "Os melhores momentos dos programas, reprisados automaticamente.", categoria: "REPRISE", cor: "amarelo", ativo: "SIM" },
  { dia: "DOMINGO", hora_inicio: "12:00", hora_fim: "18:00", programa: "Trilha Livre", tipo: "AUTOMATICO", apresentador: "", descricao: "Seleção musical contínua, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
  { dia: "DOMINGO", hora_inicio: "18:00", hora_fim: "19:00", programa: "Semana que Vem", tipo: "AO VIVO", apresentador: "Equipe Voz WebTV", descricao: "O que está programado para os próximos dias.", categoria: "ESPECIAL", cor: "verde", ativo: "SIM" },
  { dia: "DOMINGO", hora_inicio: "19:00", hora_fim: "00:00", programa: "Trilha da Noite", tipo: "AUTOMATICO", apresentador: "", descricao: "Música para a madrugada, sem locução.", categoria: "MÚSICA", cor: "branco", ativo: "SIM" },
];

export const NOTICIAS = [
  { data: "12/08/2026", titulo: "Voz WebTV passa a transmitir 24 horas por dia", resumo: "A rádio agora fica no ar sem interrupção: programas ao vivo durante o período letivo e seleção musical automática na madrugada e nos intervalos.", imagem: "", link: "#", destaque: "SIM", categoria: "DESTAQUE", ativo: "SIM" },
  { data: "08/08/2026", titulo: "Inscrições abertas para a oficina de locução", resumo: "Vinte vagas para alunos do 8º ano ao 3º ano. As aulas acontecem às quartas, no contraturno.", imagem: "", link: "#", destaque: "NAO", categoria: "OFICINA", ativo: "SIM" },
  { data: "05/08/2026", titulo: "Estúdio ganha nova mesa de som", resumo: "O equipamento foi conquistado com o projeto aprovado pela direção e já está em operação.", imagem: "", link: "#", destaque: "NAO", categoria: "ESTRUTURA", ativo: "SIM" },
  { data: "01/08/2026", titulo: "Podcast da escola chega ao 10º episódio", resumo: "A série produzida pelo 2º ano já soma mais de mil reproduções nas plataformas.", imagem: "", link: "#", destaque: "NAO", categoria: "PODCAST", ativo: "SIM" },
  { data: "28/07/2026", titulo: "Cobertura completa dos Jogos Escolares", resumo: "A equipe de esportes transmitiu as finais direto da quadra, com narração ao vivo.", imagem: "", link: "#", destaque: "NAO", categoria: "ESPORTE", ativo: "SIM" },
];

export const EQUIPE = [
  { nome: "Ana Beatriz", funcao: "Locução", turma: "9º A", foto: "", ativo: "SIM" },
  { nome: "Lucas Ferreira", funcao: "Operação de áudio", turma: "2º ano", foto: "", ativo: "SIM" },
  { nome: "Marina Alves", funcao: "Coordenação", turma: "Professora", foto: "", ativo: "SIM" },
  { nome: "Pedro Nunes", funcao: "Pauta e reportagem", turma: "8º B", foto: "", ativo: "SIM" },
];

export const CONFIG_SITE = {
  marquee_texto: "NO AR 24 HORAS • A RÁDIO FEITA POR ALUNOS • VOZ WEBTV • SINTONIZE AGORA • NOTÍCIA, MÚSICA E CULTURA",
  marquee_rodape: "VOZ WEBTV • ESCOLA ESTADUAL TEOTÔNIO VILELA • EDUCAÇÃO QUE SE ESCUTA • PARTICIPE VOCÊ TAMBÉM",
  aviso_topo: "No ar 24 horas por dia, todos os dias",
};

/** Estado exibido pelo player enquanto o AzuraCast nao esta conectado. */
export const NOW_PLAYING_DEMO = {
  programa: 'Voz WebTV',
  apresentador: 'Programação musical',
  musica: 'Trilha de demonstração',
};
