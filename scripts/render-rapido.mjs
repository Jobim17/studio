// Render em paralelo: divide o vídeo em partes, renderiza todas ao mesmo tempo (cada uma em um processo
// próprio do Remotion), junta sem recomprimir e põe o áudio, também sem recomprimir. O visual é idêntico ao
// render normal; só usa mais do PC, porque um único processo do Remotion não passa de ~40% da CPU.
// Uso: node scripts/render-rapido.mjs <ComposicaoId> [saida.mp4] [partes] [abas por parte]
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition} from '@remotion/renderer';

const [id, saidaArg, partesArg, abasArg] = process.argv.slice(2);
if (!id) {
  console.log('Uso: node scripts/render-rapido.mjs <ComposicaoId> [saida.mp4] [partes] [abas por parte]');
  process.exit(1);
}
const nucleos = os.availableParallelism?.() ?? os.cpus().length;
const partes = Number(partesArg) || 2;
const abas = Math.min(nucleos, Number(abasArg) || Math.max(1, Math.round((nucleos * 1.5) / partes)));
const saida = path.resolve(saidaArg || `out/${id}.mp4`);
const tmp = path.resolve('tmp', `render-${id}`);
const cli = path.resolve('node_modules/@remotion/cli/remotion-cli.js');

const rodar = (rotulo, args) =>
  new Promise((ok, falha) => {
    const p = spawn(process.execPath, [cli, ...args], {stdio: ['ignore', 'pipe', 'pipe']});
    let ultima = '';
    const log = (d) => {
      for (const linha of d.toString().split(/\r|\n/)) {
        if (linha.trim()) ultima = linha.trim();
      }
    };
    p.stdout.on('data', log);
    p.stderr.on('data', (d) => {
      log(d);
      process.stderr.write(`[${rotulo}] ${d}`);
    });
    const t = setInterval(() => console.log(`[${rotulo}] ${ultima.slice(0, 110)}`), 15000);
    p.on('close', (code) => {
      clearInterval(t);
      code === 0 ? ok() : falha(new Error(`${rotulo} falhou (código ${code}). Última linha: ${ultima}`));
    });
  });

const inicio = Date.now();
fs.rmSync(tmp, {recursive: true, force: true});
fs.mkdirSync(tmp, {recursive: true});
fs.mkdirSync(path.dirname(saida), {recursive: true});

console.log('Preparando o projeto...');
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('projetos'), outDir: path.join(tmp, 'bundle')});
const comp = await selectComposition({serveUrl, id, chromiumOptions: {gl: 'angle'}});
const total = comp.durationInFrames;
console.log(`${id}: ${total} quadros. ${partes} partes ao mesmo tempo, ${abas} abas cada (PC com ${nucleos} núcleos).`);

const tarefas = [];
const arquivos = [];
for (let i = 0; i < partes; i++) {
  const de = Math.floor((total * i) / partes);
  const ate = Math.floor((total * (i + 1)) / partes) - 1;
  const arq = path.join(tmp, `parte-${i + 1}.mp4`);
  arquivos.push(arq);
  tarefas.push(
    rodar(`parte ${i + 1}/${partes}`, [
      'render', serveUrl, id, arq, `--frames=${de}-${ate}`, '--muted', '--crf=17', `--concurrency=${abas}`, '--gl=angle', '--log=warn',
    ]),
  );
}
const audio = path.join(tmp, 'audio.aac');
tarefas.push(rodar('áudio', ['render', serveUrl, id, audio, '--codec=aac', '--log=warn']));
await Promise.all(tarefas);

console.log('Juntando as partes (sem recomprimir)...');
const lista = path.join(tmp, 'lista.txt');
fs.writeFileSync(lista, arquivos.map((a) => `file '${a.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
await new Promise((ok, falha) => {
  const p = spawn(process.execPath, [cli, 'ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lista, '-i', audio,
    '-map', '0:v', '-map', '1:a', '-c', 'copy', '-shortest', '-movflags', '+faststart', saida], {stdio: 'inherit'});
  p.on('close', (c) => (c === 0 ? ok() : falha(new Error('A junção das partes falhou.'))));
});

// Conferência: o arquivo final precisa ter exatamente o número de quadros da composição.
const contagem = await new Promise((ok) => {
  let out = '';
  const p = spawn(process.execPath, [cli, 'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets',
    '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', saida]);
  p.stdout.on('data', (d) => (out += d));
  p.on('close', () => ok(parseInt(out, 10)));
});
fs.rmSync(tmp, {recursive: true, force: true});

const min = ((Date.now() - inicio) / 60000).toFixed(1);
if (contagem !== total) {
  console.log(`\nATENÇÃO: o vídeo final tem ${contagem} quadros, mas deveria ter ${total}. Avise o Claude.`);
  process.exit(1);
}
console.log(`\nPronto em ${min} min: ${saida}`);
