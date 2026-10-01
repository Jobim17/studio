import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {filtroCamera, Gradacao, useGradacao} from './Gradacao';
import {Legendas} from './Legendas';
import {Motions} from './Motions';
import {kf, useT, VIDEO} from './tema';

export const FPS = 60;
export const DURACAO_QUADROS = 6062; // 101,030 s × 60

// Enquadramento: push-in lento e punch-ins nas frases-chave, sempre ancorado no rosto (≈ x 510, y 520).
// Escala ≥ 1 em torno de um ponto interno nunca mostra borda preta. Volta a 1,00 antes do encerramento original.
const ZOOM: [number, number][] = [
  [0, 1.0], [5.6, 1.06], [8.5, 1.06], [9.2, 1.1], [9.96, 1.1], [10.9, 1.02], [18, 1.04], [25.2, 1.04], [25.9, 1.12],
  [30.2, 1.12], [30.9, 1.04], [42.4, 1.1], [43.3, 1.02], [48.5, 1.04], [49.4, 1.14], [50.9, 1.14], [51.7, 1.03],
  [64.4, 1.05], [68.5, 1.05], [69.2, 1.1], [69.98, 1.1], [70.8, 1.03], [92.4, 1.06], [94.0, 1.0],
];

export const JornadaGuru: React.FC = () => {
  const t = useT();
  const {g, frio} = useGradacao();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${kf(t, ZOOM)})`, transformOrigin: '510px 520px', filter: filtroCamera(g, frio)}}>
        <Video src={staticFile(VIDEO)} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
      <Gradacao />
      <Motions />
      <Legendas />
    </AbsoluteFill>
  );
};
