import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {clamp, COR, FONTE, janela, kf, useMola, useT} from './tema';

// Todos os elementos ficam na faixa y 960–1290 (sobre o peito). O queixo chega a y ≈ 910 no punch-in máximo (1,14).

const vidro: React.CSSProperties = {
  background: 'rgba(11,9,7,.62)',
  border: '1.5px solid rgba(242,163,58,.35)',
  borderRadius: 20,
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 60px rgba(0,0,0,.5)',
};

const rotulo: React.CSSProperties = {fontSize: 30, fontWeight: 600, letterSpacing: 7, textTransform: 'uppercase'};

// Bloco centrado que aparece numa janela [s, e] com mola.
const Bloco: React.FC<{s: number; e: number; top: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  s, e, top, children, style,
}) => {
  const t = useT();
  const m = useMola(s);
  if (t < s || t > e) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center',
        opacity: janela(t, s, e), transform: `translateY(${(1 - m) * 40}px) scale(${0.92 + 0.08 * m})`,
      }}
    >
      <div style={style}>{children}</div>
    </div>
  );
};

const Aparece: React.FC<{s: number; children: React.ReactNode; style?: React.CSSProperties}> = ({s, children, style}) => {
  const t = useT();
  const m = useMola(s, 14, 170);
  if (t < s) return null;
  return <div style={{...style, opacity: Math.min(1, m * 1.4), transform: `translateY(${(1 - m) * 20}px)`}}>{children}</div>;
};

const Contador: React.FC<{s: number; ate: number; dur?: number}> = ({s, ate, dur = 0.9}) => {
  const t = useT();
  return <>{Math.round(kf(t, [[s, 0], [s + dur, ate]]))}</>;
};

const Pessoa: React.FC<{acesa: number}> = ({acesa}) => (
  <svg width="62" height="78" viewBox="0 0 62 78" style={{opacity: 0.25 + 0.75 * acesa, transform: `scale(${0.85 + 0.15 * acesa})`}}>
    <circle cx="31" cy="20" r="15" fill={acesa > 0.5 ? COR.ambar : COR.creme} />
    <path d="M4 78 C6 52 18 42 31 42 C44 42 56 52 58 78 Z" fill={acesa > 0.5 ? COR.ambar : COR.creme} />
  </svg>
);

// Barra de missão R$ 50 mil → R$ 200 mil.
const BarraMissao: React.FC<{s: number; e: number; enche: [number, number]; alvo: number; selo?: number}> = ({s, e, enche, alvo, selo}) => {
  const t = useT();
  const m = useMola(s);
  if (t < s || t > e) return null;
  const fill = kf(t, [[s, 0], [s + 0.6, 25], [enche[0], 25], [enche[1], 100]]);
  const alvoOn = interpolate(t, [alvo, alvo + 0.3], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1030, opacity: janela(t, s, e), transform: `translateY(${(1 - m) * 30}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 46, fontWeight: 800, color: COR.creme, marginBottom: 14}}>
        <span>R$ 50 MIL</span>
        <span style={{color: COR.ambar, opacity: alvoOn, transform: `scale(${0.8 + 0.2 * alvoOn})`}}>R$ 200 MIL</span>
      </div>
      <div style={{height: 26, borderRadius: 13, background: 'rgba(244,233,216,.18)', overflow: 'hidden', border: '1.5px solid rgba(244,233,216,.25)'}}>
        <div
          style={{
            width: `${fill}%`, height: '100%', borderRadius: 13,
            background: `linear-gradient(90deg, ${COR.brasa}, ${COR.ambar})`, boxShadow: `0 0 30px ${COR.ambar}`,
          }}
        />
      </div>
      {selo !== undefined && (
        <Aparece s={selo} style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
          <div style={{...rotulo, background: COR.ambar, color: COR.preto, padding: '10px 24px', fontWeight: 800}}>Ainda este ano</div>
        </Aparece>
      )}
    </div>
  );
};

const Rolo: React.FC = () => {
  const t = useT();
  const passo = kf(t, [[56.82, 0], [57.36, 0], [57.6, 1], [57.82, 1], [58.06, 2]]);
  return (
    <span style={{display: 'inline-block', height: 130, overflow: 'hidden', verticalAlign: 'bottom'}}>
      <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-passo * 130}px)`}}>
        {[200, 300, 400].map((n) => (
          <span key={n} style={{height: 130, lineHeight: '130px'}}>{n}</span>
        ))}
      </span>
    </span>
  );
};

