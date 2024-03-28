'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scene = new THREE.Scene();
      scene.add(new THREE.AxesHelper(5));

      const light = new THREE.PointLight(0xffffff, 50);
      light.position.set(0.8, 1.4, 1.0);
      scene.add(light);

      const ambientLight = new THREE.AmbientLight();
      scene.add(ambientLight);

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0.8, 1.4, 1.0);

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 1, 0);
      // const material = new THREE.MeshNormalMaterial();

      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        '/PadNic_beetle_NOSTEAL.fbx',
        (object) => {
          object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
              // (child as THREE.Mesh).material = material;
              if ((child as THREE.Mesh).material) {
                (
                  (child as THREE.Mesh).material as THREE.MeshBasicMaterial
                ).transparent = false;
              }
            }
          });
          object.scale.set(0.1, 0.1, 0.1);
          object.position.set(0, -4, 0);
          scene.add(object);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.log(error);
        }
      );

      // const onWindowResize = () => {
      //   camera.aspect = window.innerWidth / window.innerHeight;
      //   camera.updateProjectionMatrix();
      //   renderer.setSize(window.innerWidth, window.innerHeight);
      //   renderer.render(scene, camera);
      // };
      // window.addEventListener('resize', onWindowResize, false);

      // const stats = new Stats();
      // document.body.appendChild(stats.dom);

      const animate = () => {
        requestAnimationFrame(animate);

        controls.update();

        renderer.render(scene, camera);

        // stats.update();
      };

      animate();

      const cleanMe = containerRef.current;
      return () => {
        cleanMe?.removeChild(renderer.domElement);
        // window.removeEventListener('resize', onWindowResize, false);
      };
    }
  }, []);
  return <div ref={containerRef} />;
}
