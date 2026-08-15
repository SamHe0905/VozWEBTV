# Voz WebTV — Design System (UI)

> Estética: **Web Brutalista / Editorial (Zine)**, derivada da referência em `Referencias/`, com a paleta institucional da **SED MS** substituindo integralmente as cores do original.
> Última atualização: 15/08/2026. Documentos irmãos: [`project.md`](project.md) · [`memory.md`](memory.md).

---

## 1. Princípios

1. **Estrutura visível.** Bordas grossas e linhas divisórias são o principal elemento gráfico. A página parece uma diagramação impressa, com blocos delimitados.
2. **Blocos sólidos, nunca gradientes.** Cor é aplicada em áreas cheias e chapadas. Nenhum degradê, nenhum vidro, nenhum blur.
3. **Tipografia é a imagem.** Títulos gigantes em caixa alta ocupam o espaço que uma foto ocuparia em outro site.
4. **Sombra é geometria, não luz.** Sombras são deslocamentos sólidos (offset duro), sem desfoque, na cor da tinta.
5. **Contraste antes de estética.** Nenhuma decisão visual pode reduzir a legibilidade abaixo de WCAG AA.
6. **Assimetria controlada.** Rotações e desalinhamentos são intencionais e discretos (−2° a +2°), nunca aleatórios.
7. **Zero arredondamento.** `border-radius: 0` é o padrão global do projeto. Cantos são retos.

### O que copiar da referência
Header com borda inferior grossa e itens separados por linhas verticais · faixa marquee cortando a página · cards inclinados em papel · rótulos de seção entre parênteses `( PROGRAMAÇÃO )` · metadados em monoespaçada · botões quadrados com seta `→` · logo gigante sangrando no rodapé · badges/tags retangulares com borda.

### O que descartar da referência
Toda a paleta original (laranja/vermelho, azul-royal, verde-limão, rosa) · as ilustrações coladas em colagem · o fundo preto dominante da seção de música — aqui o preto vira **azul escuro SED**.

---

## 2. Paleta — SED MS

O fundo principal é off-white. As cores institucionais aparecem em blocos sólidos e vibrantes.

| Token | Hex | Papel |
|---|---|---|
| `bg` | `#F5F2EA` | **Fundo principal.** Off-white levemente quente, cor de papel. |
| `paper` | `#FFFFFF` | Papel dos cards e superfícies elevadas. |
| `verde` | `#007A33` | **Primária.** Blocos de destaque, botão de play, "AO VIVO", CTAs. |
| `verde-dark` | `#00541F` | Bordas, hover do verde, texto sobre fundo claro. |
| `azul` | `#0B2E5C` | **Secundária.** Bordas gerais, tinta dos títulos, faixas escuras, rodapé. |
| `azul-mid` | `#1B4E9B` | Links, hover, estados ativos. |
| `amarelo` | `#FFC72C` | **Acento.** Grifos, badges, "post-it", detalhes. Nunca em áreas grandes. |
| `amarelo-dark` | `#E0A800` | Borda/hover do amarelo. |
| `tinta` | `#0E1116` | Texto de corpo e bordas máximas (quase preto, com fundo azulado). |
| `cinza` | `#5C6470` | Texto de apoio, metadados secundários. |
| `linha` | `#0B2E5C` | Cor padrão de toda borda estrutural (= `azul`). |

> **Por que o verde é `#007A33` e não `#00913F`.** O verde vibrante original dá apenas
> **4.10:1** com texto branco — passa em títulos grandes, mas reprova em WCAG AA
> para texto pequeno (mínimo 4.5:1), o que inviabilizaria botões, tags e o corpo da
> seção Participe. `#007A33` dá **5.48:1** e continua um verde institucional forte.
> A medição foi feita sobre a página renderizada, não estimada.
> Mesma razão para o cinza: `#6B7280` dava 4.32:1 sobre o off-white; `#5C6470` dá 5.35:1.

### Regras de uso de cor (não negociáveis)

