import { useState, useCallback, useMemo, useEffect } from 'react';
import type { SimulationType, PhysicsResult } from './physics/types';
import {
  calculateProjectile, calculateFreefall,
  calculatePendulum, calculateSpring, calculateInclinedPlane,
} from './physics/calculations';
import { simulationConfigs } from './physics/configs';
import SimulationSelector from './components/SimulationSelector';
import ControlPanel from './components/ControlPanel';
import ResultsPanel from './components/ResultsPanel';
import FormulaPanel from './components/FormulaPanel';
import ThreeCanvas from './components/ThreeCanvas';
import ChallengeMode from './components/ChallengeMode';

const defaults: Record<SimulationType, Record<string, number>> = {
  projectile: { angle: 45, velocity: 20, mass: 2, gravity: 9.8, wind: 0, friction: 0 },
  freefall: { height: 30, mass: 5, gravity: 9.8, friction: 0 },
  pendulum: { length: 2, angle: 30, mass: 2, gravity: 9.8, damping: 0.1 },
  spring: { springConstant: 30, mass: 2, displacement: 1, damping: 0.2, gravity: 9.8 },
  inclinedPlane: { angle: 30, mass: 5, gravity: 9.8, friction: 0.2, length: 10 },
};

const planets = [
  { name: 'Bulan', g: 1.6 },
  { name: 'Mars', g: 3.7 },
  { name: 'Bumi', g: 9.8 },
  { name: 'Saturnus', g: 10.4 },
  { name: 'Neptunus', g: 11.2 },
  { name: 'Jupiter', g: 24.8 },
];

type MobileTab = 'parameter' | 'hasil' | 'edukasi';

