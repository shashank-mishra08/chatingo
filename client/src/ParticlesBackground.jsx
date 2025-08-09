import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

import nebulaTexture from './assets/nebula.jpg';
import planet1Texture from './assets/planet1.jpg';
import planet2Texture from './assets/planet2.jpg';
import planet3Texture from './assets/planet3.jpg';

function Planet(props) {
  const { texture, size, position, speed } = props;
  const mesh = useRef();
  const textureMap = useLoader(THREE.TextureLoader, texture);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += speed;
      const time = state.clock.getElapsedTime();
      mesh.current.position.x = position[0] * Math.cos(time * speed * 5);
      mesh.current.position.z = position[2] * Math.sin(time * speed * 5);
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={[size, size, size]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={textureMap} />
    </mesh>
  );
}

function Nebula() {
  const texture = useLoader(THREE.TextureLoader, nebulaTexture);
  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function RealisticPlanetBackground() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />

          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

          <Nebula />

          <Planet texture={planet1Texture} size={2.5} position={[5, 0, 10]} speed={0.001} />
          <Planet texture={planet2Texture} size={1.5} position={[-10, 2, 0]} speed={0.002} />
          <Planet texture={planet3Texture} size={3} position={[15, -2, -5]} speed={0.0005} />

          <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.1} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default RealisticPlanetBackground;