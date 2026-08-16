# Como configurar a planilha da programação

> Guia prático para colocar a grade da Voz WebTV no Google Sheets e ligar ao site.
> Arquivo semente para importar: **`planilha-MODELO-inicial.xlsx`** (raiz do projeto).

---

## ⚠️ Onde fica o arquivo que se edita no dia a dia

**No Google Drive da escola — não neste repositório.**

O `planilha-MODELO-inicial.xlsx` é uma **semente**, usada uma única vez para criar a
planilha no Drive. Depois do upload, ele vira apenas um registro histórico:

```
planilha-MODELO-inicial.xlsx  (repositório)  →  usado 1 vez, no Passo 1
                                                  ↓
        Planilha no Google Drive  ←── É AQUI que professores e alunos editam,
                                       todos os dias, para sempre
                                                  ↓
                             site lê os CSVs publicados
```

**Editar o `.xlsx` do repositório depois do Passo 1 não muda nada no site.**
Ele não fica em sincronia com o Drive. Se precisar recriar a planilha do zero
algum dia, use-o de novo — fora isso, esqueça que ele existe.

### Resumo de onde mexer em quê

| O que mudar | Onde | Quem faz |
|---|---|---|
| Programação, notícias, equipe, letreiro | Planilha no **Google Drive** | Professores e alunos |
| URLs das planilhas, do stream, do YouTube | `assets/js/config.js` | Quem cuida do site |
| Layout, cores, textos fixos da página | `index.html`, `tailwind.config.js` | Quem cuida do site |

Só a primeira linha é rotina. As outras duas são raras, e exigem `git push`.

---

## O que já está pronto

O arquivo `planilha-MODELO-inicial.xlsx` tem **5 abas**, já preenchidas com a grade 24h completa:

| Aba | Conteúdo | Linhas |
|---|---|---|
| `LEIA-ME` | Instruções para quem for editar | — |
| `programacao` | Grade 24h dos 7 dias | 70 |
| `noticias` | Notícias da escola | 5 |
| `equipe` | Quem faz a rádio | 4 |
| `config` | Textos globais do site (letreiro, aviso, YouTube) | 7 |

A grade cobre **00:00 às 00:00 em todos os dias, sem buraco**, e já vem dividida
entre blocos com locutor e blocos de música automática.

---

## Passo 1 — Subir a planilha para o Google Sheets

