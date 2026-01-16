import * as THREE from 'three';
import { scene, camera } from './scene.js';

const geometry = new THREE.SphereGeometry(1, 64, 64);
const textureLoader = new THREE.TextureLoader();

const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
const material = new THREE.MeshPhongMaterial({
	map: earthTexture,
	shininess: 5
});

export const globe = new THREE.Mesh(geometry, material);
globe.visible = false;
scene.add(globe);

let lastRotationPos = { x: null, y: null };

export function updateGlobe(data) {
	if (!data.hand_detected || data.hands.length === 0) {
		globe.visible = false;
		return;
	}

	globe.visible = true;

	const leftHand = data.hands.find(h => h.label === 'Left') || (data.hands.length === 1 ? data.hands[0] : null);
	const rightHand = data.hands.find(h => h.label === 'Right');

	if (leftHand) {
		const vFOV = THREE.MathUtils.degToRad(camera.fov);
		const dist = camera.position.z;
		const height = 2 * Math.tan(vFOV / 2) * dist;
		const width = height * camera.aspect;

		const targetX = ((1 - leftHand.x) - 0.5) * width;
		const targetY = -(leftHand.y - 0.5) * height;

		globe.position.x += (targetX - globe.position.x) * 0.2;
		globe.position.y += (targetY - globe.position.y) * 0.2;

		const targetScale = leftHand.scale * 8.0;
		const currentScale = globe.scale.x;
		const newScale = currentScale + (targetScale - currentScale) * 0.15;
		globe.scale.set(newScale, newScale, newScale);
	}

	if (rightHand) {
		if (rightHand.gesture === 'fist') {
			if (lastRotationPos.x !== null && lastRotationPos.y !== null) {
				const deltaX = (rightHand.x - lastRotationPos.x) * 7.0;
				const deltaY = (rightHand.y - lastRotationPos.y) * 7.0;

				globe.rotation.y -= deltaX;
				globe.rotation.x += deltaY;
			}
			lastRotationPos.x = rightHand.x;
			lastRotationPos.y = rightHand.y;
		} else {
			lastRotationPos.x = null;
			lastRotationPos.y = null;
		}
	} else {
		lastRotationPos.x = null;
		lastRotationPos.y = null;

		if (leftHand && leftHand.gesture === 'open') {
			globe.rotation.y += 0.01;
		}
	}

	if (leftHand && !rightHand) {
		const targetTilt = leftHand.rotation_z * 0.5;
		globe.rotation.x += (targetTilt - globe.rotation.x) * 0.05;
	}
}
