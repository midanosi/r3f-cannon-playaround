import React from 'react'
import { Canvas, useFrame} from '@react-three/fiber'
import {Physics, usePlane, useConvexPolyhedron} from "@react-three/cannon"
import { OrbitControls} from '@react-three/drei'
import { BoxGeometry} from 'three'

import { Geometry } from 'three-stdlib/deprecated/Geometry'


import type { PlaneProps, ConvexPolyhedronProps } from '@react-three/cannon'
import type {BufferGeometry } from 'three'

// Returns legacy geometry vertices, faces for ConvP
function toConvexProps(bufferGeometry: BufferGeometry): ConvexPolyhedronProps['args'] {
    const geo = new Geometry().fromBufferGeometry(bufferGeometry)
    // Merge duplicate vertices resulting from glTF export.
    // Cannon assumes contiguous, closed meshes to work
    geo.mergeVertices()
    return [geo.vertices.map((v) => [v.x, v.y, v.z]), geo.faces.map((f) => [f.a, f.b, f.c]), []]
}


type CubeProps = Pick<ConvexPolyhedronProps, 'position' | 'rotation'> & {
    size: number
}
const Cube = ({position, rotation, size}: CubeProps) => {
    const geometry = new BoxGeometry(size, size, size)
    const args = React.useMemo(() => toConvexProps(geometry), [geometry])
    const [ref] = useConvexPolyhedron(() => ({args, mass: 100, position, rotation}))
    return (
        <mesh castShadow receiveShadow {...{geometry, position, ref, rotation}}>
            <boxGeometry args={[size,size,size]}/>
            <meshStandardMaterial color="purple"/>
        </mesh>
    )
}
const Plane = (props: PlaneProps) => {
    const [ref] = usePlane(() => ({type: "Static", ...props}))
    return (
        <mesh ref={ref} receiveShadow>
            <planeBufferGeometry args={[10,10]}/>
            <shadowMaterial color="#171717"/>
            {/* <meshStandardMaterial color="#171717"/> */}
        </mesh>
    )
}

const App = () => {
    const [invertGravity, setInvertGravity] = React.useState(false)

    return (
        <Canvas shadows camera={{ position: [-1, 1, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight
            position={[10, 10, 10]}
            angle={0.3}
            penumbra={1}
            castShadow
          intensity={2}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
      <pointLight position={[-10, -10, -10]} />
      <React.Suspense fallback={null}>
          <Physics gravity={[0, invertGravity ? 1 : -3, 0]}>
            <group onPointerDown={() => {
                setInvertGravity(!invertGravity)
              }}>
                <Cube position={[-1.2, 1, 0]} size={0.7}/>
                <Cube position={[1.2, 1, 0]} size={1}/>
                <Plane rotation={[-Math.PI / 2, 0, 0]} />
            </group>
          </Physics>
        </React.Suspense>
        {/* <OrbitControls/> */}
    </Canvas>
    )
}

export default App