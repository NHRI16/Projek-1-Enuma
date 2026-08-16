import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import type { InclinedPlaneParams } from '../physics/types';

export function createInclinedPlaneScene(
  m: SceneManager,
  p: InclinedPlaneParams,
  onProgress?: (v: number) => void
) {
  m.clearScene();
  m.setupEnvironment();
  m.setupLighting();
  m.createGround(120);

  const rad = (p.angle * Math.PI) / 180;
  const sc = 0.7;
  const planeL = p.length * sc;
  const planeH = planeL * Math.sin(rad);
  const planeW = planeL * Math.cos(rad);

  // Incline surface
  const incGeo = new THREE.BoxGeometry(planeL + 0.3, 0.18, 3.5);
  const inc = new THREE.Mesh(incGeo, new THREE.MeshStandardMaterial({
    color: m.theme.structure, roughness: 0.5, metalness: 0.3,
  }));
  inc.rotation.z = rad;
  inc.position.set(planeW / 2, planeH / 2, 0);
  inc.castShadow = true;
  inc.receiveShadow = true;
  m.scene.add(inc);

  // Angle arc
  const arcPts: THREE.Vector3[] = [];
  const arcR = 1.8;
  for (let a = 0; a <= rad; a += 0.03) {
    arcPts.push(new THREE.Vector3(Math.cos(a) * arcR, Math.sin(a) * arcR, 0));
  }
  const arc = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts),
    new THREE.LineBasicMaterial({ color: m.theme.accent, transparent: true, opacity: 0.6 })
  );
  arc.position.set(-0.1, 0.1, 0);
  m.scene.add(arc);

  // Block
  const bSize = 0.35 + p.mass * 0.045;
  const blockMat = new THREE.MeshStandardMaterial({
    color: m.theme.object,
    roughness: 0.15,
    metalness: 0.6,
    emissive: m.theme.object,
    emissiveIntensity: 0.3,
  });
  const block = new THREE.Mesh(new THREE.BoxGeometry(bSize, bSize, bSize * 1.1), blockMat);
  block.castShadow = true;
  m.scene.add(block);

  // Physics
  const Fpar = p.mass * p.gravity * Math.sin(rad);
  const N = p.mass * p.gravity * Math.cos(rad);
  const Ff = p.friction * N;
  const Fnet = Fpar - Ff;
  const accel = Fnet > 0 ? Fnet / p.mass : 0;

  // Force vectors (simple lines)
  const fvGroup = new THREE.Group();
  m.scene.add(fvGroup);

  // Gravity (down)
  const gLen = Math.min(p.mass * p.gravity * 0.06, 3);
  const gLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -gLen, 0)]),
    new THREE.LineBasicMaterial({ color: m.theme.accent })
  );
  fvGroup.add(gLine);

  // Normal (perpendicular to surface)
  const nLen = Math.min(N * 0.06, 2.5);
  const nLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-Math.sin(rad) * nLen, Math.cos(rad) * nLen, 0),
    ]),
    new THREE.LineBasicMaterial({ color: 0x22c55e })
  );
  fvGroup.add(nLine);

  // Friction (up the slope)
  if (p.friction > 0) {
    const fLen = Math.min(Ff * 0.06, 2);
    const fLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-Math.cos(rad) * fLen, Math.sin(rad) * fLen, 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0xa855f7 })
    );
    fvGroup.add(fLine);
  }

  // Trail
  const trailPts: THREE.Vector3[] = [];
  const trailGeo = new THREE.BufferGeometry();
  const trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({
    color: m.theme.object, transparent: true, opacity: 0.5,
  }));
  m.scene.add(trailLine);

  // Setup camera follow
  m.setCameraFollowTarget(block, new THREE.Vector3(4, 3, planeL * 0.5 + 5), new THREE.Vector3(0, -1, 0));

  // Camera
  m.camera.position.set(planeW * 0.4, planeH + 4, planeL * 0.7 + 5);
  m.camera.lookAt(new THREE.Vector3(planeW * 0.35, planeH * 0.3, 0));

  let simT = 0;
  let done = false;

  const animate = () => {
    m.animationId = requestAnimationFrame(animate);
    simT += 0.012;

    if (accel > 0 && !done) {
      const dist = 0.5 * accel * simT * simT;
      const prog = Math.min(dist / p.length, 1);
      const pos = prog * planeL;

      const bx = planeW - pos * Math.cos(rad);
      const by = planeH - pos * Math.sin(rad) + bSize / 2 + 0.1;

      block.position.set(bx, by, 0);
      block.rotation.z = rad;
      fvGroup.position.set(bx, by, 0);

      trailPts.push(new THREE.Vector3(bx, by, 0));
      trailGeo.setFromPoints(trailPts);

      if (prog >= 1) done = true;
      if (onProgress) onProgress(prog);
    } else if (accel <= 0) {
      // Stuck at top
      const bx = planeW;
      const by = planeH + bSize / 2 + 0.1;
      block.position.set(bx, by, 0);
      block.rotation.z = rad;
      fvGroup.position.set(bx, by, 0);
      if (onProgress) onProgress(0);
    }

    if (done && onProgress) onProgress(1);
    m.updateFollowCamera(0.04);
    m.renderer.render(m.scene, m.camera);
  };
  animate();
}