- **Amarelo é decoração, nunca informação crítica.** `#FFC72C` sobre branco tem contraste ~1.7:1. Texto amarelo é proibido sobre fundo claro. Amarelo só existe como **fundo de bloco com texto `azul` ou `tinta` por cima** (contraste 8.63:1 ✅).
- **Texto amarelo só sobre azul.** Amarelo sobre `azul` = 8.63:1 ✅. Amarelo sobre `verde` = **3.51:1 ❌** — nesse caso o acento vira **branco** (5.48:1). É por isso que a célula do logotipo no header é azul, e não verde: é o que permite o "WebTV" em amarelo.
- **Verde recebe texto branco em qualquer tamanho** (5.48:1 ✅). Texto de apoio sobre verde usa `text-white/90` — nunca abaixo de 90% de opacidade, que já reprova.
- **Fundo escuro do card decide a cor do texto, não a cor específica.** `azul`, `verde` e o destaque "no ar" são fundos escuros e pedem texto claro; `amarelo` e `branco` pedem texto escuro. A lógica em `schedule.js` deriva disso, não de uma lista de cores.
- **Azul escuro é a cor da tinta estrutural.** Toda borda, régua e divisória é `azul`, salvo quando o bloco já for azul — aí a borda vira `amarelo` ou `bg`.
- **Máximo de duas cores institucionais por seção**, além do fundo. Verde + amarelo, ou azul + amarelo. Nunca as três brigando.
- **Alternância de fundo por seção:** `bg` → `azul` → `bg` → `verde` → `bg`. O ritmo claro/escuro é o que dá o caráter editorial.

### Tokens (`tailwind.config.js`)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        bg:      '#F5F2EA',
        paper:   '#FFFFFF',
        verde:   { DEFAULT: '#007A33', dark: '#00541F' },
        azul:    { DEFAULT: '#0B2E5C', mid: '#1B4E9B' },
        amarelo: { DEFAULT: '#FFC72C', dark: '#E0A800' },
        tinta:   '#0E1116',
        cinza:   '#5C6470',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'Impact', 'system-ui', 'sans-serif'],
        sans:    ['Archivo', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderWidth: { 3: '3px', 6: '6px', 10: '10px' },
      boxShadow: {
        hard:    '6px 6px 0 0 #0B2E5C',
        'hard-sm':'3px 3px 0 0 #0B2E5C',
        'hard-lg':'10px 10px 0 0 #0B2E5C',
        'hard-verde':  '6px 6px 0 0 #00913F',
        'hard-amarelo':'6px 6px 0 0 #FFC72C',
      },
      borderRadius: { none: '0' },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pulseLive: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.25' } },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        live:    'pulseLive 1.4s ease-in-out infinite',
      },
    },
  },
};
```

---

## 3. Tipografia

Três famílias, com papéis rígidos. Todas self-hosted em `woff2`.

| Papel | Família | Uso |
|---|---|---|
| **Display** | `Archivo Black` (grotesca, peso único ~900) | Todos os títulos. **Sempre em CAIXA ALTA.** |
| **Corpo** | `Archivo` (400 / 600 / 700) | Parágrafos, descrições, navegação. |
| **Mono** | `JetBrains Mono` (400 / 700) | Horários, datas, rótulos de seção, metadados, tags. |

> Alternativas equivalentes se o carregamento pesar: **Anton** ou **Bebas Neue** (display mais condensada), **Inter Tight** (corpo). A escolha atual privilegia a grotesca larga, mais próxima da referência.

### Escala

| Nível | Tailwind (mobile → desktop) | Tratamento |
|---|---|---|
| `h1` Hero | `text-5xl md:text-8xl lg:text-9xl` | `font-display uppercase leading-[0.85] tracking-tighter` |
| `h2` Seção | `text-4xl md:text-6xl` | `font-display uppercase leading-[0.9] tracking-tight` |
| `h3` Card | `text-xl md:text-2xl` | `font-display uppercase leading-tight` |
| Corpo | `text-base md:text-lg` | `font-sans leading-relaxed max-w-[65ch]` |
| Metadado | `text-xs md:text-sm` | `font-mono uppercase tracking-widest` |
| Rótulo de seção | `text-xs` | `font-mono uppercase tracking-[0.2em]` — escrito como `( PROGRAMAÇÃO )` |

**Regras:**
- Títulos display **sempre** com `leading` menor que 1 e `tracking-tighter`. É isso que gera o bloco tipográfico compacto da estética zine.
- ⚠️ **A entrelinha vai junto do tamanho, na sintaxe `text-8xl/[0.82]`.** As utilities `text-*` do Tailwind definem font-size **e** line-height. Um `leading-[0.82]` solto é sobrescrito pela variante responsiva (`md:text-8xl`), porque as media queries vêm depois no CSS gerado. Escrever `md:text-8xl md:leading-[0.82]` também funciona, mas a barra é mais curta e não deixa esquecer um breakpoint.
- Corpo de texto **nunca** passa de `65ch` de largura.
- Nada de itálico, nada de `text-shadow`, nada de letter-spacing positivo em display.
- Grifo editorial: `<mark>` com fundo `amarelo`, texto `azul`, `px-2`, sem arredondamento.

---

## 4. Espaçamento, Grid e Bordas

### Espaçamento
Escala base de 4px (padrão Tailwind). Ritmo vertical de seção: `py-16 md:py-24`. Distância entre blocos internos: `gap-6 md:gap-8`.

### Container
`mx-auto w-full max-w-[1400px] px-4 md:px-8` — largo, editorial. Blocos de destaque (marquee, faixas de cor, player) sangram até a borda da viewport (`w-screen`, fora do container).

### Bordas — vocabulário fixo

| Uso | Classe |
|---|---|
| Divisória de seção | `border-b-6 border-azul` |
| Card padrão | `border-3 border-azul` |
| Card em destaque / player | `border-6 border-azul` |
| Moldura externa da página | `border-x-0 md:border-x-6 border-azul` |
| Input / campo | `border-3 border-azul focus:border-verde` |

Toda borda é `solid`. Nenhuma borda tracejada ou pontilhada.

### Sombras sólidas
Deslocamento duro, sem blur, sempre para baixo-direita:
```
shadow-hard        → 6px 6px 0 #0B2E5C   (card padrão)
shadow-hard-sm     → 3px 3px 0 #0B2E5C   (badge, tag, botão pequeno)
shadow-hard-lg     → 10px 10px 0 #0B2E5C (player, hero)
```
Sobre fundo azul, a sombra troca para `shadow-hard-amarelo`.

### Interações
Padrão único de hover/active para tudo que é clicável — o elemento "afunda" na direção da sombra:
```html
class="shadow-hard transition-transform duration-100
       hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-hard-sm
       active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
