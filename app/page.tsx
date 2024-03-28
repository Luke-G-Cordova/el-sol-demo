'use client';
import { useEffect, useRef } from 'react';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { SceneHandler } from './components/SceneHandler';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
