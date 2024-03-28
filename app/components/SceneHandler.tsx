import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';

export class SceneHandler {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  // floorGeometry: THREE.BufferGeometry;
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute;
  vertex: THREE.Vector3;
  time: number;
  prevTime: number;
  controls: PointerLockControls;
  floor: THREE.Mesh;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  canJump = true;
  constructor() {
    this.time = 0;
    this.prevTime = 0;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.y = 10;
    document.body.addEventListener('click', () => {
      this.controls.lock();
    });
    // this.camera.position.set(0.8, 1.4, 1.0);

    this.controls = new PointerLockControls(this.camera, document.body);
    this.controls.lock();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.PointLight(0xffffff, 20);
    light.position.set(0.8, 1.4, 1.0);
    this.scene.add(light);
    const light2 = new THREE.PointLight(0xffffff, 50);
    light2.position.set(-5, 0, -1);
    this.scene.add(light2);

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;

        case 'Space':
          if (this.canJump === true) this.velocity.y += 350;
          this.canJump = false;
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );

    let floorGeometry: THREE.BufferGeometry = new THREE.PlaneGeometry(
      2000,
      2000,
      100,
      100
    );
    floorGeometry.rotateX(-Math.PI / 2);

    this.position = floorGeometry.attributes.position;
    this.vertex = new THREE.Vector3();
    for (let i = 0, l = this.position.count; i < l; i++) {
      this.vertex.fromBufferAttribute(this.position, i);

      this.vertex.x += Math.random() * 20 - 10;
      this.vertex.y += Math.random() * 2;
      this.vertex.z += Math.random() * 20 - 10;

      this.position.setXYZ(i, this.vertex.x, this.vertex.y, this.vertex.z);
    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    this.position = floorGeometry.attributes.position;
    const colorsFloor = [];
    const color = new THREE.Color();

    for (let i = 0, l = this.position.count; i < l; i++) {
      color.setHSL(
        Math.random() * 0.3 + 0.5,
        0.75,
        Math.random() * 0.25 + 0.75,
        THREE.SRGBColorSpace
      );
      colorsFloor.push(color.r, color.g, color.b);
    }

    floorGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colorsFloor, 3)
    );

    const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.scene.add(this.floor);

    this.scene.add(this.controls.getObject());

    // this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  animate() {
    this.time = performance.now();
    if (this.controls.isLocked === true) {
      this.raycaster.ray.origin.copy(this.controls.getObject().position);
      this.raycaster.ray.origin.y -= 10;

      // const intersections = this.raycaster.intersectObjects(
      //   this.objects,
      //   false
      // );

      // const onObject = intersections.length > 0;

      const delta = (this.time - this.prevTime) / 1000;

      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;

      this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize(); // this ensures consistent movements in all directions

      if (this.moveForward || this.moveBackward)
        this.velocity.z -= this.direction.z * 400.0 * delta;
      if (this.moveLeft || this.moveRight)
        this.velocity.x -= this.direction.x * 400.0 * delta;

      // if (onObject === true) {
      //   this.velocity.y = Math.max(0, this.velocity.y);
      //   this.canJump = true;
      // }

      this.controls.moveRight(-this.velocity.x * delta);
      this.controls.moveForward(-this.velocity.z * delta);

      this.controls.getObject().position.y += this.velocity.y * delta; // new behavior

      if (this.controls.getObject().position.y < 10) {
        this.velocity.y = 0;
        this.controls.getObject().position.y = 10;

        this.canJump = true;
      }
    }
    this.prevTime = this.time;
    this.renderer.render(this.scene, this.camera);
  }
}