```
**Foco (teclado):** regra global em `src/input.css`, com **`outline`, não `ring`/`box-shadow`**:
```css
:focus-visible { outline: 4px solid var(--amarelo); outline-offset: 3px; }
```
⚠️ O `ring-*` do Tailwind é implementado com `box-shadow` — o mesmo canal das sombras sólidas do projeto. Como `.btn` vive em `@layer components` e a regra de foco em `@layer base`, o botão venceria a cascata e **apagaria o anel de foco**. `outline` é um canal separado e não colide. Sobre fundo amarelo, o anel troca para azul.

---

## 5. Estrutura do Layout

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER  [LOGO │ PROGRAMAÇÃO │ WEBTV │ NOTÍCIAS │ SOBRE ]     │  border-b-6 azul
├──────────────────────────────────────────────────────────────┤
│ ███ PLAYER GIGANTE — fundo azul, sangra na largura total ███ │  border-b-6 azul
│  [▶ PLAY]  ● AO VIVO   AGORA: nome do programa · locutor     │  botão verde 80px
├──────────────────────────────────────────────────────────────┤
│ ◄◄ MARQUEE • VOZ WEBTV • A RÁDIO DA ESCOLA • NO AR ◄◄        │  amarelo, rot -1.5°
├──────────────────────────────────────────────────────────────┤
│ ( A RÁDIO )                                                  │
│ VOZ                    ┌──────────────────┐                  │
│ WEBTV                  │  bloco verde     │                  │
│ (h1 gigante)           │  chamada/CTA     │                  │
├──────────────────────────────────────────────────────────────┤
│ ( PROGRAMAÇÃO )                          [SEG][TER][QUA]...  │
│ NOSSA GRADE                                                  │
│  ┌post-it┐  ┌post-it┐  ┌post-it┐  ┌post-it┐   ← inclinados   │
│  │ 07:30 │  │ 09:00 │  │ 10:30 │  │ 13:00 │                  │
│  └───────┘  └───────┘  └───────┘  └───────┘                  │
├──────────────────────────────────────────────────────────────┤
│ ███ WEBTV — fundo azul escuro, título branco ███             │
│  ┌────────────────────────┐  ┌──────────────┐                │
│  │  player 16:9 (facade)  │  │ bloco amarelo│                │
│  └────────────────────────┘  └──────────────┘                │
├──────────────────────────────────────────────────────────────┤
│ ( NOTÍCIAS )   ÚLTIMAS DA ESCOLA          → VER TODAS         │
│  [card destaque grande]  [card]  [card]  [card]              │
├──────────────────────────────────────────────────────────────┤
│ ◄◄ MARQUEE (segunda ocorrência, rot +1.5°) ◄◄                │
├──────────────────────────────────────────────────────────────┤
│ FOOTER — fundo azul, texto off-white, links, contato          │
│ VOZ WEBTV  ← logotipo gigante sangrando na base               │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Componentes

### 6.1 Header
```
sticky top-0 z-50 bg-bg border-b-6 border-azul
```
Logo à esquerda, dentro de uma célula com `border-r-6 border-azul` (como na referência). Itens de menu em `font-mono uppercase tracking-widest text-sm`, separados por `border-r-3 border-azul`. Sublinhado no hover, com `text-decoration-thickness: 3px`. No mobile: menu hambúrguer abrindo painel `fixed inset-0 bg-verde` em tela cheia, com links em `text-4xl font-display`.

### 6.2 Player (componente mais importante)
Faixa horizontal grossa, largura total, logo abaixo do header. Altura mínima `h-24 md:h-32`.
```
w-full bg-azul text-bg border-b-6 border-azul flex items-stretch
```
- **Botão play:** `w-20 h-20 md:w-24 md:h-24 bg-verde border-6 border-bg text-bg grid place-items-center` + padrão de hover-afunda. Ícone SVG de triângulo/pausa, `w-8 h-8`, sem arredondamento.
- **Selo AO VIVO:** `bg-amarelo text-azul font-mono text-xs uppercase tracking-widest px-3 py-1 border-3 border-azul` com um `<span>` circular usando `animate-live`.
- **Now playing:** `font-display uppercase text-lg md:text-2xl truncate` + linha de metadado em `font-mono text-xs text-amarelo`.
- **Volume:** slider custom com trilha `bg-bg/30 h-3` e polegar quadrado `bg-amarelo w-5 h-5`. `hidden md:flex`.
- **Estados:** `carregando` → botão com barras animadas; `erro` → botão vira `bg-amarelo text-azul` com ícone de alerta e texto "FORA DO AR".

### 6.3 Marquee
```html
<div class="w-screen bg-amarelo border-y-6 border-azul overflow-hidden -rotate-[1.5deg] my-8">
  <div class="flex w-max animate-marquee py-3 motion-reduce:animate-none">
    <span class="font-display uppercase text-2xl md:text-4xl text-azul whitespace-nowrap px-6">…</span>
    <!-- conteúdo duplicado para loop contínuo -->
  </div>