function compute(simType: SimulationType, p: Record<string, number>): PhysicsResult[] {
  switch (simType) {
    case 'projectile': return calculateProjectile({ angle: p.angle, velocity: p.velocity, mass: p.mass, gravity: p.gravity, wind: p.wind, friction: p.friction });
    case 'freefall': return calculateFreefall({ height: p.height, mass: p.mass, gravity: p.gravity, friction: p.friction });
    case 'pendulum': return calculatePendulum({ length: p.length, angle: p.angle, mass: p.mass, gravity: p.gravity, damping: p.damping });
    case 'spring': return calculateSpring({ springConstant: p.springConstant, mass: p.mass, displacement: p.displacement, damping: p.damping, gravity: p.gravity });
    case 'inclinedPlane': return calculateInclinedPlane({ angle: p.angle, mass: p.mass, gravity: p.gravity, friction: p.friction, length: p.length });
  }
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [simType, setSimType] = useState<SimulationType>('projectile');
  const [params, setParams] = useState<Record<string, number>>(defaults.projectile);
  const [trigger, setTrigger] = useState(0);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('parameter');

  const config = simulationConfigs.find((c) => c.id === simType)!;
  const results = useMemo(() => compute(simType, params), [simType, params]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const selectSim = useCallback((s: SimulationType) => {
    setSimType(s);
    setParams({ ...defaults[s] });
    setProgress(0);
    setRunning(false);
    setTrigger((t) => t + 1);
  }, []);

  const changeParam = useCallback((k: string, v: number) => {
    setParams((prev) => ({ ...prev, [k]: v }));
  }, []);

  const run = useCallback(() => {
    setProgress(0);
    setRunning(true);
    setTrigger((t) => t + 1);
  }, []);

  const reset = useCallback(() => {
    setParams({ ...defaults[simType] });
    setProgress(0);
    setRunning(false);
    setTrigger((t) => t + 1);
  }, [simType]);

  const onProgress = useCallback((p: number) => setProgress(p), []);

  const tabBtn = (id: MobileTab, label: string) => (
    <button
      key={id}
      onClick={() => setMobileTab(id)}
      className="cursor-pointer"
      style={{
        flex: 1, padding: '10px 0', fontSize: '12px', fontWeight: mobileTab === id ? 600 : 400,
        color: mobileTab === id ? 'var(--accent)' : 'var(--text-tertiary)',
        background: 'none', border: 'none',
        borderBottom: mobileTab === id ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  const sidebarContent = (
    <>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <ControlPanel simType={simType} params={params} onChange={changeParam} onRun={run} onReset={reset} isRunning={running} />
      </div>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Hasil Perhitungan</h3>
        <ResultsPanel results={results} progress={progress} />
      </div>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <FormulaPanel simType={simType} />
      </div>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <ChallengeMode onSelectChallenge={selectSim} currentResults={results} />
      </div>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Gravitasi Planet</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          {planets.map((pl) => (
            <button key={pl.name} onClick={() => changeParam('gravity', pl.g)} className="cursor-pointer" style={{
              textAlign: 'center', padding: '8px 4px', borderRadius: '6px', fontSize: '11px',
              fontWeight: params.gravity === pl.g ? 600 : 400,
              background: params.gravity === pl.g ? 'var(--accent-bg)' : 'var(--bg)',
              border: `1px solid ${params.gravity === pl.g ? 'var(--accent-border)' : 'var(--border)'}`,
              color: params.gravity === pl.g ? 'var(--accent)' : 'var(--text-secondary)',
            }}>
              <div>{pl.name}</div>
              <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>{pl.g} m/s²</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Cara Penggunaan</h3>
        <ol style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
          <li>Pilih jenis simulasi di bagian atas.</li>
          <li>Atur parameter sesuai kebutuhan.</li>
          <li>Klik Mulai Simulasi untuk menjalankan.</li>
          <li>Amati animasi 3D dan hasil perhitungan.</li>
        </ol>
      </div>
    </>
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* ===== HEADER ===== */}
      <header style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)',
        gap: '8px', minHeight: '48px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: 700,
          }}>F</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            Lab Fisika 3D
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setDark(!dark)} className="cursor-pointer" style={{
            width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {dark ? '☀' : '☾'}
          </button>
          {/* Mobile only: toggle bottom panel */}
          <button onClick={() => setPanelOpen(!panelOpen)} className="cursor-pointer lg:hidden" style={{
            width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
            background: panelOpen ? 'var(--accent)' : 'var(--bg)',
            border: `1px solid ${panelOpen ? 'var(--accent)' : 'var(--border)'}`,
            color: panelOpen ? '#fff' : 'var(--text-secondary)', fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {panelOpen ? '✕' : '≡'}
          </button>
        </div>
      </header>

      {/* ===== SIM SELECTOR ===== */}
      <div style={{
        flexShrink: 0, padding: '8px 12px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        <SimulationSelector selected={simType} onSelect={selectSim} />
      </div>

      {/* ===== MAIN AREA ===== */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* --- 3D VIEWPORT --- */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          <div style={{ flex: 1, margin: '6px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
            <ThreeCanvas simType={simType} params={params} trigger={trigger} dark={dark} onProgress={onProgress} />

            {/* Overlay: sim name */}
            <div style={{
              position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--overlay)', backdropFilter: 'blur(8px)', borderRadius: '6px',
              padding: '4px 14px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 2,
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {config.name}
              </div>
            </div>

            {/* Overlay: status */}
            <div style={{
              position: 'absolute', bottom: '8px', left: '8px',
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'var(--overlay)', backdropFilter: 'blur(8px)', borderRadius: '4px',
              padding: '3px 8px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 2,
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: running ? 'var(--success)' : 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{running ? 'Berjalan' : 'Siap'}</span>
            </div>
          </div>

          {/* ===== MOBILE BOTTOM PANEL ===== */}
          <div className="lg:hidden" style={{
            flexShrink: 0,
            height: panelOpen ? 'min(55vh, 420px)' : '0px',
            transition: 'height 0.3s ease',
            overflow: 'hidden',
            borderTop: panelOpen ? '1px solid var(--border)' : 'none',
            background: 'var(--bg-secondary)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              {tabBtn('parameter', 'Parameter')}
              {tabBtn('hasil', 'Hasil')}
              {tabBtn('edukasi', 'Edukasi')}
            </div>
            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {mobileTab === 'parameter' && (
                <div style={{ padding: '14px' }}>
                  <ControlPanel simType={simType} params={params} onChange={changeParam} onRun={run} onReset={reset} isRunning={running} />
                  <div style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Gravitasi Planet</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      {planets.map((pl) => (
                        <button key={pl.name} onClick={() => changeParam('gravity', pl.g)} className="cursor-pointer" style={{
                          textAlign: 'center', padding: '8px 4px', borderRadius: '6px', fontSize: '11px',
                          fontWeight: params.gravity === pl.g ? 600 : 400,
                          background: params.gravity === pl.g ? 'var(--accent-bg)' : 'var(--bg)',
                          border: `1px solid ${params.gravity === pl.g ? 'var(--accent-border)' : 'var(--border)'}`,
                          color: params.gravity === pl.g ? 'var(--accent)' : 'var(--text-secondary)',
                        }}>
                          <div>{pl.name}</div>
                          <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>{pl.g} m/s²</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {mobileTab === 'hasil' && (
                <div style={{ padding: '14px' }}>
                  <ResultsPanel results={results} progress={progress} />
                </div>
              )}
              {mobileTab === 'edukasi' && (
                <div style={{ padding: '14px' }}>
                  <FormulaPanel simType={simType} defaultOpen />
                  <div style={{ marginTop: '16px' }}>
                    <ChallengeMode onSelectChallenge={selectSim} currentResults={results} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== DESKTOP SIDEBAR ===== */}
        <aside className="hidden lg:flex" style={{
          width: '340px', flexShrink: 0,
          borderLeft: '1px solid var(--border)', background: 'var(--bg-secondary)',
          flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sidebarContent}
          </div>
        </aside>
      </div>
    </div>
  );
}
