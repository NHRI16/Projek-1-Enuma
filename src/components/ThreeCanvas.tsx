import { useRef, useEffect, useCallback, useState } from 'react';
import { SceneManager } from '../three/SceneManager';
import type { CameraMode } from '../three/SceneManager';
import type { SimulationType } from '../physics/types';
import { createProjectileScene } from '../three/ProjectileScene';
import { createFreefallScene } from '../three/FreefallScene';
import { createPendulumScene } from '../three/PendulumScene';
import { createSpringScene } from '../three/SpringScene';
import { createInclinedPlaneScene } from '../three/InclinedPlaneScene';

interface Props {
  simType: SimulationType;
  params: Record<string, number>;
  trigger: number;
  dark: boolean;
  onProgress: (v: number) => void;
}

function dispatch(
  mgr: SceneManager,
  st: SimulationType,
  p: Record<string, number>,
  cb: (v: number) => void,
) {
  mgr.clearScene();
  const g = (k: string) => p[k] ?? 0;
  switch (st) {
    case 'projectile':
      createProjectileScene(mgr, { angle: g('angle'), velocity: g('velocity'), mass: g('mass'), gravity: g('gravity'), wind: g('wind'), friction: g('friction') }, cb);
      break;
    case 'freefall':
      createFreefallScene(mgr, { height: g('height'), mass: g('mass'), gravity: g('gravity'), friction: g('friction') }, cb);
      break;
    case 'pendulum':
      createPendulumScene(mgr, { length: g('length'), angle: g('angle'), mass: g('mass'), gravity: g('gravity'), damping: g('damping') }, cb);
      break;
    case 'spring':
      createSpringScene(mgr, { springConstant: g('springConstant'), mass: g('mass'), displacement: g('displacement'), damping: g('damping'), gravity: g('gravity') }, cb);
      break;
    case 'inclinedPlane':
      createInclinedPlaneScene(mgr, { angle: g('angle'), mass: g('mass'), gravity: g('gravity'), friction: g('friction'), length: g('length') }, cb);
      break;
  }
}

export default function ThreeCanvas({ simType, params, trigger, dark, onProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mgrRef = useRef<SceneManager | null>(null);
  const latestRef = useRef({ simType, params, trigger, dark, onProgress });
  latestRef.current = { simType, params, trigger, dark, onProgress };
  const [cameraMode, setCameraMode] = useState<CameraMode>('static');

  const launch = useCallback(() => {
    const mgr = mgrRef.current;
    if (!mgr) return;
    const cur = latestRef.current;
    mgr.setTheme(cur.dark);
    mgr.resize();
    dispatch(mgr, cur.simType, cur.params, cur.onProgress);
  }, []);

  const toggleCameraMode = useCallback(() => {
    const mgr = mgrRef.current;
    if (!mgr) return;
    const newMode = mgr.cameraMode === 'static' ? 'follow' : 'static';
    mgr.setCameraMode(newMode);
    setCameraMode(newMode);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const mgr = new SceneManager();
    mgr.mount(el);
    mgr.onCameraModeChange((mode) => setCameraMode(mode));
    mgrRef.current = mgr;

    const ro = new ResizeObserver(() => mgr.resize());
    ro.observe(el);

    const raf = requestAnimationFrame(() => {
      mgr.resize();
      launch();
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mgr.dispose();
      mgrRef.current = null;
    };
  }, [launch]);

  useEffect(() => {
    launch();
  }, [trigger, simType, dark, launch]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '200px', overflow: 'hidden', position: 'relative' }}>
      {/* Camera mode toggle button */}
      <button
        onClick={toggleCameraMode}
        className="cursor-pointer"
        title={cameraMode === 'static' ? 'Aktifkan kamera ikuti objek' : 'Kembali ke kamera bebas'}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: `1.5px solid ${cameraMode === 'follow' ? 'var(--accent)' : 'var(--border)'}`,
          background: cameraMode === 'follow'
            ? 'var(--accent)'
            : 'var(--overlay)',
          backdropFilter: 'blur(10px)',
          color: cameraMode === 'follow' ? '#fff' : 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: cameraMode === 'follow'
            ? '0 2px 12px rgba(59,130,246,0.3)'
            : '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <span style={{ fontSize: '14px' }}>{cameraMode === 'follow' ? '🎥' : '📷'}</span>
        <span>{cameraMode === 'follow' ? 'Ikuti Objek' : 'Kamera Bebas'}</span>
      </button>
    </div>
  );
}
