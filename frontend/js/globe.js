import * as THREE from 'three';
import { scene } from './scene.js';

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

	// Fix Mirroring: Invert X coordinate
	// data.x (0-1) -> targetX (-10 to 10)
	// (1 - hand1.x) maps 0 to 1, 1 to 0 (flipping horizontally)
	const targetX = ((1 - hand1.x) - 0.5) * 12;
	const targetY = -(hand1.y - 0.5) * 10;

	// Smooth position follow
	globe.position.x += (targetX - globe.position.x) * 0.15;
	globe.position.y += (targetY - globe.position.y) * 0.15;

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
