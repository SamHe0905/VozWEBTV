# Voz WebTV — Arquitetura e Escopo

> Documento mestre de arquitetura. Última atualização: 15/08/2026.
> Documentos irmãos: [`visual.md`](visual.md) (design system) e [`memory.md`](memory.md) (estado atual e próximos passos).

---

## 1. Escopo

**Voz WebTV** é o site institucional da web rádio / web TV escolar. É a vitrine pública da rádio: onde o ouvinte escuta a transmissão ao vivo, assiste às transmissões de vídeo, descobre a grade de programação e lê as notícias da escola.

### O que o site É
- Um **site estático** (sem servidor, sem banco de dados, sem backend).
- Uma **página única principal** (`index.html`) com âncoras de navegação, mais páginas internas simples conforme a necessidade.
- Um produto de **alta performance**: alvo de LCP < 1,5s em 4G e nota Lighthouse ≥ 95 em Performance/Acessibilidade/SEO.
- Editável por **professores e alunos sem conhecimento técnico**, via Google Sheets.

### O que o site NÃO é (fora de escopo nesta fase)
- Não hospeda o streaming de áudio (isso é responsabilidade do AzuraCast).
- Não tem login, área restrita, comentários ou cadastro de usuários.
- Não tem CMS próprio, painel administrativo em código, nem banco de dados.
- Não tem carrinho, pagamentos ou formulários que gravem dados no servidor.
- Não usa framework de front-end (React, Vue, Svelte) nem bundler pesado.

### Público-alvo
1. **Alunos** — consumo majoritariamente mobile, conexões instáveis. Mobile-first é obrigatório.
2. **Professores e equipe pedagógica** — desktop, consulta da grade e das notícias.
3. **Comunidade escolar (famílias) e SED MS** — vitrine institucional do projeto.

---

## 2. Stack Técnica

| Camada | Tecnologia | Observação |
|---|---|---|
| Marcação | **HTML5 semântico** | `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`. Sem `div soup`. |
| Estilo | **Tailwind CSS** | Via Tailwind CLI, gerando um `dist/styles.css` minificado e versionado. |
| Comportamento | **JavaScript puro (ES6+)** | Módulos ES nativos (`<script type="module">`). Zero framework. |
| Dados / CMS | **Google Sheets + PapaParse** | Planilha publicada como CSV; parse no navegador. |
| Áudio ao vivo | **AzuraCast** | Stream MP3/AAC consumido por `<audio>` nativo + API pública de "now playing". |
| Vídeo ao vivo | **YouTube (iframe)** | Embed com carregamento sob demanda (facade / click-to-load). |
| Hospedagem | **Vercel** (plano gratuito) | Deploy estático, CDN global, HTTPS automático. |
| Versionamento | **Git + GitHub** | Deploy contínuo conectado ao Vercel. |

### Decisões técnicas travadas
- **Tailwind via CLI, não via CDN.** O CDN (`cdn.tailwindcss.com`) compila no navegador e destrói o LCP. O build gera apenas o CSS realmente usado (~10 KB gzip).
- **Sem jQuery, sem Bootstrap, sem Alpine.** Toda interatividade em JS puro.
- **Uma única dependência de runtime: PapaParse** (~7 KB gzip), servida localmente em `/assets/js/vendor/`, não por CDN de terceiros.
- **Fontes self-hosted** em `woff2` com `font-display: swap` e `preload` das duas famílias críticas. Evita a latência do Google Fonts e mantém a privacidade dos alunos.
- **Nenhum cookie, nenhum analytics de terceiros por padrão.** Se for necessário medir audiência, avaliar Vercel Analytics (sem cookies).

---

## 3. Estrutura de Arquivos

```
Radio/
├── index.html                  # Página principal (player, WebTV, grade, notícias)
├── programacao.html            # Grade completa da semana (opcional, Fase 3)
├── sobre.html                  # Quem somos / equipe / projeto (opcional, Fase 3)
├── project.md                  # Este documento
├── visual.md                   # Design system
├── memory.md                   # Estado atual e próximos passos
├── vercel.json                 # Headers de cache e segurança
├── package.json                # Scripts de build do Tailwind
├── tailwind.config.js          # Tokens do design system (cores, fontes, sombras)
├── Referencias/                # Imagens de referência visual (não vai para produção)
├── src/
│   └── input.css               # @tailwind base/components/utilities + camadas custom
└── assets/
    ├── css/
    │   └── styles.css          # CSS compilado (gerado pelo build, versionado)
    ├── js/
    │   ├── main.js             # Bootstrap: inicializa todos os módulos
    │   ├── player.js           # Controle do <audio>, play/pause, volume, now playing
    │   ├── schedule.js         # Fetch + parse da grade (PapaParse) e render dos cards
    │   ├── news.js             # Fetch + parse das notícias/avisos
    │   ├── webtv.js            # Facade do YouTube (click-to-load)
    │   ├── config.js           # URLs das planilhas, do stream e da API AzuraCast
    │   └── vendor/
    │       └── papaparse.min.js
    ├── fonts/                  # .woff2 self-hosted
    └── img/                    # Logo, favicons, og-image, placeholders
```