const Seguir: React.FC = () => {
  const t = useT();
  const apertado = t >= 94.0;
  const clique = kf(t, [[93.85, 1], [93.95, 0.9], [94.1, 1]]);
  return (
    <div
      style={{
        fontSize: 44, fontWeight: 800, padding: '20px 64px', borderRadius: 16, transform: `scale(${clique})`,
        background: apertado ? COR.grafite : COR.ambar, color: apertado ? COR.creme : COR.preto,
        border: apertado ? '2px solid rgba(244,233,216,.4)' : 'none',
      }}
    >
      {apertado ? 'SEGUINDO ✓' : 'SEGUIR'}
    </div>
  );
};

export const Motions: React.FC = () => {
  const t = useT();
  const risco = kf(t, [[6.9, 0], [7.25, 100]]);

  return (
    <AbsoluteFill style={{fontFamily: FONTE, color: COR.creme, transform: 'translateY(45px)'}}>
      {/* 1. gancho */}
      <Bloco s={1.1} e={3.45} top={980} style={{...rotulo, color: COR.ambar}}>
        Há 3 anos
      </Bloco>

      {/* 2. 6 meses → 3+ anos */}
      <Bloco s={6.06} e={9.9} top={950} style={{display: 'flex', alignItems: 'center', gap: 30}}>
        <span style={{position: 'relative', fontSize: 72, fontWeight: 800, opacity: 1 - 0.45 * (risco / 100)}}>
          6 MESES
          <span style={{position: 'absolute', left: -6, top: '52%', height: 9, width: `calc(${risco}% + 12px)`, background: COR.brasa, transform: 'rotate(-4deg)'}} />
        </span>
        <Aparece s={7.24} style={{fontSize: 100, fontWeight: 900, color: COR.ambar}}>
          → 3+ ANOS
        </Aparece>
      </Bloco>

      {/* 3. conquistas */}
      <Bloco s={10.36} e={18.3} top={915} style={{...vidro, padding: '22px 40px', minWidth: 640}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <span style={{fontSize: 64, fontWeight: 900, color: COR.ambar}}>17</span>
          <span style={{...rotulo, color: COR.creme}}>anos de idade</span>
        </div>
        <Aparece s={13.22} style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 6}}>
          <span style={{fontSize: 64, fontWeight: 900}}>
            R$ <Contador s={13.22} ate={300} /> MIL
          </span>
          <span style={{...rotulo, color: COR.ambar}}>/ mês</span>
        </Aparece>
        <Aparece s={15.28} style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 6}}>
          <span style={{fontSize: 64, fontWeight: 900}}>
            R$ <Contador s={15.28} ate={50} dur={0.7} /> MIL
          </span>
          <span style={{...rotulo, color: COR.ambar}}>líquido</span>
        </Aparece>
      </Bloco>

      {/* 4. carro */}
      <Bloco s={19.32} e={21.6} top={985} style={{...vidro, padding: '22px 44px', textAlign: 'center'}}>
        <div style={{fontSize: 50, fontWeight: 900}}>O CARRO DOS SONHOS</div>
        <Aparece s={20.54} style={{...rotulo, color: COR.ambar, marginTop: 6}}>
          aos 17 anos
        </Aparece>
      </Bloco>

      {/* 5. equipe */}
      <Bloco s={22.96} e={24.3} top={960} style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <span style={{fontSize: 92, fontWeight: 900, color: COR.ambar}}>+8</span>
        <div style={{display: 'flex', gap: 8}}>
          {Array.from({length: 8}, (_, i) => (
            <Pessoa key={i} acesa={interpolate(t, [23.0 + i * 0.07, 23.12 + i * 0.07], [0, 1], clamp)} />
          ))}
        </div>
      </Bloco>

      {/* 7. o custo */}
      <Bloco s={33.04} e={35.3} top={990} style={{...rotulo, color: COR.brasa, fontWeight: 800}}>
        o que ninguém te conta
      </Bloco>

      {/* 8. a dúvida (números como foram falados) */}
      <Bloco s={44.46} e={46.6} top={970} style={{display: 'flex', alignItems: 'center', gap: 22, fontSize: 66, fontWeight: 900}}>
        <span>R$ 300 MIL</span>
        <Aparece s={45.72} style={{color: COR.brasa}}>
          → R$ 20 MIL
        </Aparece>
      </Bloco>

      {/* 10. 200 → 300 → 400 */}
      <Bloco s={56.82} e={59.9} top={930} style={{textAlign: 'center'}}>
        <div style={{fontSize: 120, fontWeight: 900, color: COR.ambar, lineHeight: '130px'}}>
          R$ <Rolo /> MIL
        </div>
        <div style={{...rotulo, marginTop: 8}}>no bolso · por mês</div>
      </Bloco>

      {/* 11. */}
      <Bloco s={63.0} e={63.85} top={990} style={{...rotulo, color: COR.ambar}}>
        17 anos
      </Bloco>

      {/* 12. */}
      <Bloco s={65.7} e={68.85} top={975} style={{...vidro, padding: '20px 40px', textAlign: 'center'}}>
        <div style={{fontSize: 60, fontWeight: 900}}>R$ 50 MIL / MÊS</div>
        <Aparece s={66.6} style={{...rotulo, color: COR.ambar, marginTop: 6}}>
          já tá ótimo
        </Aparece>
      </Bloco>

      {/* 13. a missão */}
      <Bloco s={70.48} e={77.9} top={935} style={{...rotulo, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 14}}>
        <span style={{width: 22, height: 22, borderRadius: 11, background: COR.brasa, opacity: Math.floor(t * 2) % 2 ? 0.35 : 1}} />
        documentando
      </Bloco>
      <BarraMissao s={73.28} e={77.9} enche={[200, 201]} alvo={74.16} selo={76.94} />

      {/* 14. dois caminhos */}
      <Bloco s={82.72} e={87.1} top={960} style={{...vidro, padding: '22px 44px', textAlign: 'center'}}>
        <div style={{...rotulo}}>se o seu sonho é</div>
        <div style={{fontSize: 70, fontWeight: 900, color: COR.ambar}}>R$ 50 MIL</div>
        <Aparece s={85.7} style={{fontSize: 40, fontWeight: 800}}>
          → EU TE ENSINO
        </Aparece>
      </Bloco>
      <Bloco s={88.0} e={91.3} top={960} style={{...vidro, padding: '22px 44px', textAlign: 'center'}}>
        <div style={{...rotulo}}>se o seu sonho é</div>
        <Aparece s={88.34} style={{fontSize: 70, fontWeight: 900, color: COR.ambar}}>
          PASSAR DOS 50
        </Aparece>
        <Aparece s={90.26} style={{fontSize: 40, fontWeight: 800}}>
          → ACOMPANHA AQUI
        </Aparece>
      </Bloco>
      <BarraMissao s={91.48} e={92.95} enche={[91.6, 92.36]} alvo={92.36} />

      {/* 15. CTA */}
      <Bloco s={93.7} e={97.0} top={950} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Seguir />
        <Aparece s={94.32} style={{...rotulo, fontWeight: 800}}>
          compartilha com seu <span style={{color: t >= 95.5 ? COR.ambar : COR.creme}}>sócio</span>
        </Aparece>
      </Bloco>
    </AbsoluteFill>
  );
};
