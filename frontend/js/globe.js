import * as THREE from 'three';
import { scene, camera } from './scene.js';

const geometry = new THREE.SphereGeometry(1, 64, 64);
const textureLoader = new THREE.TextureLoader();

// Earth texture
const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
const material = new THREE.MeshPhongMaterial({
	map: earthTexture,
	shininess: 5
});

export const globe = new THREE.Mesh(geometry, material);
globe.visible = false; // Hidden until hand detected
scene.add(globe);

export function updateGlobe(data) {
	if (!data.hand_detected || data.hands.length === 0) {
		globe.visible = false;
		return;
	}

	globe.visible = true;

	// Hand 1 (Master) - Controls Position
	const hand1 = data.hands[0];

	// Calculate visible area at Z=0 for the current camera perspective
	const vFOV = THREE.MathUtils.degToRad(camera.fov);
	const dist = camera.position.z;
	const height = 2 * Math.tan(vFOV / 2) * dist;
	const width = height * camera.aspect;

	// Fix Mirroring: Invert X coordinate
	// Exact mapping based on calculated frustum size
	const targetX = ((1 - hand1.x) - 0.5) * width;
	const targetY = -(hand1.y - 0.5) * height;

	// Smooth position follow
	globe.position.x += (targetX - globe.position.x) * 0.2;
	globe.position.y += (targetY - globe.position.y) * 0.2;

	// Dynamic Scaling based on hand distance (hand1.scale)
	// Adjusted multiplier for the new camera distance
	const targetScale = hand1.scale * 8.0; 
	const currentScale = globe.scale.x;
	const newScale = currentScale + (targetScale - currentScale) * 0.15;
	globe.scale.set(newScale, newScale, newScale);

	// Rotation Control
	if (data.hands.length > 1) {
		// Hand 2 detected - Manual Rotation Mode
		const hand2 = data.hands[1];
		if (hand2.gesture === 'open') {
			// Use Hand 2's horizontal movement to spin the globe
			const rotSpeed = (hand2.x - 0.5) * 0.2;
			globe.rotation.y += rotSpeed;
		}
	} else {
		// Single hand mode
		if (hand1.gesture === 'open') {
			globe.rotation.y += 0.01; // Default slow spin
		}
	}

	// Maintain a slight tilt based on primary hand's rotation_z
	globe.rotation.x = hand1.rotation_z * 0.5;
}
