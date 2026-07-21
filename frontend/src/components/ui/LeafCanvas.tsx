import { useEffect, useRef } from "react";
import * as THREE from "three";

const generateLogoTargets = (particleCount: number, scale: number) => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return new Float32Array(particleCount * 3);

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = size * 0.04;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;

    // 1. Text
    ctx.font = `bold ${size * 0.25}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CO', cx - size * 0.08, cy + size * 0.05);
    ctx.font = `bold ${size * 0.15}px sans-serif`;
    ctx.fillText('2', cx + size * 0.16, cy + size * 0.12);

    // 2. Leaf
    ctx.save();
    ctx.translate(cx + size * 0.08, cy - size * 0.15);
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(0, size * 0.22);
    ctx.quadraticCurveTo(-size * 0.15, 0, 0, -size * 0.22);
    ctx.quadraticCurveTo(size * 0.15, 0, 0, size * 0.22);
    // Veins
    ctx.moveTo(0, size * 0.22); ctx.lineTo(0, -size * 0.18);
    ctx.moveTo(0, 0); ctx.lineTo(size * 0.08, -size * 0.08);
    ctx.moveTo(0, size * 0.08); ctx.lineTo(-size * 0.08, 0);
    ctx.stroke();
    ctx.restore();

    // 3. Arrows
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.8, -Math.PI * 0.35, false);
    ctx.stroke();
    
    ctx.save();
    ctx.translate(cx + Math.cos(-Math.PI * 0.35) * r, cy + Math.sin(-Math.PI * 0.35) * r);
    ctx.rotate(-Math.PI * 0.35 + Math.PI/2);
    ctx.beginPath();
    ctx.moveTo(0, -size*0.06);
    ctx.lineTo(-size*0.05, size*0.05);
    ctx.lineTo(size*0.05, size*0.05);
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.1, Math.PI * 0.65, false);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx + Math.cos(Math.PI * 0.65) * r, cy + Math.sin(Math.PI * 0.65) * r);
    ctx.rotate(Math.PI * 0.65 + Math.PI/2);
    ctx.beginPath();
    ctx.moveTo(0, -size*0.06);
    ctx.lineTo(-size*0.05, size*0.05);
    ctx.lineTo(size*0.05, size*0.05);
    ctx.fill();
    ctx.restore();

    const imgData = ctx.getImageData(0, 0, size, size).data;
    const validPixels = [];
    for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
            const i = (y * size + x) * 4;
            if (imgData[i + 3] > 128) {
                const nx = (x / size) * 2 - 1;
                const ny = -(y / size) * 2 + 1;
                validPixels.push({ x: nx, y: ny });
            }
        }
    }

    const targets = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        if (validPixels.length > 0) {
            const p = validPixels[Math.floor(Math.random() * validPixels.length)];
            targets[i * 3] = (p.x + (Math.random() - 0.5) * 0.02) * scale;
            targets[i * 3 + 1] = (p.y + (Math.random() - 0.5) * 0.02) * scale;
            targets[i * 3 + 2] = (Math.random() - 0.5) * 0.1 * scale;
        }
    }
    return targets;
};

export default function LeafCanvas() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 4;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const PARTICLE_COUNT = 1500; // Increased for better detail
        
        const targets = generateLogoTargets(PARTICLE_COUNT, 1.2);
        const starts = new Float32Array(PARTICLE_COUNT * 3);
        const phases = new Float32Array(PARTICLE_COUNT);
        const colors = new Float32Array(PARTICLE_COUNT * 3);

        const colorA = new THREE.Color("#7BC02A");
        const colorB = new THREE.Color("#8AD431");

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const dir = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize().multiplyScalar(4 + Math.random() * 4);
            
            starts[i * 3] = dir.x;
            starts[i * 3 + 1] = dir.y;
            starts[i * 3 + 2] = dir.z;

            phases[i] = Math.random();

            const c = colorA.clone().lerp(colorB, Math.random());
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(starts.slice(), 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        // Create glowing sprite for particles
        const spriteCanvas = document.createElement("canvas");
        spriteCanvas.width = 64;
        spriteCanvas.height = 64;
        const ctx = spriteCanvas.getContext("2d")!;
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.2, "rgba(34, 197, 94, 0.8)");
        grad.addColorStop(1, "rgba(34, 197, 94, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        const spriteTex = new THREE.CanvasTexture(spriteCanvas);

        const material = new THREE.PointsMaterial({
            size: 0.15,
            map: spriteTex,
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        const clock = new THREE.Clock();
        const posAttr = geometry.attributes.position;
        let assembleT = 0;
        let assembled = false;
        let rafId: number;

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        function animate() {
            const dt = Math.min(clock.getDelta(), 0.05);

            if (!assembled) {
                assembleT += dt * 0.5;
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const localT = THREE.MathUtils.clamp((assembleT - phases[i] * 0.4) / 0.6, 0, 1);
                    const e = easeOutCubic(localT);
                    posAttr.array[i * 3] = starts[i * 3] + (targets[i * 3] - starts[i * 3]) * e;
                    posAttr.array[i * 3 + 1] = starts[i * 3 + 1] + (targets[i * 3 + 1] - starts[i * 3 + 1]) * e;
                    posAttr.array[i * 3 + 2] = starts[i * 3 + 2] + (targets[i * 3 + 2] - starts[i * 3 + 2]) * e;
                }
                posAttr.needsUpdate = true;
                if (assembleT > 2.0) assembled = true;
            }

            // Gentle rotation
            points.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
            points.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
        }
        animate();

        const handleResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", handleResize);
            mount.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            spriteTex.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full" aria-hidden="true" />;
}
