import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Sparkles, Float } from '@react-three/drei';

const HologramPlane = ({ image }) => {
    const mesh = useRef();
    const texture = useTexture(image);

    useFrame((state) => {
        // Gentle floating animation handled by Float, but we can add pulse here
        const t = state.clock.getElapsedTime();
        if (mesh.current) {
            mesh.current.material.opacity = 0.6 + Math.sin(t * 2) * 0.2; // Pulsing opacity
        }
    });

    return (
        <mesh ref={mesh} visible position={[0, 0, 0]}>
            <planeGeometry args={[3, 4.5]} /> {/* Aspect ratio of a card */}
            <meshStandardMaterial
                map={texture}
                transparent
                opacity={0.8}
                emissive="#00ff41"
                emissiveIntensity={2}
                toneMapped={false}
            />
        </mesh>
    );
};

const AlienScene = ({ image }) => {
    return (
        <div style={{ width: '100%', height: '400px', background: 'radial-gradient(circle, #0a2e0a 0%, #000000 70%)' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00ff41" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <HologramPlane image={image} />
                </Float>

                {/* Holographic Particles */}
                <Sparkles count={50} scale={5} size={4} speed={0.4} opacity={0.5} color="#00ff41" />

                <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={2}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
};

export default AlienScene;
