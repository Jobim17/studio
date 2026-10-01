import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALAVRAS, Palavra} from './palavras';
import {clamp, COR, FONTE, janela, useMola, useT} from './tema';

// Legendas "negativo": bloco claro com texto escuro. Cada linha entra na palavra em que é dita.
type Negativo = {linhas: {txt: string; s: number}[]; e: number; tom?: 'creme' | 'brasa'};
export const NEGATIVOS: Negativo[] = [
  {linhas: [{txt: '6 MESES', s: 3.5}], e: 5.3},
  {linhas: [{txt: 'RICO.', s: 5.38}], e: 6.05},
  {linhas: [{txt: 'AINDA NÃO', s: 8.78}, {txt: 'FIQUEI RICO.', s: 9.28}], e: 9.96},
  {linhas: [{txt: 'AINDA NÃO TENHO', s: 25.56}], e: 26.9},
  {linhas: [{txt: 'TRABALHAR', s: 28.66}, {txt: '2 HORAS POR DIA', s: 28.92}, {txt: 'DA PRAIA.', s: 29.72}], e: 30.34},
  {linhas: [{txt: 'DORMIR MAL', s: 35.5}, {txt: 'COMER MAL', s: 36.44}, {txt: 'TREINAR MAL', s: 37.18}], e: 38.0, tom: 'brasa'},
  {linhas: [{txt: 'VALE CADA', s: 49.66}, {txt: 'SEGUNDO.', s: 50.2}], e: 50.96},
  {linhas: [{txt: 'AINDA TENHO', s: 63.86}, {txt: 'TEMPO.', s: 64.44}], e: 65.08},
  {linhas: [{txt: 'NÃO É O QUE', s: 68.88}, {txt: 'EU QUERO.', s: 69.32}], e: 69.98},
];

// Tipografia grande, sem bloco.
const GRANDES = [
  {txt: 'ANOS E ANOS.', s: 41.06, e: 42.5, cor: COR.creme, tam: 116},
  {txt: 'VALE A PENA?', s: 46.66, e: 47.94, cor: COR.ambar, tam: 112},
];

const OCULTA = [...NEGATIVOS.map((n) => [n.linhas[0].s, n.e]), ...GRANDES.map((g) => [g.s, g.e])];
const FIM_LEGENDA = 97.3;

// Blocos de 1 a 3 palavras, quebrando em pontuação, pausa ou frase longa.
const blocos: Palavra[][] = [];
for (const p of PALAVRAS) {
  const atual = blocos[blocos.length - 1];
  const ultima = atual?.[atual.length - 1];
  const quebra =
    !atual ||
    atual.length >= 3 ||
    /[.,?!]$/.test(ultima!.w) ||
    p.s - ultima!.e > 0.4 ||
    atual.map((x) => x.w).join(' ').length + p.w.length > 16;
  if (quebra) blocos.push([p]);
  else atual.push(p);
}

const LinhaNegativo: React.FC<{txt: string; s: number; tom: 'creme' | 'brasa'; tam: number}> = ({txt, s, tom, tam}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = frame - s * fps;
  if (k < 0) return null;
  const escala = interpolate(k, [0, 6], [1.18, 1], clamp);
  const tremor = k < 10 ? (random(`n${s}-${k}`) - 0.5) * 18 * (1 - k / 10) : 0;
  const flash = k < 3; // dois quadros invertidos na entrada, como um negativo revelando
  const fundo = tom === 'brasa' ? COR.brasa : COR.creme;
  return (
    <div
      style={{
        display: 'inline-block',
        background: flash ? COR.preto : fundo,
        color: flash ? fundo : COR.preto,
        fontSize: tam,
        fontWeight: 900,
        lineHeight: 1.05,
        padding: '8px 26px 10px',
        whiteSpace: 'nowrap',
        letterSpacing: -1,
        transform: `translateX(${tremor}px) scale(${escala})`,
        boxShadow: '0 18px 50px rgba(0,0,0,.55)',
      }}
    >
      {txt}
    </div>
  );
};

export const Legendas: React.FC = () => {
  const t = useT();
  const negativo = NEGATIVOS.find((n) => t >= n.linhas[0].s && t < n.e);
  const grande = GRANDES.find((g) => t >= g.s && t < g.e);
  const oculta = OCULTA.some(([s, e]) => t >= s && t < e) || t >= FIM_LEGENDA;

  const i = blocos.findIndex((b, j) => t >= b[0].s && t < Math.min(blocos[j + 1]?.[0].s ?? 999, b[b.length - 1].e + 0.6));
  const bloco = i >= 0 ? blocos[i] : null;
  const ativa = bloco ? [...bloco].reverse().find((p) => t >= p.s) : null;
  const mola = useMola(bloco ? bloco[0].s : 0, 15, 220);

  return (
    <AbsoluteFill style={{fontFamily: FONTE}}>
      {bloco && !oculta && (
        <div
          style={{
            position: 'absolute', left: 60, right: 60, top: 1340, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '6px 20px', fontSize: 76, fontWeight: 800, lineHeight: 1.12, textTransform: 'uppercase',
            transform: `translateY(${(1 - mola) * 24}px)`, opacity: Math.min(1, mola * 1.5),
          }}
        >
          {bloco.filter((p) => t >= p.s).map((p) => (
            <span
              key={p.s}
              style={{
                color: p === ativa ? COR.ambar : COR.creme,
                textShadow: '0 4px 18px rgba(0,0,0,.85), 0 0 2px rgba(0,0,0,.9)',
              }}
            >
              {p.w}
            </span>
          ))}
        </div>
      )}

      {negativo && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: negativo.linhas.length > 2 ? 1150 : 1290,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            opacity: janela(t, negativo.linhas[0].s, negativo.e, 0.01, 0.15),
          }}
        >
          {negativo.linhas.map((l) => (
            <LinhaNegativo key={l.s} txt={l.txt} s={l.s} tom={negativo.tom ?? 'creme'} tam={negativo.linhas.length > 2 ? 84 : 92} />
          ))}
        </div>
      )}

      {grande && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 1200, textAlign: 'center', whiteSpace: 'nowrap', fontSize: grande.tam, fontWeight: 900,
            color: grande.cor, letterSpacing: -2, textShadow: '0 10px 40px rgba(0,0,0,.8)',
            opacity: janela(t, grande.s, grande.e, 0.15, 0.2),
            transform: `scale(${interpolate(t, [grande.s, grande.e], [1.08, 1], clamp)})`,
          }}
        >
          {grande.txt}
        </div>
      )}
    </AbsoluteFill>
  );
};
