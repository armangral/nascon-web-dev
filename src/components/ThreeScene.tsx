import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    camera.position.y = 1;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Mouse interaction setup
    const mouse = new THREE.Vector2();
    const targetRotation = new THREE.Vector2();
    let isMouseDown = false;

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (isMouseDown) {
        targetRotation.x += event.movementY * 0.005;
        targetRotation.y += event.movementX * 0.005;
      }
    };

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Responsive handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Create educational 3D objects
    const objects = new THREE.Group();

    // Enhanced atom creation with particle effects
    const createAtom = (position: THREE.Vector3) => {
      const atom = new THREE.Group();

      // Enhanced nucleus
      const nucleusGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const nucleusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x6366f1,
        metalness: 0.3,
        roughness: 0.7,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
      atom.add(nucleus);

      // Enhanced electron orbits with gradient
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.5,
      });

      // Create more complex electron paths
      for (let i = 0; i < 3; i++) {
        const orbitRadius = 0.8 + i * 0.3;
        const orbit = new THREE.Mesh(
          new THREE.TorusGeometry(orbitRadius, 0.02, 16, 50),
          orbitMaterial
        );
        orbit.rotation.x = Math.PI / (i + 1);
        orbit.rotation.y = Math.PI / (3 - i);
        atom.add(orbit);

        // Add multiple electrons per orbit
        for (let j = 0; j < 2; j++) {
          const electronGeometry = new THREE.SphereGeometry(0.08, 16, 16);
          const electronMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8b5cf6,
            metalness: 0.3,
            roughness: 0.7,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.5,
          });
          const electron = new THREE.Mesh(electronGeometry, electronMaterial);
          const angle = j * Math.PI + (i * Math.PI) / 3;
          electron.position.x = orbitRadius * Math.cos(angle);
          electron.position.y = orbitRadius * Math.sin(angle);
          atom.add(electron);
        }
      }

      atom.position.copy(position);
      return atom;
    };

    // Create Pi symbol
    const createPiSymbol = (position: THREE.Vector3) => {
      const pi = new THREE.Group();

      // Vertical lines
      const createLine = (x: number) => {
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 16);
        const material = new THREE.MeshPhysicalMaterial({
          color: 0x6366f1,
          metalness: 0.3,
          roughness: 0.7,
          clearcoat: 1.0,
        });
        const line = new THREE.Mesh(geometry, material);
        line.position.x = x;
        return line;
      };

      pi.add(createLine(-0.5));
      pi.add(createLine(0.5));

      // Horizontal line
      const horizontalGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.2);
      const horizontalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x6366f1,
        metalness: 0.3,
        roughness: 0.7,
        clearcoat: 1.0,
      });
      const horizontal = new THREE.Mesh(horizontalGeometry, horizontalMaterial);
      horizontal.position.y = 0.9;
      pi.add(horizontal);

      pi.position.copy(position);
      return pi;
    };

    // Create Infinity symbol
    const createInfinitySymbol = (position: THREE.Vector3) => {
      const infinity = new THREE.Group();

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(-0.5, 0.5, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, -0.5, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0.5, 0.5, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.5, -0.5, 0),
        new THREE.Vector3(-1, 0, 0),
      ]);

      const geometry = new THREE.TubeGeometry(curve, 100, 0.1, 16, true);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x8b5cf6,
        metalness: 0.3,
        roughness: 0.7,
        clearcoat: 1.0,
      });

      const tube = new THREE.Mesh(geometry, material);
      infinity.add(tube);

      infinity.position.copy(position);
      return infinity;
    };

    // Add objects to scene with adjusted positions
    const atom1 = createAtom(new THREE.Vector3(-3, 1.5, 0));
    objects.add(atom1);

    const pi = createPiSymbol(new THREE.Vector3(-1, -1, 0));
    objects.add(pi);

    const infinity = createInfinitySymbol(new THREE.Vector3(1.5, 0.5, 0));
    objects.add(infinity);

    const atom2 = createAtom(new THREE.Vector3(3, -1.5, -1));
    objects.add(atom2);

    scene.add(objects);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 1, 10);
    pointLight1.position.set(-2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1, 10);
    pointLight2.position.set(2, -2, 2);
    scene.add(pointLight2);

    // Animation
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      // Smooth camera movement
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Scene rotation
      objects.rotation.x += (targetRotation.x - objects.rotation.x) * 0.1;
      objects.rotation.y += (targetRotation.y - objects.rotation.y) * 0.1;

      // Animate objects
      objects.children.forEach((object, i) => {
        // Floating animation
        object.position.y +=
          Math.sin(Date.now() * 0.001 + i * Math.PI * 0.5) * 0.003;

        // Rotation animation
        object.rotation.x = Math.sin(Date.now() * 0.0005 + i) * 0.1;
        object.rotation.y += 0.005;

        // Animate atoms specifically
        if (i === 0 || i === 3) {
          // Atom indices
          object.children.forEach((child, j) => {
            if (child.geometry instanceof THREE.SphereGeometry && j > 0) {
              const time = Date.now() * 0.001;
              const radius = child.position.length();
              const speed = 1 - radius * 0.2;
              const angle = time * speed + j;

              child.position.x = radius * Math.cos(angle);
              child.position.y = radius * Math.sin(angle);
            }
          });
        }

        // Pulsing effect for math symbols
        if (i === 1 || i === 2) {
          // Math symbol indices
          const scale = 1 + Math.sin(Date.now() * 0.002 + i) * 0.05;
          object.scale.setScalar(scale);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frame);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default ThreeScene;
