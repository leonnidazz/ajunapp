import React from 'react';
import { useApp } from '../context/AppContext';

export const FirebaseStatusModal: React.FC = () => {
  const { isFirebaseModalOpen, setIsFirebaseModalOpen } = useApp();

  if (!isFirebaseModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#191c1b] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1b5e4b]/40 border border-[#44e2cd]/30 flex items-center justify-center text-[#44e2cd]">
              <span className="material-symbols-outlined text-2xl">database</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-rubik">Status Backend &amp; Firebase</h3>
              <p className="text-xs text-[#89938e]">Arsitektur Data &amp; Sinkronisasi Real-time</p>
            </div>
          </div>
          <button
            onClick={() => setIsFirebaseModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#1e2022] flex items-center justify-center text-[#89938e] hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="space-y-3 text-xs text-[#bfc9c3]">
          {/* Status 1: Current Active Backend */}
          <div className="p-3.5 rounded-2xl bg-[#1d201f] border border-[#44e2cd]/30 space-y-1.5">
            <div className="flex items-center gap-2 text-[#44e2cd] font-semibold">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Full-Stack Express + Server-Sent Events (Aktif)</span>
            </div>
            <p className="text-[11px] text-[#e2e2e5] leading-relaxed">
              Semua data tebengan, koin, riwayat, dan chat tersimpan di server backend dan disinkronkan langsung secara instan (real-time) antar-jendela browser tanpa memerlukan reload halaman.
            </p>
          </div>

          {/* Status 2: Firebase Information */}
          <div className="p-3.5 rounded-2xl bg-[#121416] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#94d5bd] font-semibold">
              <span className="material-symbols-outlined text-base">cloud_sync</span>
              <span>Integrasi Cloud Firestore &amp; Auth (GCP)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Jika ingin menghubungkan langsung ke project Cloud Firestore eksternal di Google Cloud / Firebase Console:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300">
              <li>Konfirmasi terms persetujuan Firebase di panel tool AI Studio UI.</li>
              <li>Provisioning Cloud Firestore database untuk platform Web.</li>
              <li>Aturan keamanan ABAC (<code className="text-[#44e2cd]">firestore.rules</code>) dan skema <code className="text-[#44e2cd]">firebase-blueprint.json</code> siap di-deploy.</li>
            </ol>
            <div className="mt-2 p-2 rounded-xl bg-[#1b5e4b]/20 border border-[#1b5e4b]/40 text-[10px] text-[#94d5bd]">
              Saat ini aplikasi berjalan penuh menggunakan arsitektur backend Node.js/Express autoritatif dengan transaksi koin atomik dan single-seat ride matching.
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setIsFirebaseModalOpen(false)}
            className="w-full py-3 rounded-full bg-white text-[#0c0e10] font-semibold text-xs hover:bg-neutral-100 transition-all active:scale-95 shadow-md"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
