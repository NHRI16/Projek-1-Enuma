import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface ThemeColors {
  background: number;
  fog: number;
  ground: number;
  gridStrong: number;
  gridWeak: number;
  ambient: number;
  object: number;
  trail: number;
  accent: number;
  structure: number;
  sky: number;
}

export const darkTheme: ThemeColors = {
  background: 0x1e293b,
  fog: 0x27364f,
  ground: 0x334155,
  gridStrong: 0x64748b,
  gridWeak: 0x475569,
  ambient: 0xffffff,
  object: 0x38bdf8,
  trail: 0xa5b4fc,
  accent: 0xfb923c,
  structure: 0x64748b,
  sky: 0x1e3a5f,
};

export const lightTheme: ThemeColors = {
  background: 0xe0f2fe,
  fog: 0xbae6fd,
  ground: 0xf0fdf4,
  gridStrong: 0x7dd3fc,
  gridWeak: 0xbae6fd,
  ambient: 0xffffff,
  object: 0x2563eb,
  trail: 0x7c3aed,
  accent: 0xf97316,
  structure: 0x6b7280,
  sky: 0x7dd3fc,
};

export type CameraMode = 'static' | 'follow';

export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  animationId: number | null = null;
  container: HTMLDivElement | null = null;
  theme: ThemeColors = darkTheme;
  cameraMode: CameraMode = 'static';
  cameraFollowTarget: THREE.Object3D | null = null;
  cameraFollowOffset: THREE.Vector3 = new THREE.Vector3(5, 3, 7);
  cameraLookOffset: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private _onCameraModeChange?: (mode: CameraMode) => void;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.9; // Brighter exposure

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  setTheme(isDark: boolean) {
    this.theme = isDark ? darkTheme : lightTheme;
  }

  onCameraModeChange(cb: (mode: CameraMode) => void) {
    this._onCameraModeChange = cb;
  }

  setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    this._onCameraModeChange?.(mode);
  }

  setCameraFollowTarget(target: THREE.Object3D, offset?: THREE.Vector3, lookOffset?: THREE.Vector3) {
    this.cameraFollowTarget = target;
    if (offset) this.cameraFollowOffset = offset;
    if (lookOffset) this.cameraLookOffset = lookOffset;
  }

  updateFollowCamera(lerpFactor = 0.05) {
    if (this.cameraMode !== 'follow' || !this.cameraFollowTarget) {
      this.controls.enabled = true;
      this.controls.update();
      return;
    }
    
    this.controls.enabled = false;
    const targetPos = this.cameraFollowTarget.position;
    const desiredPos = new THREE.Vector3(
      targetPos.x + this.cameraFollowOffset.x,
      targetPos.y + this.cameraFollowOffset.y,
      targetPos.z + this.cameraFollowOffset.z,
    );
    this.camera.position.lerp(desiredPos, lerpFactor);
    const lookTarget = new THREE.Vector3(
      targetPos.x + this.cameraLookOffset.x,
      targetPos.y + this.cameraLookOffset.y,
      targetPos.z + this.cameraLookOffset.z,
    );
    this.camera.lookAt(lookTarget);
  }

  mount(container: HTMLDivElement) {
    this.container = container;
    const rect = container.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    container.appendChild(this.renderer.domElement);
  }

  resize() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.renderer.setSize(rect.width, rect.height);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
  }

  clearScene() {
    this.stopAnimation();
    this.cameraFollowTarget = null;
    const dispose = (obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
      if (obj instanceof THREE.Line) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
      if (obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    };
    this.scene.traverse(dispose);
    this.scene.clear();
  }

  stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  dispose() {
    this.clearScene();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(this.theme.ambient, 1.8); // Brighter ambient
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffbe6, 2.8); // Brighter sun
    sun.position.set(12, 30, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0xbfdbfe, 1.2);
    fill.position.set(-10, 8, -8);
    this.scene.add(fill);

    // Backlight for rim-lighting effect
    const back = new THREE.DirectionalLight(0xfde68a, 0.8);
    back.position.set(-5, 15, -15);
    this.scene.add(back);

    // Hemisphere light for richer environment
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x86efac, 1.0);
    this.scene.add(hemi);
  }

  setupEnvironment() {
    this.scene.background = new THREE.Color(this.theme.background);
    this.scene.fog = new THREE.FogExp2(this.theme.fog, 0.003);
  }

  createGround(size = 120) {
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshStandardMaterial({
      color: this.theme.ground,
      roughness: 0.85,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const grid = new THREE.GridHelper(size, size / 2, this.theme.gridStrong, this.theme.gridWeak);
    grid.position.y = 0.01;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.4;
    this.scene.add(grid);
  }

  createAxes() {
    const len = 4;
    const colors = [0xef4444, 0x22c55e, 0x3b82f6];
    const dirs = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ];
    dirs.forEach((dir, i) => {
      const pts = [new THREE.Vector3(0, 0.02, 0), dir.clone().multiplyScalar(len).setY(dir.y * len || 0.02)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: colors[i], transparent: true, opacity: 0.6 });
      this.scene.add(new THREE.Line(geo, mat));
    });
  }
}