</div>
```
Separador entre os textos: `•` ou `★` em `text-verde`. Segunda ocorrência da faixa (antes do rodapé) usa `bg-verde text-bg` e `rotate-[1.5deg]`, para não repetir a primeira.

### 6.4 Cabeçalho de Seção
```html
<div class="flex items-end justify-between border-b-6 border-azul pb-4 mb-10">
  <div>
    <span class="font-mono text-xs uppercase tracking-[0.2em] text-verde-dark">( PROGRAMAÇÃO )</span>
    <h2 class="font-display uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight">Nossa grade</h2>
  </div>
  <a class="font-mono text-sm uppercase underline decoration-3 underline-offset-4">Ver tudo →</a>
</div>
```

### 6.5 Card de Programação — "post-it"
Fundo colorido definido pela coluna `cor` da planilha (`amarelo` padrão, `verde`, `azul`, `branco`). Inclinação alternada e sutil.
```html
<article class="bg-amarelo border-3 border-azul shadow-hard p-5
                -rotate-1 even:rotate-1 hover:rotate-0 transition-transform duration-150">
  <span class="font-mono text-xs bg-azul text-bg px-2 py-1 uppercase tracking-widest">Notícias</span>
  <p class="font-mono text-sm mt-4">07:30 — 08:30</p>
  <h3 class="font-display uppercase text-2xl leading-tight mt-1">Manhã na Escola</h3>
  <p class="font-sans text-sm mt-2">Turma do 9º A</p>
  <span class="hidden [&.is-live]:inline …">● NO AR</span>