---

## 4. Funcionalidades

### 4.1 Player de Áudio ao Vivo (AzuraCast)

O elemento mais importante da página. Fica **fixo/destacado logo abaixo do cabeçalho** e é a primeira coisa que o usuário vê.

**Requisitos funcionais:**
- Elemento `<audio>` nativo com `preload="none"` — nunca inicia sozinho (autoplay é bloqueado pelos navegadores e é hostil ao usuário).
- Botão **PLAY/PAUSE** gigante, quadrado, alto contraste. É o maior alvo de toque da página (mínimo 64×64px).
- Estados visuais explícitos: `parado` → `carregando` (buffering) → `no ar` → `erro`.
- Indicador **"AO VIVO"** com ponto pulsante quando tocando.
- Controle de volume (slider) e botão mute. No mobile, o volume é do sistema — esconder o slider abaixo de `md`.
- **Now Playing:** consome a API pública do AzuraCast (`/api/nowplaying/{station}`) a cada 15 segundos, exibindo música/programa atual e locutor. Se a API falhar, faz *fallback* silencioso para o texto do programa vindo da grade (Google Sheets) calculado pelo horário atual.
- **Persistência de sessão:** salva volume e estado de mute em `localStorage`. Não retoma a reprodução automaticamente ao recarregar.
- **Media Session API:** define título, artista e artwork para aparecer na tela de bloqueio / notificação do celular. Grande ganho de percepção de qualidade, custo baixo.
- **Resiliência:** se o stream cair, exibe "Fora do ar — voltamos já" e tenta reconectar com *backoff* (3s, 6s, 12s, máx. 30s).

**Configuração** (`assets/js/config.js`):
```js
export const AZURACAST = {
  streamUrl:   'https://<host>/listen/<station>/radio.mp3',
  nowPlaying:  'https://<host>/api/nowplaying/<station>',
  pollMs:      15000,
};
```

### 4.2 Área de WebTV (YouTube)

Seção dedicada à transmissão de vídeo, ao vivo ou gravada.

**Requisitos funcionais:**
- **Facade pattern obrigatório:** por padrão renderiza apenas a thumbnail + botão de play sobreposto. O `<iframe>` do YouTube só é injetado no clique. Isso evita ~1 MB de JS de terceiros no carregamento inicial.
- Usa `youtube-nocookie.com` como domínio do embed (privacidade dos alunos).
- Container com `aspect-ratio: 16/9` para eliminar *layout shift* (CLS = 0).
- O ID do vídeo/live vem da planilha (aba `config`), permitindo trocar a transmissão sem tocar no código.
- Estado "sem transmissão": bloco sólido com a mensagem "Sem transmissão no momento — confira a programação" e link para a grade.

### 4.3 Grade de Programação Dinâmica (Google Sheets + PapaParse)

O coração editorial do site. Professores atualizam a planilha; o site reflete em segundos.

**Fluxo de dados:**
```
Google Sheets  →  Arquivo > Compartilhar > Publicar na web (CSV)
              →  fetch() no navegador
              →  Papa.parse(csv, { header: true })
              →  normalização + validação
              →  render dos cards "post-it"
              →  cache em sessionStorage (TTL 5 min)
```

**Requisitos funcionais:**
- Filtro por **dia da semana**, com o dia atual pré-selecionado.
- Destaque visual do **programa que está no ar agora** (comparando `hora_inicio`/`hora_fim` com o relógio do usuário).
- Ordenação automática por horário.
- Renderização como cards estilo **post-it levemente inclinados** (ver `visual.md`).
- Estados de UI obrigatórios: `carregando` (skeleton), `vazio`, `erro`.
- **Fallback:** se o fetch falhar, exibe uma grade estática embutida no HTML (dados da última atualização conhecida), nunca uma tela em branco.
- Linhas com coluna `ativo` diferente de `SIM` são ignoradas — permite ao professor "arquivar" um programa sem apagá-lo.

