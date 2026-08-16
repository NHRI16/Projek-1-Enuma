import type {
  ProjectileParams,
  FreefallParams,
  PendulumParams,
  SpringParams,
  InclinedPlaneParams,
  PhysicsResult,
} from './types';

export function calculateProjectile(p: ProjectileParams): PhysicsResult[] {
  const rad = (p.angle * Math.PI) / 180;
  const vx = p.velocity * Math.cos(rad);
  const vy = p.velocity * Math.sin(rad);
  const t = (2 * vy) / p.gravity;
  const H = (vy * vy) / (2 * p.gravity);
  const R = vx * t + 0.5 * p.wind * t * t;

  return [
    { label: 'Waktu Tempuh', value: t.toFixed(2), unit: 's' },
    { label: 'Tinggi Maks', value: H.toFixed(2), unit: 'm' },
    { label: 'Jarak Horizontal', value: Math.abs(R).toFixed(2), unit: 'm' },
    { label: 'Kec. Awal X', value: vx.toFixed(2), unit: 'm/s' },
    { label: 'Kec. Awal Y', value: vy.toFixed(2), unit: 'm/s' },
    { label: 'Energi Kinetik', value: (0.5 * p.mass * p.velocity * p.velocity).toFixed(1), unit: 'J' },
  ];
}

export function calculateFreefall(p: FreefallParams): PhysicsResult[] {
  const t = Math.sqrt((2 * p.height) / p.gravity);
  const vf = p.gravity * t;

  return [
    { label: 'Waktu Jatuh', value: t.toFixed(2), unit: 's' },
    { label: 'Kec. Akhir', value: vf.toFixed(2), unit: 'm/s' },
    { label: 'Energi Kinetik', value: (0.5 * p.mass * vf * vf).toFixed(1), unit: 'J' },
    { label: 'Energi Potensial', value: (p.mass * p.gravity * p.height).toFixed(1), unit: 'J' },
    { label: 'Momentum', value: (p.mass * vf).toFixed(2), unit: 'kg·m/s' },
  ];
}

export function calculatePendulum(p: PendulumParams): PhysicsResult[] {
  const T = 2 * Math.PI * Math.sqrt(p.length / p.gravity);
  const f = 1 / T;
  const w = 2 * Math.PI * f;
  const rad = (p.angle * Math.PI) / 180;
  const hMax = p.length * (1 - Math.cos(rad));
  const vMax = Math.sqrt(2 * p.gravity * hMax);

  return [
    { label: 'Periode', value: T.toFixed(3), unit: 's' },
    { label: 'Frekuensi', value: f.toFixed(3), unit: 'Hz' },
    { label: 'Frek. Sudut', value: w.toFixed(3), unit: 'rad/s' },
    { label: 'Tinggi Maks', value: hMax.toFixed(3), unit: 'm' },
    { label: 'Kec. Maks', value: vMax.toFixed(3), unit: 'm/s' },
    { label: 'Energi Total', value: (p.mass * p.gravity * hMax).toFixed(3), unit: 'J' },
  ];
}

export function calculateSpring(p: SpringParams): PhysicsResult[] {
  const w = Math.sqrt(p.springConstant / p.mass);
  const T = (2 * Math.PI) / w;
  const f = 1 / T;
  const vMax = w * Math.abs(p.displacement);
  const Ep = 0.5 * p.springConstant * p.displacement * p.displacement;
  const Fmax = p.springConstant * Math.abs(p.displacement);

  return [
    { label: 'Periode', value: T.toFixed(3), unit: 's' },
    { label: 'Frekuensi', value: f.toFixed(3), unit: 'Hz' },
    { label: 'Frek. Sudut', value: w.toFixed(3), unit: 'rad/s' },
    { label: 'Kec. Maks', value: vMax.toFixed(3), unit: 'm/s' },
    { label: 'Energi Pegas', value: Ep.toFixed(3), unit: 'J' },
    { label: 'Gaya Maks', value: Fmax.toFixed(3), unit: 'N' },
  ];
}

export function calculateInclinedPlane(p: InclinedPlaneParams): PhysicsResult[] {
  const rad = (p.angle * Math.PI) / 180;
  const Fpar = p.mass * p.gravity * Math.sin(rad);
  const N = p.mass * p.gravity * Math.cos(rad);
  const Ff = p.friction * N;
  const Fnet = Fpar - Ff;
  const a = Fnet > 0 ? Fnet / p.mass : 0;
  const vf = a > 0 ? Math.sqrt(2 * a * p.length) : 0;
  const t = a > 0 ? vf / a : 0;

  return [
    { label: 'Gaya Gravitasi ∥', value: Fpar.toFixed(2), unit: 'N' },
    { label: 'Gaya Normal', value: N.toFixed(2), unit: 'N' },
    { label: 'Gaya Gesek', value: Ff.toFixed(2), unit: 'N' },
    { label: 'Gaya Neto', value: Fnet.toFixed(2), unit: 'N' },
    { label: 'Percepatan', value: a.toFixed(3), unit: 'm/s²' },
    { label: 'Kec. Akhir', value: vf.toFixed(2), unit: 'm/s' },
    { label: 'Waktu', value: t > 0 ? t.toFixed(2) : '—', unit: t > 0 ? 's' : '' },
  ];
}
