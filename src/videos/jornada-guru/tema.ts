import {loadFont} from '@remotion/google-fonts/Montserrat';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const {fontFamily: FONTE} = loadFont('normal', {weights: ['600', '800', '900'], subsets: ['latin', 'latin-ext']});

export const COR = {
  preto: '#0B0907',
  grafite: '#1A1612',
  ambar: '#F2A33A',
  brasa: '#E2552D',
  creme: '#F4E9D8',
};

export const VIDEO = '001. Reels Teste/video/video.mp4';
export const DURACAO_S = 101.030227;
// A partir daqui o próprio vídeo traz o encerramento ("A final / O que é ser rico?"): nada por cima.
export const FIM_CAMADAS = 97.4;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const suave = Easing.inOut(Easing.cubic);

export const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

// Interpola por pontos-chave [segundo, valor] com curva suave em cada trecho.
export const kf = (t: number, pts: [number, number][]) =>
  interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), {...clamp, easing: suave});

// Opacidade de uma janela [s, e] com entrada e saída curtas.
export const janela = (t: number, s: number, e: number, entra = 0.2, sai = 0.25) =>
  Math.min(interpolate(t, [s, s + entra], [0, 1], clamp), interpolate(t, [e - sai, e], [1, 0], clamp));

// Mola que começa no segundo `s`.
export const useMola = (s: number, damping = 16, stiffness = 150) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - s * fps, fps, config: {damping, stiffness}});
};