### 4.4 Notícias e Avisos

Mesma mecânica da grade, em outra aba da planilha. Cards editoriais com data, título, resumo, imagem opcional e link.

### 4.5 Letreiro Rolante (Marquee)

Faixa de texto em movimento contínuo, separando o topo do conteúdo e usada novamente antes do rodapé. O conteúdo vem da aba `config` da planilha (ex.: "NO AR AGORA • RÁDIO ESCOLAR • VOZ WEBTV • SINTONIZE"). Implementação em CSS puro (`@keyframes translateX`), com duplicação do conteúdo para o loop ser contínuo, e **pausa em `prefers-reduced-motion`**.

---

## 5. Modelo de Dados (Google Sheets)

Uma planilha, quatro abas. Cabeçalhos na primeira linha, exatamente com estes nomes (minúsculos, sem acento).

### Aba `programacao`
| Coluna | Tipo | Exemplo | Obrigatório |
|---|---|---|---|
| `dia` | texto | `SEGUNDA` | sim |
| `hora_inicio` | `HH:MM` | `07:30` | sim |
| `hora_fim` | `HH:MM` | `08:30` | sim |
| `programa` | texto | `MANHÃ NA ESCOLA` | sim |
| `tipo` | `AO VIVO` / `AUTOMATICO` | `AO VIVO` | sim |
| `apresentador` | texto | `Turma do 9º A` | só se `AO VIVO` |
| `descricao` | texto | `Notícias e música para começar o dia.` | não |
| `categoria` | texto | `NOTÍCIAS` | não |
| `cor` | `verde` / `azul` / `amarelo` / `branco` | `amarelo` | não |
| `ativo` | `SIM` / `NAO` | `SIM` | sim |

#### Operação 24 horas

A rádio fica **no ar 24h por dia**, mas **não com locutor 24h**. A coluna `tipo`
separa os dois regimes:

- **`AO VIVO`** — tem locutor no estúdio. `apresentador` preenchido. O site
  mostra o nome do programa e de quem apresenta.
- **`AUTOMATICO`** — só música, sem locução, alimentada pelo script de playlist
  do AzuraCast. `apresentador` vazio. O site mostra "Só música · sem locutor" e,
  quando o AzuraCast estiver conectado, o nome da faixa que está tocando.

Na grade de demonstração isso dá **~14% ao vivo e ~86% automático** — 3 a 4 janelas
curtas de locução por dia letivo, ancoradas na rotina da escola (entrada, intervalo,
início da tarde, saída), e um bloco noturno em alguns dias.

**Regras da cobertura 24h:**
- A grade de cada dia deve cobrir de `00:00` a `00:00` **sem buraco**: o `hora_fim`
  de um bloco é igual ao `hora_inicio` do seguinte.
- O último bloco do dia termina em `00:00`.
- Blocos podem **cruzar a meia-noite** (ex.: `SÁBADO 23:00–01:00`). O site entende
  isso: às `00:30` de domingo esse bloco ainda aparece como no ar.
- Se houver **sobreposição**, vence o bloco que começou por último.
- `schedule.js` roda `validarGrade()` no carregamento e escreve no console do
  navegador todo buraco e toda sobreposição encontrados, dia a dia. Nada quebra —
  é um aviso para quem cuida da planilha.

### Aba `noticias`
`data` (`DD/MM/AAAA`), `titulo`, `resumo`, `imagem` (URL), `link`, `destaque` (`SIM`/`NAO`), `ativo`.

### Aba `equipe`
`nome`, `funcao`, `turma`, `foto` (URL), `ativo`.

### Aba `config`
Formato chave/valor (`chave`, `valor`) para conteúdo global editável:
`marquee_texto`, `youtube_id`, `youtube_ativo`, `aviso_topo`, `instagram_url`, `email_contato`.

### Como o site lê a planilha
Publicar via **Arquivo → Compartilhar → Publicar na web**, escolhendo a aba e o formato **CSV**. A URL resultante tem o formato:
```
https://docs.google.com/spreadsheets/d/e/<TOKEN>/pub?gid=<GID_DA_ABA>&single=true&output=csv
```
Essa URL é pública e somente leitura — a planilha de edição continua privada. Guardar cada URL em `assets/js/config.js`.

