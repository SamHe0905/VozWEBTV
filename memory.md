# Voz WebTV — Contexto e Estado Atual

> Memória viva do projeto. **Atualizar ao final de cada sessão de trabalho.**
> Documentos irmãos: [`project.md`](project.md) (arquitetura) · [`visual.md`](visual.md) (design system).

---

## Estado atual

**📍 Fase 2 — `index.html` com o design system aplicado + grade 24h.**
Data: 15/08/2026 · Status: **concluída e pronta para deploy**.

### Como a rádio opera (decisão do dia 15/08)
A rádio fica **no ar 24h**, mas **não tem locutor 24h**. A trilha é música
automática (script que alimenta o AzuraCast); o locutor entra apenas nas janelas
marcadas na grade. A coluna **`tipo`** (`AO VIVO` / `AUTOMATICO`) na planilha é a
fonte da verdade dessa distinção — **não** deduzir pelo campo `apresentador`.
Proporção na grade atual: **14% ao vivo, 86% automático**.

O site roda inteiro com dados de demonstração, sem depender de nenhuma API.
`MODO_DEMO = true` em `assets/js/config.js` desliga toda chamada de rede.

### O que existe hoje no repositório
```
Radio/
├── index.html              ✅ página completa, todas as seções
├── package.json            ✅ scripts dev/build do Tailwind
├── tailwind.config.js      ✅ tokens do design system
├── vercel.json             ✅ headers de cache e segurança
├── robots.txt / sitemap.xml ✅
├── .gitignore              ✅
├── project.md / visual.md / memory.md
├── src/input.css           ✅ camadas base/components/utilities
└── assets/
    ├── css/styles.css      ✅ compilado (30,5 KB · ~7 KB gzip)
    ├── css/fonts.css       ✅ @font-face self-hosted
    ├── fonts/*.woff2       ✅ 6 arquivos (Archivo, Archivo Black, JetBrains Mono)
    ├── img/favicon.svg     ✅
    ├── img/og-image.png    ✅ 1200×630
    └── js/
        ├── config.js       ✅ ÚNICO arquivo a editar quando as APIs chegarem
        ├── mock.js         ✅ dados de demonstração no formato exato da planilha
        ├── main.js         ✅ bootstrap, marquee, menu mobile
        ├── player.js       ✅ máquina de estados completa (modo vitrine)
        ├── schedule.js     ✅ grade, filtro de dias, "no ar agora", próximo programa
        ├── news.js         ✅ notícias + equipe
        └── webtv.js        ✅ facade do YouTube + estado "sem transmissão"
```

### Verificações feitas nesta sessão (medidas, não estimadas)

| Verificação | Resultado |
|---|---|
| Contraste WCAG AA — página inteira + 70 cards nos 7 dias | **0 reprovas** |
| Cobertura 24h — 504 checagens (7 dias × 24h × 3 minutos) | **0 buracos** |
| Bloco cruzando a meia-noite (sáb 23:00–01:00 no ar às 00:30 de dom) | correto |
| `validarGrade()` — 7 casos: buraco, sobreposição, fim cedo, início tarde, dia vazio, grade correta, virada válida | **7/7 corretos** |
| Rolagem horizontal em 375px e 800px | **nenhuma** (`scrollX = 0`) |
| Erros no console | **nenhum** |
| Peso da primeira visita | 191 KB sem compressão · ~110 KB com Brotli no Vercel |
| Iframes no carregamento inicial | **0** (facade do YouTube funcionando) |
| Alvo de toque do botão de play (mobile) | 80×80 px |
| Máquina de estados do player | parado → conectando → no ar → parado, com ARIA correto |
| Menu mobile | abre, trava o scroll, fecha no ESC, devolve o foco |

---

## Contexto do projeto

> ### ⚠️ O nome
> **Voz WebTV** — o **TV** vem de **Teotônio Vilela**, das iniciais da escola.
> **Não** significa "televisão". A rádio é da **Escola Estadual Teotônio Vilela**
> (Mato Grosso do Sul), de uma escola só — não é um projeto da rede estadual.
> A seção de vídeo do site chama-se **"Assista"**, justamente para não reforçar
> a leitura errada do nome.
>
> A paleta continua sendo a institucional da SED MS porque a Teotônio Vilela é
> escola estadual — mas o site se apresenta como a rádio **da escola**, não da rede.

