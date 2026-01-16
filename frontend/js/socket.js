import { updateGlobe } from './globe.js';

const statusEl = document.getElementById('status');
const statsContainer = document.getElementById('hand-stats');
const video = document.getElementById('video-feed');
const handCanvas = document.getElementById('hand-canvas');
const hctx = handCanvas.getContext('2d');

const captureCanvas = document.createElement('canvas');
const cctx = captureCanvas.getContext('2d');
captureCanvas.width = 320;
captureCanvas.height = 240;

const socket = new WebSocket('ws://localhost:8000/ws/hand-tracking');

const HAND_CONNECTIONS = [
	[0, 1], [1, 2], [2, 3], [3, 4],
	[0, 5], [5, 6], [6, 7], [7, 8],
	[5, 9], [9, 10], [10, 11], [11, 12],
	[9, 13], [13, 14], [14, 15], [15, 16],
	[13, 17], [17, 18], [18, 19], [19, 20],
	[0, 17]
];

async function startCamera() {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { width: 1280, height: 720 }
		});
		video.srcObject = stream;
		video.onloadedmetadata = () => {
			handCanvas.width = video.videoWidth;
			handCanvas.height = video.videoHeight;
			updateStageSize();
			sendFrames();
		};
	} catch (err) {
		console.error("Error accessing camera:", err);
		statusEl.textContent = 'Camera Error';
	}
}

function updateStageSize() {
	const stage = document.getElementById('stage');
	const videoAspect = video.videoWidth / video.videoHeight;
	const windowAspect = window.innerWidth / window.innerHeight;

	if (windowAspect > videoAspect) {
		const height = window.innerHeight;
		const width = height * videoAspect;
		stage.style.width = `${width}px`;
		stage.style.height = `${height}px`;
	} else {
		const width = window.innerWidth;
		const height = width / videoAspect;
		stage.style.width = `${width}px`;
		stage.style.height = `${height}px`;
	}

	window.dispatchEvent(new Event('resize'));
}

window.addEventListener('resize', updateStageSize);

function sendFrames() {
	if (socket.readyState === WebSocket.OPEN) {
		cctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
		const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.4);
		socket.send(dataUrl);
	}
	setTimeout(sendFrames, 40);
}

function drawHand(hand, color) {
	const landmarks = hand.landmarks;
	const w = handCanvas.width;
	const h = handCanvas.height;
	const label = hand.label;

	hctx.strokeStyle = label === 'Right' ? '#00ff00' : '#0096ff';
	hctx.lineWidth = 3;
	hctx.beginPath();
	HAND_CONNECTIONS.forEach(([i, j]) => {
		const lm1 = landmarks[i];
		const lm2 = landmarks[j];
		hctx.moveTo((1 - lm1.x) * w, lm1.y * h);
		hctx.lineTo((1 - lm2.x) * w, lm2.y * h);
	});
	hctx.stroke();

	landmarks.forEach((lm, idx) => {
		hctx.fillStyle = idx === 0 ? '#ff0000' : (idx % 4 === 0 ? (label === 'Right' ? '#00ff00' : '#0096ff') : '#ffffff');
		hctx.beginPath();
		hctx.arc((1 - lm.x) * w, lm.y * h, idx % 4 === 0 ? 5 : 3, 0, Math.PI * 2);
		hctx.fill();
	});
}

function updateStats(hands) {
	if (hands.length === 0) {
		statsContainer.innerHTML = '<p>No hands detected</p>';
		return;
	}

	statsContainer.innerHTML = hands.map((hand, i) => `
        <div class="hand-info">
            <div class="hand-label">${hand.label} Hand - ${hand.gesture.toUpperCase()}</div>
            <div class="hand-data">
                <span>X:</span> <span>${hand.x.toFixed(2)}</span>
                <span>Y:</span> <span>${hand.y.toFixed(2)}</span>
                <span>Z:</span> <span>${hand.z.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

socket.onopen = () => {
	statusEl.textContent = 'Connected';
	statusEl.className = 'status connected';
	startCamera();
};

socket.onclose = () => {
	statusEl.textContent = 'Disconnected';
	statusEl.className = 'status disconnected';
};

socket.onmessage = (event) => {
	const data = JSON.parse(event.data);

	hctx.clearRect(0, 0, handCanvas.width, handCanvas.height);

	if (data.hand_detected) {
		data.hands.forEach((hand, i) => {
			const color = i === 0 ? '#0096ff' : '#00ff88';
			drawHand(hand, color);
		});
		updateStats(data.hands);
		updateGlobe(data);
	} else {
		updateStats([]);
		updateGlobe({ hand_detected: false });
	}
};

socket.onerror = (error) => {
	console.error('WebSocket Error:', error);
	statusEl.textContent = 'WS Error';
};
