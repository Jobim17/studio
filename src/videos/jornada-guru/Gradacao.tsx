import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FIM_CAMADAS, kf, useT} from './tema';

// Intensidade geral da gradação (some antes do encerramento original) e quanto o trecho está "frio" (o custo).
export const useGradacao = () => {
  const t = useT();
  const g = kf(t, [[FIM_CAMADAS - 0.4, 1], [FIM_CAMADAS, 0]]);
  const frio = kf(t, [[30.34, 0], [31.6, 1], [42.5, 1], [43.2, 0.7], [48.5, 0.7], [49.4, 0]]) * g;
  return {g, frio};
};

// Filtro aplicado só ao contêiner da câmera.
export const filtroCamera = (g: number, frio: number) =>
  `contrast(${1 + 0.14 * g}) saturate(${1 - 0.1 * g - 0.32 * frio}) brightness(${1 - 0.05 * g - 0.13 * frio}) sepia(${0.2 * g * (1 - frio)})`;

const LUZES = [9.96, 48.86, 69.98];

export const Gradacao: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const {g, frio} = useGradacao();
  const barra = kf(t, [[0, 0], [0.8, 120], [9.96, 120], [10.8, 0], [30.34, 0], [31.2, 150], [48.86, 150], [49.7, 0]]);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* tom quente nas luzes, sombras cor de cobre */}
      <AbsoluteFill style={{background: '#FF7A2A', mixBlendMode: 'soft-light', opacity: 0.32 * g * (1 - frio)}} />
      <AbsoluteFill style={{background: '#3B1E0E', mixBlendMode: 'multiply', opacity: 0.2 * g * (1 - frio)}} />
      {/* o custo: frio e escuro */}
      <AbsoluteFill style={{background: '#1D2C4A', mixBlendMode: 'soft-light', opacity: 0.5 * frio}} />
      <AbsoluteFill style={{background: '#0A0F1A', mixBlendMode: 'multiply', opacity: 0.3 * frio}} />
      {/* vinheta */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 75% 60% at 50% 35%, transparent 40%, rgba(0,0,0,.8) 100%)',
          opacity: g * (0.85 + 0.15 * frio),
        }}
      />
      {/* feixes de luz nas viradas */}
      {LUZES.map((s) => {
        const p = (t - s) / 1.4;
        if (p < 0 || p > 1) return null;
        return (
          <AbsoluteFill
            key={s}
            style={{
              mixBlendMode: 'screen',
              opacity: Math.sin(Math.PI * p) * 0.6,
              background: `radial-gradient(circle at ${-30 + 160 * p}% 28%, rgba(255,175,90,.95), rgba(255,95,30,.45) 22%, transparent 55%)`,
            }}
          />
        );
      })}
      {/* granulado de filme */}
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.1 * g, mixBlendMode: 'overlay'}}>
        <filter id="grao">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grao)" />
      </svg>
      {/* barras de cinema */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: barra, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: barra, background: '#000'}} />
    </AbsoluteFill>
  );
};