- **Produto:** site da web rádio **Voz WebTV**, da Escola Estadual Teotônio Vilela.
- **Natureza:** site estático, alta performance, hospedagem gratuita no Vercel.
- **Stack:** HTML · Tailwind CSS · JavaScript puro · Google Sheets + PapaParse como CMS · AzuraCast (áudio) · YouTube (vídeo).
- **Estética:** Web Brutalista / Editorial (Zine), inspirada na estrutura do site RTRFM (arquivo em `Referencias/`), com as cores originais **descartadas** e substituídas pela paleta institucional da **SED MS**.
- **Público principal:** alunos, majoritariamente no celular. Mobile-first é requisito.
- **Quem edita o conteúdo:** professores e alunos, exclusivamente pela planilha do Google.

---

## Decisões travadas (não reabrir sem motivo forte)

| # | Decisão | Motivo |
|---|---|---|
| 1 | Tailwind via **CLI**, não via CDN | O CDN compila no navegador e mata o LCP |
| 2 | Sem framework JS (React/Vue/Alpine) | Site estático simples; JS puro basta |
| 3 | PapaParse é a **única** dependência de runtime | Servida localmente, ~7 KB gzip |
| 4 | Fontes **self-hosted** em woff2 | Performance + privacidade dos alunos |
| 5 | YouTube via **facade** (click-to-load) | Um iframe direto custa ~1 MB no carregamento |
| 6 | `borderRadius` **desligado no core do Tailwind** | Garante os cantos retos por construção, não por disciplina |
| 7 | Amarelo **nunca** como cor de texto sobre fundo claro nem sobre verde | 1.7:1 e 3.51:1 — reprovam em AA |
| 8 | Verde institucional é **`#007A33`**, não `#00913F` | O original dava 4.10:1 com branco e reprovava em texto pequeno |
| 9 | Foco de teclado usa **`outline`**, nunca `ring`/`box-shadow` | `ring` colide com as sombras sólidas e some sob `@layer components` |
| 10 | Entrelinha escrita como **`text-8xl/[0.82]`** | Um `leading-*` solto é sobrescrito pela variante `md:text-*` |
| 11 | Nenhum dado pessoal de aluno na planilha | A planilha publicada é pública |
| 12 | Player **nunca** dá autoplay | Bloqueado pelos navegadores e hostil ao usuário |
| 13 | Fuso fixado em `America/Campo_Grande` | O "no ar agora" não pode depender do relógio do visitante |
| 14 | Coluna **`tipo`** (`AO VIVO`/`AUTOMATICO`) é a fonte da verdade | Deduzir pelo `apresentador` quebra se alguém digitar diferente |
| 15 | Em sobreposição de horários, vence quem **começou por último** | Evita que um bloco longo engula um programa curto cadastrado dentro dele |
| 16 | Blocos podem cruzar a meia-noite; cadastrar no dia em que **começam** | Grade 24h torna isso rotina, não exceção |
| 17 | Nada de `opacity-*` em cards | Opacidade no card reduz o contraste de tudo dentro dele |

---

## Pendências / informações que faltam

Nenhuma delas bloqueia a apresentação — o site está completo em modo demonstração.

- [ ] **URL do stream do AzuraCast** — `AZURACAST.streamUrl` *(bloqueia a Fase 4)*
- [ ] **URL da API de now playing** — `AZURACAST.nowPlaying` *(bloqueia a Fase 4)*
- [ ] **URL da planilha publicada em CSV** + os `gid` de cada aba *(bloqueia a Fase 3)*
- [ ] **ID do vídeo/live do YouTube** — `WEBTV.videoId` *(bloqueia a Fase 5)*
- [ ] **Logo da Voz WebTV** em SVG (hoje há um ícone de equalizador provisório)
- [ ] Confirmar se há **manual de marca oficial da SED MS**. Se os hexadecimais oficiais divergirem, revalidar o contraste antes de aplicar — o verde atual foi escolhido por medição, não por estética
- [ ] Definir o **domínio** final (hoje o sitemap aponta para `voz-webtv.vercel.app`)
- [ ] Nome real da escola, endereço e contato para o rodapé
- [ ] Substituir os textos de demonstração (`assets/js/mock.js`) por conteúdo real

---

## Como ligar as integrações

Tudo passa por **`assets/js/config.js`**. Nenhum outro arquivo precisa mudar.

1. Trocar `MODO_DEMO` para `false`.
2. Preencher `AZURACAST.streamUrl` e `AZURACAST.nowPlaying`.
3. Preencher as quatro URLs em `PLANILHAS`.
4. Preencher `WEBTV.videoId`.
5. Adicionar o PapaParse ao `index.html`, antes do `main.js`:
   `<script src="/assets/js/vendor/papaparse.min.js"></script>`