> **Regra de segurança:** nenhum dado pessoal de aluno (endereço, telefone, CPF, matrícula) entra na planilha. Ela é pública. Apenas nome, função e turma.

---

## 6. Performance

Metas mensuráveis (Lighthouse mobile, 4G simulado):

| Métrica | Alvo |
|---|---|
| LCP | < 1,5s |
| CLS | < 0,05 |
| INP | < 200ms |
| Peso da primeira visita | < 250 KB |
| Performance / A11y / SEO | ≥ 95 |

**Táticas:**
- CSS crítico inline no `<head>`; o restante do CSS carregado normalmente (o arquivo é pequeno o bastante para não precisar de split).
- `preload` do `woff2` das duas fontes principais; `font-display: swap`.
- Todas as imagens em **WebP**, com `width`/`height` explícitos e `loading="lazy"` (exceto a imagem do herói).
- YouTube via facade (item 4.2). Nenhum iframe no HTML inicial.
- `fetch` das planilhas é **não-bloqueante**: o layout renderiza com skeletons e é preenchido em seguida.
- Cache de resposta das planilhas em `sessionStorage` com TTL de 5 minutos.
- Zero web fonts de terceiros, zero tag manager, zero widget social.

---

## 7. SEO e Compartilhamento

- `<title>` e `<meta name="description">` por página.
- Open Graph + Twitter Card completos, com imagem `1200×630` (`assets/img/og-image.png`).
- **JSON-LD**: `RadioStation` + `Organization` no `index.html`; `BroadcastEvent` para os programas da grade (opcional, Fase 4).
- `sitemap.xml` e `robots.txt` na raiz.
- URLs limpas, sem hash routing.
- `lang="pt-BR"` no `<html>`.

---

## 8. Acessibilidade (obrigatório — projeto público de escola estadual)

- Contraste mínimo **WCAG AA (4.5:1)** em todo texto. Amarelo **nunca** é cor de texto sobre fundo claro (ver `visual.md`).
- Navegação completa por teclado; foco visível com anel grosso (não usar `outline: none`).
- O botão de play do player é um `<button>` real com `aria-pressed` e `aria-label` descritivo.
- Marquee respeita `prefers-reduced-motion: reduce` (para de animar).
- Landmarks ARIA e um "pular para o conteúdo" no início do `<body>`.
- Todas as imagens com `alt` significativo; imagens decorativas com `alt=""`.
- Atualizações de "now playing" em uma região `aria-live="polite"`.

---

## 9. Deploy (Vercel)

1. Repositório no GitHub → importar no Vercel como **Other / Static**.
2. Build Command: `npm run build` · Output Directory: `.` (raiz).
3. `vercel.json` define:
   - Cache longo e imutável para `/assets/*` (fontes, imagens, JS).
   - `Cache-Control: no-cache` para os `.html`.
   - Headers de segurança: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`.
4. Deploy automático a cada push na branch `main`; *preview deploys* nas demais branches.

**Scripts (`package.json`):**
```json
{
  "scripts": {
    "dev":   "tailwindcss -i ./src/input.css -o ./assets/css/styles.css --watch",
    "build": "tailwindcss -i ./src/input.css -o ./assets/css/styles.css --minify"
  }
}
```

---

## 10. Roadmap

| Fase | Entrega | Status |
|---|---|---|
| **1** | Arquitetura, design system e documentação (`project.md`, `visual.md`, `memory.md`) | ✅ concluída |
| **2** | `index.html` estático completo com o design system aplicado (dados mockados) | ✅ concluída |
| **3** | Integração Google Sheets + PapaParse (grade, notícias, config) | ⬜ |
| **4** | Player AzuraCast funcional (now playing, Media Session, reconexão) | ⬜ |
| **5** | WebTV com facade do YouTube | ⬜ |
| **6** | Otimização, a11y, SEO, deploy no Vercel e domínio | ⬜ |

---

## 11. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Google Sheets fora do ar ou URL revogada | Grade some | Fallback estático embutido no HTML |
| Um professor renomeia uma coluna da planilha | Parse quebra | Validação por nome de coluna + log claro no console + fallback |
| Stream do AzuraCast cai | Player inutilizável | Estado de erro explícito + reconexão com backoff |
| CORS do Google Sheets | Fetch bloqueado | A URL `pub?output=csv` já envia `Access-Control-Allow-Origin: *`; validar na Fase 3 |
| Fuso horário do usuário difere | "No ar agora" errado | Fixar cálculo em `America/Campo_Grande` (UTC−4) via `Intl` |
