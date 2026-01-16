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

// State for relative rotation
let lastRotationPos = { x: null, y: null };

export function updateGlobe(data) {
	if (!data.hand_detected || data.hands.length === 0) {
		globe.visible = false;
		return;
	}

	globe.visible = true;

	// Identify hands: Left Hand is primary (position), Right Hand is secondary (rotation)
	const leftHand = data.hands.find(h => h.label === 'Left') || (data.hands.length === 1 ? data.hands[0] : null);
	const rightHand = data.hands.find(h => h.label === 'Right');

	// --- 1. Position Control (Left Hand) ---
	if (leftHand) {
		// Calculate visible area at Z=0 for the current camera perspective
		const vFOV = THREE.MathUtils.degToRad(camera.fov);
		const dist = camera.position.z;
		const height = 2 * Math.tan(vFOV / 2) * dist;
		const width = height * camera.aspect;

		const targetX = ((1 - leftHand.x) - 0.5) * width;
		const targetY = -(leftHand.y - 0.5) * height;

		// Smooth position follow
		globe.position.x += (targetX - globe.position.x) * 0.2;
		globe.position.y += (targetY - globe.position.y) * 0.2;

		// Scaling ALWAYS from Left Hand distance
		const targetScale = leftHand.scale * 8.0;
		const currentScale = globe.scale.x;
		const newScale = currentScale + (targetScale - currentScale) * 0.15;
		globe.scale.set(newScale, newScale, newScale);
	}

	// --- 2. Spin Control (Right Hand) ---
	if (rightHand) {
		// Relative Rotation: Only rotate when moving after "opening" the hand
		if (rightHand.gesture === 'open') {
			if (lastRotationPos.x !== null && lastRotationPos.y !== null) {
				// Calculate displacement since last frame
				const deltaX = (rightHand.x - lastRotationPos.x) * 7.0; 
				const deltaY = (rightHand.y - lastRotationPos.y) * 7.0;
				
				globe.rotation.y -= deltaX;
				globe.rotation.x += deltaY;
			}
			// Store current position as reference for next frame
			lastRotationPos.x = rightHand.x;
			lastRotationPos.y = rightHand.y;
		} else {
			// Hand is a Fist: Reset starting point to ensure no jump when opening
			lastRotationPos.x = null;
			lastRotationPos.y = null;
		}
	} else {
		// Reset state if hand is lost
		lastRotationPos.x = null;
		lastRotationPos.y = null;

		// Auto-spin if only one hand and it's open
		if (leftHand && leftHand.gesture === 'open') {
			globe.rotation.y += 0.01;
		}
	}

	// Dynamic Tilt based on Left Hand (wrist rotation)
	// We use += and a factor to avoid overwritting the free spin
	if (leftHand && !rightHand) {
		const targetTilt = leftHand.rotation_z * 0.5;
		globe.rotation.x += (targetTilt - globe.rotation.x) * 0.05;
	}
}
