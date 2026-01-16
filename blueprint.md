# Blueprint Proyek
## Web App Python – Hand Gesture Controlled Globe (AR-like)

---

## 1. Ringkasan Proyek
Aplikasi web berbasis Python yang memungkinkan pengguna **menggerakkan dan merotasi globe 3D menggunakan gerakan tangan**, dengan visual globe **terlihat berada di atas telapak tangan** secara real-time melalui kamera.

Aplikasi ini menggabungkan:
- Computer Vision (hand tracking)
- Gesture recognition
- 3D rendering di browser
- Backend Python sebagai pengolah data visi

---

## 2. Tujuan
- Mendeteksi tangan pengguna melalui webcam
- Menentukan posisi telapak tangan
- Merender globe 3D tepat di atas tangan
- Memungkinkan rotasi globe dengan gerakan tangan (rotate, spin)
- Menjaga performa real-time (low latency)

---

## 3. Ruang Lingkup

### In Scope
- Deteksi 1 tangan
- Rotasi globe berdasarkan gesture
- Tampilan web (desktop browser)
- Kamera lokal (webcam)

### Out of Scope (Tahap Awal)
- Multi-hand interaction
- AR mobile native (Android/iOS)
- Zoom gesture kompleks
- Physics simulation

---

## 4. Arsitektur Sistem

```
Webcam
   ↓
Frontend (Browser)
   ↓ (WebSocket)
Backend Python (FastAPI)
   ↓
Hand Tracking + Gesture Engine
   ↓
Data Transformasi (x, y, rotasi)
   ↓
Frontend (Three.js Globe)
```

---

## 5. Teknologi yang Digunakan

### Backend
- Python 3.11+
- FastAPI
- OpenCV
- MediaPipe Hands
- NumPy
- WebSocket

### Frontend
- HTML5
- JavaScript
- Three.js
- WebGL
- WebSocket Client

### Infrastruktur
- Local development
- Camera permission via browser

---

## 6. Struktur Folder

```
project-root/
│
├── backend/
│   ├── main.py
│   ├── camera.py
│   ├── hand_tracker.py
│   ├── gesture.py
│   ├── websocket.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── js/
│   │   ├── globe.js
│   │   ├── socket.js
│   │   └── scene.js
│   └── assets/
│       └── earth_texture.jpg
│
├── docs/
│   └── architecture.png
│
└── README.md
```

---

## 7. Alur Kerja Aplikasi

1. User membuka web app
2. Browser meminta izin kamera
3. Backend membaca stream kamera
4. MediaPipe mendeteksi landmark tangan
5. Sistem menentukan:
   - Posisi telapak tangan (x, y)
   - Arah dan sudut rotasi
6. Backend mengirim data transform via WebSocket
7. Frontend:
   - Memposisikan globe di atas tangan
   - Merotasi globe secara real-time

---

## 8. Deteksi Tangan

### Landmark Utama Digunakan
- Wrist
- Palm center (rata-rata landmark)
- Index MCP
- Pinky MCP

### Output Data
```json
{
  "hand_x": 0.52,
  "hand_y": 0.63,
  "rotation_x": 12.5,
  "rotation_y": -8.2,
  "confidence": 0.91
}
```

---

## 9. Gesture Mapping

| Gesture | Deskripsi | Aksi Globe |
|-------|----------|------------|
| Telapak terbuka | Tangan diam | Globe mengikuti posisi tangan |
| Putar pergelangan | Rotasi X/Y | Rotate globe |
| Kepalan | Freeze | Globe berhenti |

---

## 10. Rendering Globe

### Karakteristik
- Sphere geometry
- Earth texture
- Smooth lighting
- Semi-transparent shadow

### Posisi
- Offset Z positif dari telapak tangan
- Selalu mengikuti posisi tangan

---

## 11. WebSocket Contract

### Endpoint
```
/ws/hand-tracking
```

### Direction
- Server → Client (real-time data)

---

## 12. Performa & Optimasi

- FPS target: 30–60
- Frame skip jika confidence rendah
- Smoothing data landmark (moving average)
- Resize frame kamera (max 720p)

---

## 13. Risiko Teknis

| Risiko | Mitigasi |
|------|----------|
| Latency tinggi | WebSocket + local inference |
| Tangan tidak terdeteksi | Confidence threshold |
| Browser lambat | GPU WebGL rendering |

---

## 14. Milestone Pengembangan

### Phase 1
- Hand detection stabil
- Data posisi tangan

### Phase 2
- Globe 3D tampil
- Follow posisi tangan

### Phase 3
- Gesture rotation
- Smoothing gerakan

### Phase 4
- UI polish
- Dokumentasi

---

## 15. Hasil Akhir yang Diharapkan

- Globe 3D terlihat melayang di atas tangan
- Rotasi natural mengikuti gerakan tangan
- Responsif dan real-time di browser
- Siap dikembangkan ke AR lanjutan

---

## 16. Catatan Pengembangan Lanjutan
- Multi-hand support
- Zoom gesture
- Mobile WebXR
- Model ML custom gesture

---

**Status:** Blueprint final – siap implementasi

