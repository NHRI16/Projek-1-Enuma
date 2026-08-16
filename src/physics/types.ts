export type SimulationType = 'projectile' | 'freefall' | 'pendulum' | 'spring' | 'inclinedPlane';

export interface ProjectileParams {
  angle: number;
  velocity: number;
  mass: number;
  gravity: number;
  wind: number;
  friction: number;
}

export interface FreefallParams {
  height: number;
  mass: number;
  gravity: number;
  friction: number;
}

export interface PendulumParams {
  length: number;
  angle: number;
  mass: number;
  gravity: number;
  damping: number;
}

export interface SpringParams {
  springConstant: number;
  mass: number;
  displacement: number;
  damping: number;
  gravity: number;
}

export interface InclinedPlaneParams {
  angle: number;
  mass: number;
  gravity: number;
  friction: number;
  length: number;
}

export interface PhysicsResult {
  label: string;
  value: string;
  unit: string;
}

export interface SimulationConfig {
  id: SimulationType;
  name: string;
  shortName: string;
  description: string;
  formula: string[];
  notes: string[];
}
