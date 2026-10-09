# AJUN — Antar Jemput UNDIP (Prototype)

Prototipe full-stack AJUN untuk menguji alur Driver dan Passenger menggunakan Express, React, Vite, dan SSE.

## Menjalankan lokal

Prasyarat: Node.js 20+ dan npm.

1. Pasang dependensi: `npm install`
2. Jalankan aplikasi: `npm run dev`
3. Buka URL yang ditampilkan oleh server (umumnya `http://localhost:3000`).

## Simulasi dua akun

- Tab Driver: buka `http://localhost:3000/?as=driver`
- Tab Passenger: buka `http://localhost:3000/?as=passenger`

Parameter `as` dipakai untuk memilih identitas awal tab, lalu dihapus dari URL. Identitas demo disimpan per-tab menggunakan `sessionStorage`. Data perjalanan tetap dibagikan lewat server.

## Catatan penting

- Ini adalah prototipe/demo, bukan sistem produksi.
- Autentikasi Google/OTP/SSO belum terintegrasi. Jangan masukkan data pengguna sungguhan.
- Top-up hanya simulasi dan dinonaktifkan pada mode production; QRIS sungguhan belum terintegrasi.
- Peta, GPS, jarak, dan ETA adalah simulasi, bukan lokasi langsung.
- API belum memiliki lapisan autentikasi dan otorisasi produksi yang lengkap. Jangan deploy ke internet publik sebelum lapisan ini dirancang dan diuji.
- Untuk mode production, jalankan `npm run build` terlebih dahulu, lalu `npm start`.