1. Acesse [drive.google.com](https://drive.google.com).
2. **Novo → Upload de arquivo** → selecione `planilha-MODELO-inicial.xlsx`.
3. Clique com o botão direito no arquivo → **Abrir com → Planilhas Google**.
4. Em **Arquivo → Salvar como Planilhas Google** (isso converte de `.xlsx` para o
   formato nativo, necessário para o passo seguinte).

> Faça isso com a conta institucional da escola, não com uma conta pessoal de aluno.
> Quem sair da escola leva a planilha junto se ela estiver numa conta pessoal.

---

## Passo 2 — Publicar cada aba como CSV

Para **cada uma** das quatro abas de dados (`programacao`, `noticias`, `equipe`, `config`):

1. **Arquivo → Compartilhar → Publicar na web**.
2. Na primeira caixa, escolha a **aba específica** (não "Documento inteiro").
3. Na segunda caixa, escolha **Valores separados por vírgula (.csv)**.
4. Marque **"Republicar automaticamente quando forem feitas alterações"**.
5. Clique em **Publicar** e copie o link.

O link tem esta cara:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vSeuTokenAqui/pub?gid=123456789&single=true&output=csv
```

Repita para as quatro abas. Você terá **quatro links diferentes** — o que muda entre
eles é o `gid`.

> **Publicar na web ≠ tornar a planilha editável por qualquer um.** O link publicado
> é somente leitura e só entrega os dados daquela aba. A planilha de edição continua
> restrita a quem você compartilhou.

---

## Passo 3 — Colar os links no site

Abra `assets/js/config.js` e preencha:

```js
export const MODO_DEMO = false;   // <- desliga os dados de demonstração

export const PLANILHAS = {
  programacao: 'https://docs.google.com/.../pub?gid=0&single=true&output=csv',
  noticias:    'https://docs.google.com/.../pub?gid=111&single=true&output=csv',
  equipe:      'https://docs.google.com/.../pub?gid=222&single=true&output=csv',
  config:      'https://docs.google.com/.../pub?gid=333&single=true&output=csv',
};
```

E adicione o PapaParse no `index.html`, **antes** do `main.js`:

```html
<script src="/assets/js/vendor/papaparse.min.js"></script>
```

Baixe o PapaParse em [papaparse.com](https://www.papaparse.com/) e salve em
`assets/js/vendor/papaparse.min.js`.

Depois é só `git push` — o Vercel publica sozinho.

---

## Como a programação 24h funciona

A rádio toca **24 horas**, mas o **locutor entra só nas janelas marcadas**. Quem
define isso é a coluna `tipo`:

| `tipo` | Significa | `apresentador` | Como aparece no site |
|---|---|---|---|
| `AO VIVO` | Tem locutor no estúdio | preencher | Nome do programa + quem apresenta |
| `AUTOMATICO` | Só música, sem locução | deixar vazio | "Só música · sem locutor" |

Na grade que veio pronta: **3 a 4 janelas ao vivo por dia letivo**, ancoradas na
rotina da escola:

```
07:00 — 07:30   AO VIVO      Bom Dia, Escola      (entrada)
09:30 — 10:30   AO VIVO      programa do dia      (intervalo)
13:00 — 14:00   AO VIVO      programa do dia      (início da tarde)
15:00 — 16:00   AO VIVO      Sinal de Saída       (saída)
19:00 — 20:00   AO VIVO      serão (ter/qui)      ou música nos demais dias
todo o resto    AUTOMATICO   playlist
```

Fim de semana é quase todo automático: sábado tem duas janelas curtas, domingo tem uma.

### Regras que não podem ser quebradas

1. **A grade de cada dia cobre 00:00 até 00:00, sem buraco.** O `hora_fim` de um
   bloco é igual ao `hora_inicio` do próximo. O último termina em `00:00`.
2. **Horário sempre com 2 dígitos:** `07:30`, não `7:30`.
3. **Não renomeie colunas nem abas.** O site procura pelo nome exato.
4. **Para tirar algo do ar, escreva `NAO` em `ativo`.** Não apague a linha.
5. **`cor` aceita só:** `verde`, `azul`, `amarelo`, `branco`.
6. **Nenhum dado pessoal de aluno.** A aba publicada é pública — só nome, função e turma.

### Blocos que passam da meia-noite

É permitido: `SÁBADO 23:00 — 01:00`. Cadastre no dia em que o bloco **começa**.
O site entende que às 00:30 de domingo esse bloco ainda está no ar.

### Se errar, o site avisa

Ao carregar a página, abra o **console do navegador** (F12 → Console). Se a grade
tiver buraco ou sobreposição, aparece algo como:

```
[Voz WebTV] A grade nao cobre as 24h em 2 ponto(s):
  • QUARTA: buraco entre 14:00 e 15:00
  • SEXTA: "Cine Voz" (13:00) sobrepoe o bloco anterior
```

Nada quebra — o site continua no ar. É só um aviso para corrigir a planilha.

---

## Depois de tudo ligado

Professores editam a planilha e **não precisam fazer mais nada**. O site relê os
dados a cada visita, com cache de 5 minutos. Nenhum deploy, nenhum código.

---

## Um ponto que precisa de atenção

A trilha automática vai ser alimentada por um script que puxa áudio do YouTube.
Duas coisas a resolver antes de a rádio ir ao ar publicamente:

1. **Direitos autorais.** Transmitir música em uma web rádio pública no Brasil
   envolve o ECAD, mesmo sem fins lucrativos. Vale confirmar com a SED como outras
   rádios escolares tratam isso — pode existir um enquadramento institucional
   da rede estadual que já cubra a Teotônio Vilela.
2. **Termos do YouTube.** Extrair áudio contraria os termos de uso da plataforma.
   Alternativas que evitam o problema: acervos de música livre
   (Jamendo, Free Music Archive, YouTube Audio Library com licença de uso),
   produções dos próprios alunos, ou artistas locais de MS que autorizem por escrito
   — este último inclusive rende pauta para o programa.

Isso não bloqueia nada do que já está pronto: a grade, o site e a planilha funcionam
igual, independentemente da origem do áudio. É só uma decisão que é melhor tomar
antes da inauguração do que depois de uma notificação.
