import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import type { PendulumParams } from '../physics/types';

export function createPendulumScene(
  m: SceneManager,
  p: PendulumParams,
  onProgress?: (v: number) => void
) {
  m.clearScene();
  m.setupEnvironment();
  m.setupLighting();

  const sc = 2.0;
  const ropeL = p.length * sc;
  const initRad = (p.angle * Math.PI) / 180;
  const omega = Math.sqrt(p.gravity / p.length);
  const pivotY = ropeL + 1;

  // Ground
  const gnd = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: m.theme.ground, roughness: 0.85 })
  );
  gnd.rotation.x = -Math.PI / 2;
  gnd.receiveShadow = true;
  m.scene.add(gnd);
  const grid = new THREE.GridHelper(40, 20, m.theme.gridStrong, m.theme.gridWeak);
  grid.position.y = 0.01;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  m.scene.add(grid);

  // Support beam
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.25, 2),
    new THREE.MeshStandardMaterial({ color: m.theme.structure, roughness: 0.4, metalness: 0.5 })
  );
  beam.position.set(0, pivotY, 0);
  beam.castShadow = true;
  m.scene.add(beam);

  // Pillars
  for (const xo of [-1.5, 1.5]) {
    const pil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, pivotY, 8),
      new THREE.MeshStandardMaterial({ color: m.theme.structure, roughness: 0.4, metalness: 0.5 })
    );
    pil.position.set(xo, pivotY / 2, 0);
    pil.castShadow = true;
    m.scene.add(pil);
  }

  // Pivot marker
  const pvt = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({ color: m.theme.trail, metalness: 0.7, roughness: 0.3 })
  );
  pvt.position.set(0, pivotY - 0.12, 0);
  m.scene.add(pvt);

  // Rope
  const ropeGeo = new THREE.CylinderGeometry(0.03, 0.03, ropeL, 8);
  const rope = new THREE.Mesh(ropeGeo, new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6 }));
  m.scene.add(rope);

  // Bob
  const bobR = 0.18 + p.mass * 0.035;
  const bob = new THREE.Mesh(
    new THREE.SphereGeometry(bobR, 32, 32),
    new THREE.MeshStandardMaterial({
      color: m.theme.object,
      roughness: 0.15,
      metalness: 0.6,
      emissive: m.theme.object,
      emissiveIntensity: 0.3,
    })
  );
  bob.castShadow = true;
  m.scene.add(bob);

  // Equilibrium line
  const eqLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, pivotY, 0),
      new THREE.Vector3(0, pivotY - ropeL - bobR, 0),
    ]),
    new THREE.LineDashedMaterial({
      color: m.theme.trail, dashSize: 0.2, gapSize: 0.15, transparent: true, opacity: 0.25,
    })
  );
  eqLine.computeLineDistances();
  m.scene.add(eqLine);

  // Trail
  const trailPts: THREE.Vector3[] = [];
  const maxTrail = 200;
  const trailGeo = new THREE.BufferGeometry();
  const trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({
    color: m.theme.object, transparent: true, opacity: 0.4,
  }));
  m.scene.add(trailLine);

  // Setup camera follow
  m.setCameraFollowTarget(bob, new THREE.Vector3(0, 1, ropeL * 1.2 + 4), new THREE.Vector3(0, pivotY * 0.2, 0));

  // Camera
  m.camera.position.set(0, pivotY * 0.5, ropeL * 1.5 + 4);
  m.camera.lookAt(new THREE.Vector3(0, pivotY * 0.45, 0));

  let simT = 0;
  const period = (2 * Math.PI) / omega;

  const animate = () => {
    m.animationId = requestAnimationFrame(animate);
    simT += 0.016;

    const theta = initRad * Math.cos(omega * simT) * Math.exp(-p.damping * simT * 0.5);
    const bx = Math.sin(theta) * ropeL;
    const by = pivotY - Math.cos(theta) * ropeL;

    bob.position.set(bx, by, 0);

    // Rope
    rope.position.set(bx / 2, pivotY - (pivotY - by) / 2, 0);
    rope.rotation.z = theta;

    // Trail
    trailPts.push(new THREE.Vector3(bx, by, 0));
    if (trailPts.length > maxTrail) trailPts.shift();
    trailGeo.setFromPoints(trailPts);

    if (onProgress) onProgress(Math.min(simT / (period * 3), 1));

    m.updateFollowCamera(0.04);
    m.renderer.render(m.scene, m.camera);
  };
  animate();
}
