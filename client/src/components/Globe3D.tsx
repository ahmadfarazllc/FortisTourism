import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { SelectDestination } from '@shared/schema'

interface GlobeProps {
  destinations: SelectDestination[]
  onDestinationClick: (destination: SelectDestination) => void
}

function Globe({ destinations, onDestinationClick }: { destinations: SelectDestination[], onDestinationClick: (dest: SelectDestination) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
    }
  })

  // Convert lat/lng to 3D coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius = 2) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    
    return new THREE.Vector3(x, y, z)
  }

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshPhongMaterial
          color="#001122"
          transparent
          opacity={0.8}
          shininess={100}
        />
        {/* Globe wireframe */}
        <Sphere args={[2.01, 32, 16]}>
          <meshBasicMaterial
            color="#00D4FF"
            wireframe
            transparent
            opacity={0.3}
          />
        </Sphere>
      </Sphere>

      {/* Destination Points */}
      {destinations.map((destination) => {
        const position = latLngToVector3(
          destination.coordinates.lat,
          destination.coordinates.lng
        )
        
        return (
          <group key={destination.id}>
            <mesh
              position={position}
              onClick={() => onDestinationClick(destination)}
              onPointerEnter={() => setHoveredPoint(destination.id)}
              onPointerLeave={() => setHoveredPoint(null)}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial
                color={hoveredPoint === destination.id ? "#B347D9" : "#00D4FF"}
                emissive={hoveredPoint === destination.id ? "#B347D9" : "#00D4FF"}
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* Destination Label */}
            {hoveredPoint === destination.id && (
              <Html position={position}>
                <div className="glass-dark p-2 rounded-lg min-w-[200px] transform -translate-x-1/2 -translate-y-full mb-2">
                  <h3 className="font-semibold text-neon-blue">{destination.name}</h3>
                  <p className="text-xs text-white/80">{destination.country}</p>
                  <p className="text-xs text-white/60 mt-1">${destination.price}</p>
                </div>
              </Html>
            )}
          </group>
        )
      })}

      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00D4FF" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#B347D9" />
    </group>
  )
}

export default function Globe3D({ destinations, onDestinationClick }: GlobeProps) {
  return (
    <div className="h-[600px] w-full globe-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Globe destinations={destinations} onDestinationClick={onDestinationClick} />
      </Canvas>
    </div>
  )
}