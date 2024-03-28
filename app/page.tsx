'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import { SceneHandler } from './components/SceneHandler';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // const scene = new THREE.Scene();
      // // scene.add(new THREE.AxesHelper(5));

      // const light = new THREE.PointLight(0xffffff, 20);
      // light.position.set(0.8, 1.4, 1.0);
      // scene.add(light);
      // const light2 = new THREE.PointLight(0xffffff, 50);
      // light2.position.set(-5, 0, -1);
      // scene.add(light2);

      // const ambientLight = new THREE.AmbientLight();
      // scene.add(ambientLight);

      // const camera = new THREE.PerspectiveCamera(
      //   75,
      //   window.innerWidth / window.innerHeight,
      //   0.1,
      //   1000
      // );
      // camera.position.set(0.8, 1.4, 1.0);

      // const renderer = new THREE.WebGLRenderer();
      // renderer.setSize(window.innerWidth, window.innerHeight);
      // containerRef.current?.appendChild(renderer.domElement);

      // const controls = new PointerLockControls(camera, renderer.domElement);
      // scene.add(controls.getObject());
      // controls.enableDamping = true;
      // controls.target.set(0, 1, 0);
      const sh = new SceneHandler();
      containerRef.current?.appendChild(sh.renderer.domElement);

      const material = new THREE.MeshMatcapMaterial();

      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        '/PadNic_beetle_NOSTEAL.fbx',
        (object) => {
          object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).material = material;
              if ((child as THREE.Mesh).material) {
                (
                  (child as THREE.Mesh).material as THREE.MeshBasicMaterial
                ).transparent = false;
              }
            }
          });
          object.scale.set(1, 1, 1);
          object.position.set(-5, 12, 0);
          object.rotateX(-Math.PI / 2);
          object.rotateZ(-Math.PI / 2);
          sh.scene.add(object);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.log(error);
        }
      );

      // const stats = new Stats();
      // document.body.appendChild(stats.dom);

      const animate = () => {
        requestAnimationFrame(animate);

        sh.animate();
        // sh.renderer.render(scene, camera);

        // stats.update();
      };

      animate();

      const cleanMe = containerRef.current;
      return () => {
        cleanMe?.removeChild(sh.renderer.domElement);
      };
    }
  }, []);
  return <div ref={containerRef} />;
}