Os módulos já têm o caminho do PapaParse escrito e caem em *fallback* para os dados
de `mock.js` se a planilha falhar — a grade nunca aparece vazia.

---

## Próximos passos

### ▶ Imediato
- Publicar no Vercel e apresentar.

### Fases seguintes
- **Fase 3** — Ligar as planilhas (PapaParse). O código de render já está pronto; falta só a URL e o `<script>` do vendor.
- **Fase 4** — Ligar o AzuraCast. A máquina de estados, a reconexão com backoff e a Media Session já existem.
- **Fase 5** — Ligar a WebTV (`WEBTV.videoId`). A facade já está implementada.
- **Fase 6** — Auditoria Lighthouse, JSON-LD de `BroadcastEvent`, domínio próprio.

---

## Log de sessões

### 15/08/2026 — Sessão 3 (grade 24h)
- Definido que a rádio opera 24h **sem locutor 24h**: música automática o tempo todo,
  locução só nas janelas da grade. Criada a coluna **`tipo`** para tornar isso explícito.
- Grade regerada: 70 blocos, cobertura 00:00–00:00 nos 7 dias, 14% ao vivo / 86% automático.
  Primeira versão tinha 52 blocos ao vivo (~10h de locução por dia) — irreal para uma escola;
  reequilibrada para 3–4 janelas curtas por dia letivo.
- Gerado **`planilha-voz-webtv.xlsx`** (5 abas, com LEIA-ME para professores) e
  **`PLANILHA.md`** com o passo a passo de publicação no Google Sheets.
- `mock.js` e a planilha saem do **mesmo gerador**, para nunca divergirem.
- **Dois bugs reais corrigidos:**
  1. **Bloco cruzando a meia-noite não era encontrado.** `estaNoAr` exigia `item.dia === hoje`,
     então `SÁBADO 23:00–01:00` sumia às 00:30 de domingo. Com grade 24h isso deixa de ser
     caso raro. Agora a checagem herda blocos do dia anterior que atravessam a virada.
  2. **`validarGrade()` acusava buraco falso** justamente nesses blocos, porque contava a
     cobertura dia a dia sem creditar o transbordo para o dia seguinte.
- Adicionado tratamento de sobreposição (vence quem começou por último) e o validador
  que loga buracos/sobreposições no console para quem cuida da planilha.
- Removido um `opacity-90` que eu havia posto nos cards automáticos: opacidade no card
  derruba o contraste de todo o conteúdo interno, e a distinção já vinha da cor e do rótulo.

### 15/08/2026 — Sessão 2
- Construída a Fase 2 inteira: build do Tailwind, fontes self-hosted, `index.html`, seis módulos JS e os arquivos de deploy.
- **Três bugs reais encontrados e corrigidos por medição no navegador:**
  1. **Entrelinha dos títulos não aplicava.** `md:text-8xl` sobrescrevia `leading-[0.82]`, deixando o `<h1>` com entrelinha 1.0 em vez de 0.82 — justamente o que dá o bloco tipográfico compacto da estética. Corrigido com a sintaxe `text-8xl/[0.82]` em todos os títulos, no HTML e nos módulos JS.
  2. **Contraste insuficiente do verde.** Branco sobre `#00913F` dá 4.10:1 e reprova em AA para texto pequeno, afetando botão primário, card "no ar" e o corpo da seção Participe. Verde ajustado para `#007A33` (5.48:1). Na mesma auditoria: cinza `#6B7280` → `#5C6470`, amarelo sobre verde substituído por branco, e a célula do logotipo passou de verde para azul para o acento amarelo funcionar.
  3. **Anel de foco invisível nos botões.** `:focus-visible` usava `box-shadow` em `@layer base`, perdendo a cascata para a sombra sólida de `.btn` em `@layer components`. Trocado para `outline`, que não colide.
- Corrigido também o vazamento horizontal do marquee rotacionado (`100vw` inclui a barra de rolagem) e o player que não encolhia entre 768px e 900px.
- **Próxima ação:** deploy no Vercel; depois, Fase 3.

### 15/08/2026 — Sessão 1
- Analisada a referência visual `Referencias/screencapture-rtrfm-au-2026-08-15-16_06_29.png`.
  Padrões extraídos: header com células separadas por bordas grossas · player fixo no topo · faixa marquee inclinada · cards inclinados estilo post-it · rótulos de seção entre parênteses em monoespaçada · títulos grotescos gigantes · botões quadrados com seta `→` · logotipo gigante sangrando no rodapé · alternância de seções claro/escuro.
- Paleta original descartada; substituída pela paleta SED MS.
- Criados `project.md`, `visual.md` e `memory.md`.
