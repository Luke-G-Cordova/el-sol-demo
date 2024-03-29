'use client';
import { useEffect, useRef } from 'react';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { SceneHandler } from './components/SceneHandler';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sh = new SceneHandler();
      containerRef.current?.appendChild(sh.renderer.domElement);

      const material = new THREE.MeshStandardMaterial();

      const textureUrls = [
        '/Beetle_lowBeetle_zbrush_defaultMat_BaseColor.png',
        '/Beetle_lowBeetle_zbrush_defaultMat_Metallic.png',
        '/Beetle_lowBeetle_zbrush_defaultMat_Normal.png',
        '/Beetle_lowBeetle_zbrush_defaultMat_Roughness.png',
      ];
      const textures = [];
      const textureLoader = new THREE.TextureLoader();
      for (let i = 0; i < textureUrls.length; i++) {
        textures.push(textureLoader.load(textureUrls[i]));
      }
      console.log(textures);
      // const materials: THREE.MeshBasicMaterial[] = [];
      // for (let i = 0; i < textureUrls.length; i++) {
      //   materials.push(
      //     new THREE.MeshBasicMaterial({
      //       map: textures[i],
      //       transparent: false,
      //     })
      //   );
      // }
      const customShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          baseColorMap: { value: textures[0] },
          roughnessMap: { value: textures[3] },
          normalMap: { value: textures[2] },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform sampler2D baseColorMap;
          uniform sampler2D roughnessMap;
          uniform sampler2D normalMap;

          void main() {
              // Sample textures
              vec4 baseColor = texture2D(baseColorMap, vUv);
              float roughness = texture2D(roughnessMap, vUv).r; // assuming roughness is stored in the red channel
              vec3 normal = texture2D(normalMap, vUv).xyz * 2.0 - 1.0; // convert normal map to -1 to 1 range

              // Apply textures in order
              // Base color
              vec3 finalColor = baseColor.rgb;

              // Roughness
              float finalRoughness = roughness;

              // Normal
              vec3 finalNormal = normalize(normal);

              // Output final color
              gl_FragColor = vec4(finalColor, 1.0); // ignoring roughness and normal for now
          }
        `,
      });

      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        '/PadNic_beetle_NOSTEAL.fbx',
        (object) => {
          // object.traverse(function (child) {
          //   if ((child as THREE.Mesh).isMesh) {
          //     // (child as THREE.Mesh).material = material;
          //     if ((child as THREE.Mesh).material) {
          //       (
          //         (child as THREE.Mesh).material as THREE.MeshBasicMaterial
          //       ).transparent = false;
          //     }
          //   }
          // });
          (object.children[0] as THREE.Mesh).material = customShaderMaterial;
          (object.children[0] as THREE.Mesh).castShadow = true;
          (object.children[0] as THREE.Mesh).receiveShadow = true;

          console.log(object);

          object.scale.set(1, 1, 1);
          object.position.set(-60, 12, 0);
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

      const stats = new Stats();
      document.body.appendChild(stats.dom);

      const animate = () => {
        requestAnimationFrame(animate);

        sh.animate();
        // sh.renderer.render(scene, camera);

        stats.update();
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
