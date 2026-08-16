/* ═══════════════════════════════════════════════════════════════════
   VOZ WEBTV — Carimba a versão nos arquivos que o navegador guarda
   ───────────────────────────────────────────────────────────────────
   POR QUE ISTO EXISTE

   O navegador guarda CSS e JS. Depois de um deploy, ele pode continuar
   rodando o arquivo velho — e aí a pessoa vê HTML novo com JavaScript
   antigo, uma mistura que quebra de formas difíceis de diagnosticar.
   Aconteceu duas vezes neste projeto: a correção estava publicada e o
   site parecia intacto.

   Os cabeçalhos do vercel.json já mandam revalidar a cada visita, o que
   resolve daqui para a frente. Este script é o cinto de segurança: troca
   a URL a cada build, então o navegador busca um endereço que nunca viu
   e não tem como servir cópia velha.

   Roda sozinho no `npm run build`, inclusive no deploy da Vercel.
   Ninguém precisa lembrar de nada.
   ═══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Ex.: 202608160206 — sobe a cada build, e é legível na aba de rede.
const VERSAO = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

/** Arquivos que o HTML referencia direto. */
const PAGINAS = ['index.html', 'admin.html'];

/** Módulos JS que importam uns aos outros. */
const DIR_JS = path.join(RAIZ, 'assets', 'js');

let trocas = 0;

// ── 1. Referências nas páginas ────────────────────────────────────
for (const nome of PAGINAS) {
  const alvo = path.join(RAIZ, nome);
  if (!fs.existsSync(alvo)) continue;

  let c = fs.readFileSync(alvo, 'utf8');
  const antes = c;

  c = c
    .replace(/(\/assets\/(?:css|js)\/[\w.-]+\.(?:css|js))\?v=\d+/g, '$1')
    .replace(/(href="\/assets\/css\/[\w.-]+\.css)"/g, `$1?v=${VERSAO}"`)
    .replace(/(src="\/assets\/js\/[\w.-]+\.js)"/g, `$1?v=${VERSAO}"`);

  if (c !== antes) {
    fs.writeFileSync(alvo, c);
    trocas += (c.match(/\?v=/g) || []).length;
  }
}

// ── 2. Imports entre os módulos ───────────────────────────────────
// Sem isto, versionar só o arquivo de entrada não adianta: ele seria
// buscado novo e importaria as dependências da cópia guardada.
for (const nome of fs.readdirSync(DIR_JS)) {
  if (!nome.endsWith('.js')) continue;
  const alvo = path.join(DIR_JS, nome);

  let c = fs.readFileSync(alvo, 'utf8');
  const antes = c;

  // Só imports relativos deste projeto: './algo.js'
  c = c
    .replace(/(from\s+['"]\.\/[\w.-]+\.js)\?v=\d+(['"])/g, '$1$2')
    .replace(/(from\s+['"]\.\/[\w.-]+\.js)(['"])/g, `$1?v=${VERSAO}$2`);

  if (c !== antes) {
    fs.writeFileSync(alvo, c);
    trocas += (c.match(/\?v=/g) || []).length;
  }
}

console.log(`versionar: ${trocas} referências marcadas com v=${VERSAO}`);
