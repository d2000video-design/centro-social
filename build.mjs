
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { renderPage } from './admin/render.mjs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/modelos', { recursive: true });
for (const file of readdirSync('conteudo').filter(file => file.endsWith('.json'))) {
  const page = file.replace(/\.json$/, '.html');
  const template = readFileSync(page, 'utf8');
  const data = JSON.parse(readFileSync('conteudo/' + file, 'utf8'));
  writeFileSync('dist/' + page, renderPage(template, data, {
    asset: (_value, path) => {
      checkMedia(path);
      return path;
    }
  }));
  writeFileSync('dist/modelos/' + page, template);
}

function checkMedia(path) {
  const file = decodeURIComponent(path.slice(1));
  const pdf = /\.pdf$/i.test(file);
  const limit = pdf ? 15 : 5;
  const info = statSync(file);
  if (!info.isFile() || info.size > limit * 1024 * 1024) {
    throw new Error('Ficheiro inválido ou acima de ' + limit + ' MB: ' + file);
  }
}
for (const file of ['imagens', 'admin', 'style.css', 'script.js']) {
  cpSync(file, 'dist/' + file, { recursive: true });
}
