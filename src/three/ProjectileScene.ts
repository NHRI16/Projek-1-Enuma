import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import type { ProjectileParams } from '../physics/types';

export function createProjectileScene(
  m: SceneManager,
  p: ProjectileParams,
  onProgress?: (v: number) => void
) {
  m.clearScene();
  m.setupEnvironment();
  m.setupLighting();
  m.createGround(120);
  m.createAxes();

  const rad = (p.angle * Math.PI) / 180;
  const vx0 = p.velocity * Math.cos(rad);
  const vy0 = p.velocity * Math.sin(rad);
  const tTotal = (2 * vy0) / p.gravity;
  const sc = 0.3;

  // Ball
  const ballGeo = new THREE.SphereGeometry(0.35, 32, 32);
  const ballMat = new THREE.MeshStandardMaterial({
    color: m.theme.object,
    roughness: 0.15,
    metalness: 0.6,
    emissive: m.theme.object,
    emissiveIntensity: 0.3,
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.castShadow = true;
  ball.position.set(0, 0.35, 0);
  m.scene.add(ball);

  // Trail
  const trailPts: THREE.Vector3[] = [];
  const trailGeo = new THREE.BufferGeometry();
  const trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({
    color: m.theme.trail, transparent: true, opacity: 0.85,
  }));
  m.scene.add(trailLine);

  // Pre-computed ghost trajectory
  const ghostPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * tTotal;
    const x = (vx0 * t + 0.5 * p.wind * t * t) * sc;
    const y = Math.max((vy0 * t - 0.5 * p.gravity * t * t) * sc, 0);
    ghostPts.push(new THREE.Vector3(x, y + 0.03, 0));
  }
  const ghostGeo = new THREE.BufferGeometry().setFromPoints(ghostPts);
  const ghostLine = new THREE.Line(ghostGeo, new THREE.LineDashedMaterial({
    color: m.theme.trail, dashSize: 0.25, gapSize: 0.15, transparent: true, opacity: 0.3,
  }));
  ghostLine.computeLineDistances();
  m.scene.add(ghostLine);

  // Landing marker
  const landX = (vx0 * tTotal + 0.5 * p.wind * tTotal * tTotal) * sc;
  const ringGeo = new THREE.RingGeometry(0.3, 0.5, 32);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
    color: m.theme.accent, side: THREE.DoubleSide, transparent: true, opacity: 0.5,
  }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(landX, 0.02, 0);
  m.scene.add(ring);

  // Launcher tube
  const tubeGeo = new THREE.CylinderGeometry(0.07, 0.12, 2.0, 12);
  const tube = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({
    color: m.theme.structure, metalness: 0.6, roughness: 0.3,
  }));
  tube.position.set(0.5 * Math.cos(rad), 0.5 * Math.sin(rad) + 0.1, 0);
  tube.rotation.z = rad - Math.PI / 2;
  tube.castShadow = true;
  m.scene.add(tube);

  // Setup camera follow
  m.setCameraFollowTarget(ball, new THREE.Vector3(3, 3, 8), new THREE.Vector3(0, 0, 0));

  // Camera
  const hMax = (vy0 * vy0) / (2 * p.gravity) * sc;
  const dist = Math.max(Math.abs(landX), hMax, 8) * 1.1;
  m.camera.position.set(landX * 0.35, Math.max(hMax * 1.4, 4), dist * 0.75);
  m.camera.lookAt(new THREE.Vector3(landX * 0.35, hMax * 0.35, 0));

  let simT = 0;

  const animate = () => {
    m.animationId = requestAnimationFrame(animate);
    simT += 0.016;

    if (simT <= tTotal) {
      const damp = Math.exp(-p.friction * simT);
      const x = (vx0 * simT + 0.5 * p.wind * simT * simT) * sc * damp;
      const y = Math.max((vy0 * simT - 0.5 * p.gravity * simT * simT) * sc, 0.35);
      ball.position.set(x, y, 0);
      ball.rotation.x += 0.03;
      trailPts.push(new THREE.Vector3(x, y, 0));
      trailGeo.setFromPoints(trailPts);
      if (onProgress) onProgress(simT / tTotal);
    } else {
      ball.position.set(landX, 0.35, 0);
      if (onProgress) onProgress(1);
    }

    m.updateFollowCamera(0.05);
    m.renderer.render(m.scene, m.camera);
  };
  animate();
}
