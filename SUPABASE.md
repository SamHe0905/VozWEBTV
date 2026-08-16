# Supabase — banco e painel admin

> Substitui o Google Sheets como fonte de conteúdo do site.
> Esquema pronto para rodar: **`supabase/schema.sql`**.

---

## O que você precisa fazer (≈ 10 min)

### 1. Criar o projeto

1. [supabase.com](https://supabase.com) → **New project**
2. Região: **South America (São Paulo)** — é a mais perto de Campo Grande
3. Guarde a senha do banco que ele gerar (você quase não vai usar, mas não dá pra recuperar)

### 2. Criar as tabelas

1. **SQL Editor → New query**
2. Cole **todo** o conteúdo de `supabase/schema.sql`
3. **Run**

No fim ele mostra uma tabela de conferência. **Todos os 7 dias devem dar `1440`** — 1440 minutos = 24 horas. Qualquer valor diferente é buraco ou sobreposição na grade.

> Rodar o arquivo de novo **apaga e recria tudo**. Ele começa com `drop table`. Depois que a rádio estiver no ar, não rode mais.

### 3. Fechar o cadastro público ⚠️

**Authentication → Providers → Email → "Enable sign ups" = OFF**

Sem isso, qualquer pessoa na internet cria uma conta e passa a ter permissão de escrita na grade. As políticas de RLS liberam escrita para *qualquer usuário autenticado* — o que segura o portão é não deixar ninguém se cadastrar sozinho.

### 4. Criar as contas da equipe

**Authentication → Users → Add user** → e-mail e senha, um por pessoa que vai editar.

Contas individuais, não uma compartilhada: quando alguém sai da escola, você remove só aquela conta.

### 5. Me mandar duas coisas

**Project Settings → API**:

- **Project URL** — `https://xxxxx.supabase.co`
- **anon public** — a chave longa que começa com `eyJ...`

Eu coloco em `assets/js/config.js` e ligo o site.

> **Não me mande a `service_role`.** Essa chave ignora todas as políticas de segurança e nunca pode sair do servidor. A `anon` é feita para ficar no código do cliente — é assim em qualquer site que usa Supabase.

---

## Por que o site não vai ficar pesado

O site público fala com o Supabase por `fetch` comum na API REST. **Não usa a biblioteca `supabase-js`** — seriam ~40 KB de JS a mais na página que mais importa, para fazer uma requisição GET.

O painel admin, esse sim, usa a biblioteca: ele precisa de sessão, renovação de token e escrita. Mas é outra página, então esse peso não afeta quem só quer ouvir a rádio.

---

## O projeto não vai pausar

O plano free do Supabase pausa depois de **~7 dias sem nenhuma requisição**. Numa rádio escolar isso cai exatamente no recesso: dezembro a fevereiro, ninguém acessa, o banco dorme, e a grade some quando as aulas voltam.

Há **duas defesas independentes**, porque cada uma falha de um jeito diferente:

| | O quê | Quando roda | Falha se… |
|---|---|---|---|
| `api/keep-alive.js` | Função no Vercel, chamada pelo cron | todo dia, 02:00 (MS) | o deploy quebrar |
| `.github/workflows/manter-supabase-ativo.yml` | GitHub Action | a cada 3 dias | ficarem 60 dias sem commit no repo |

O GitHub desativa workflows agendados após 60 dias sem commits — ele avisa por e-mail e reativa com um clique. Como o recesso longo é justamente quando os dois riscos aparecem juntos, vale ter os dois.

E, na prática, **o próprio movimento do site já mantém o banco acordado**: cada visita faz uma consulta. Os crons existem para o período em que ninguém acessa.

### Configurar os dois

**Vercel** → Settings → Environment Variables:

```
SUPABASE_URL       = https://xxxxx.supabase.co
SUPABASE_ANON_KEY  = eyJ...
CRON_SECRET        = (qualquer texto longo e aleatório)
```

O `CRON_SECRET` impede que alguém fique chamando `/api/keep-alive` em looping. O Vercel manda esse valor sozinho quando aciona o cron.

**GitHub** → Settings → Secrets and variables → Actions:

```
SUPABASE_URL       = https://xxxxx.supabase.co
SUPABASE_ANON_KEY  = eyJ...
```

Para testar sem esperar: GitHub → aba **Actions** → *Manter Supabase ativo* → **Run workflow**.

---

## As tabelas

### `programacao` — a grade 24h

| Coluna | Tipo | Observação |
|---|---|---|
| `dia` | texto | Só os 7 nomes, em maiúsculas e com acento |
| `hora_inicio`, `hora_fim` | texto `HH:MM` | O banco recusa formato errado |
| `programa` | texto | Não pode ser vazio |
| `tipo` | `AO VIVO` ou `AUTOMATICO` | Quem define se tem locutor |
| `apresentador` | texto | **Obrigatório** se `tipo = AO VIVO` |
| `descricao`, `categoria` | texto | |
| `cor` | `verde`/`azul`/`amarelo`/`branco` | O banco recusa outra |
| `ativo` | booleano | Desmarque em vez de apagar |

O banco **recusa** dia inválido, horário fora do formato, cor desconhecida e bloco `AO VIVO` sem apresentador. Isso é proposital: erro de digitação para no banco, não no site.

O que ele **não** consegue checar sozinho é se as 24h fecham — isso depende do conjunto das linhas. Quem confere é o `validarGrade()` do site, que escreve no console do navegador todo buraco e sobreposição.

### `noticias`, `equipe`, `config`

`noticias` guarda `data` como data de verdade (ordena certo). `equipe` tem `ordem` para você controlar a sequência. `config` é chave/valor com uma coluna `descricao` explicando cada chave.

> **Nenhum dado pessoal de aluno** em `equipe`. Só nome, função e turma — a tabela é lida publicamente pelo site.

---

## Segurança, em uma frase

RLS ligado nas 4 tabelas: **visitante só lê, usuário autenticado escreve**. O portão é o cadastro fechado (passo 3). Se alguém conseguir criar conta, consegue editar — por isso aquele passo não é opcional.