</article>
```
**Regras:**
- Rotação **apenas** entre −2° e +2°, alternando pelo índice. No hover, endireita (`rotate-0`).
- No mobile (`< md`) a rotação é anulada — cards inclinados quebram o alinhamento em coluna única. Usar `rotate-0 md:-rotate-1`.
- **Programa no ar agora:** troca para `bg-verde text-bg border-6` + selo `● NO AR` em amarelo, e `rotate-0` (o card em destaque fica reto, em contraste com os tortos).

### 6.6 Card de Notícia
```
bg-paper border-3 border-azul shadow-hard overflow-hidden
```
Imagem no topo com `aspect-[16/10] object-cover` e `border-b-3 border-azul` — a borda separando imagem e texto é obrigatória. Data em `font-mono text-xs`, título em display, resumo em `font-sans text-sm`. Card de destaque ocupa `md:col-span-2 md:row-span-2`.

### 6.7 Botões

| Variante | Classes |
|---|---|
| Primário | `bg-verde text-white border-3 border-azul shadow-hard font-mono uppercase tracking-widest px-6 py-3` |
| Secundário | `bg-amarelo text-azul border-3 border-azul shadow-hard …` |
| Sobre fundo escuro | `bg-amarelo text-azul border-3 border-bg shadow-hard-amarelo …` |
| Fantasma | `bg-transparent text-azul border-3 border-azul` (sem sombra) |

Todos quadrados (`rounded-none`), com a seta `→` à direita, e o padrão hover-afunda da seção 4.

### 6.8 Badge / Tag
`inline-block font-mono text-[10px] md:text-xs uppercase tracking-widest border-3 border-azul px-2 py-1 bg-paper`.

### 6.9 Rodapé
`bg-azul text-bg border-t-6 border-azul`, colunas de links em `font-mono uppercase text-sm`, e o logotipo **VOZ WEBTV** em `font-display text-[18vw] leading-none` sangrando na base com `overflow-hidden` — assinatura visual direta da referência.

### 6.10 Estados de dados (grade e notícias)
- **Skeleton:** blocos `bg-azul/10 border-3 border-azul/30 animate-pulse` com a mesma altura do card final (evita CLS).
- **Vazio:** bloco `border-6 border-dashed`-equivalente → aqui, `border-6 border-azul bg-amarelo/30` com texto em display: "NADA POR AQUI AINDA".
- **Erro:** bloco `bg-amarelo border-6 border-azul` com "NÃO CONSEGUIMOS CARREGAR A GRADE" + botão "TENTAR DE NOVO".

---

## 7. Responsividade

| Breakpoint | Comportamento |
|---|---|
| `< 640` | Coluna única. Cards sem rotação. Player empilha em duas linhas (botão + info). Menu hambúrguer. Título hero em `text-5xl`. |
| `md (768)` | Grade de 2 colunas. Rotação dos post-its ativa. Player em linha única. Slider de volume aparece. |
| `lg (1024)` | Grade de 3–4 colunas. Marquee com fonte maior. Bordas laterais da moldura da página. |
| `xl (1280+)` | Container em `max-w-[1400px]`. Hero em `text-9xl`. |

**Mobile-first sempre:** escrever a classe base para o celular e adicionar `md:`/`lg:` para cima. O público majoritário está no celular.

---

## 8. Movimento

Pouco, rápido e mecânico. Nada de easing suave e longo.

| Elemento | Animação |
|---|---|
| Marquee | `translateX` linear infinita, 28s |
| Hover de botões/cards | `transform` 100ms `ease-out` |
| Ponto "AO VIVO" | `opacity` pulsante, 1.4s |
| Rotação do card no hover | 150ms |
| Entrada de seção (opcional) | `IntersectionObserver` + `opacity/translateY(12px)`, 250ms, **uma única vez** |

**`prefers-reduced-motion: reduce` desliga marquee, pulso e animações de entrada.** Implementar globalmente em `src/input.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

---

## 9. Checklist de conformidade visual

Antes de dar qualquer tela por pronta:

- [ ] Nenhum `border-radius` maior que 0.
- [ ] Nenhum gradiente, blur ou sombra desfocada.
- [ ] Todos os títulos em caixa alta, `font-display`, `leading < 1`.
- [ ] Toda borda estrutural com no mínimo 3px, na cor `azul`.
- [ ] Amarelo nunca usado como cor de texto sobre fundo claro.
- [ ] Todo elemento clicável tem estado de hover, active e `focus-visible`.
- [ ] Alternância de fundo claro/escuro entre seções mantida.
- [ ] Metadados (horas, datas, categorias) em `font-mono uppercase tracking-widest`.
- [ ] Testado em 375px de largura sem rolagem horizontal.
- [ ] Contraste verificado em todos os pares de cor usados.
