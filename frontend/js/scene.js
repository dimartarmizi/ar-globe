import * as THREE from 'three';

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const canvas = document.querySelector('#three-canvas');
const stage = document.querySelector('#stage');

export const renderer = new THREE.WebGLRenderer({
	canvas,
	alpha: true,
	antialias: true
});

const updateSize = () => {
	const width = stage.clientWidth;
	const height = stage.clientHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);
};

updateSize();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

camera.position.z = 15;

window.addEventListener('resize', updateSize);

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

animate();
