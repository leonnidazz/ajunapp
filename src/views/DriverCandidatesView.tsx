import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MatchingCandidate, RideRequest } from '../types';
import * as api from '../services/api';
import { calculateCompatibilityScore } from '../services/matching';

export const DriverCandidatesView: React.FC = () => {
  const {
    currentUser,
    incomingRequests,
    openOffers,
    setCurrentView,
    showToast,
    refreshAllData,
  } = useApp();

  const [selectedCandidate, setSelectedCandidate] = useState<MatchingCandidate | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [isCancellingOffer, setIsCancellingOffer] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Dynamic 1-second ticker for request countdowns (R1)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // D1 Fix: Select the driver's latest active open offer
  const myOffers = openOffers
    .filter((o) => o.driverId === currentUser?.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  const myOffer = myOffers[0];

  const driverRoute = {
    origin: myOffer?.origin || 'Tembalang (Dekat FSM)',
    destination: myOffer?.destination || 'Pleburan / Simpang Lima',
    departureTime: myOffer?.departureTime || '08:35 WIB',
    targetFare: myOffer?.fare || 8000,
  };

  const handleCancelMyOffer = async () => {
    if (!myOffer || !currentUser) return;
    if (!confirm('Batalkan tawaran tebengan ini dan tutup pencarian penumpang?')) return;
    setIsCancellingOffer(true);
    try {
      await api.cancelOffer(myOffer.id, currentUser.id);
      showToast('Tawaran tebengan berhasil dibatalkan.', 'info');
      await refreshAllData();
      setCurrentView('home');
    } catch (err: any) {
      showToast(err.message || 'Gagal membatalkan tawaran', 'error');
    } finally {
      setIsCancellingOffer(false);
    }
  };

  // Base campus mock candidates
  const baseCandidates: MatchingCandidate[] = [
    {
      id: 'cand-nabila',
      name: 'Nabila Saraswati',
      role: 'passenger',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      faculty: 'Fakultas Ekonomika & Bisnis (FEB) • \'22',
      origin: 'Sekitar Tembalang (Dekat Rusunawa)',
      destination: 'Kampus Pleburan (Jl. Hayam Wuruk / Gedung Pascasarjana)',
      departureTime: '08:35 WIB',
      fare: 8000,
      distanceMeters: 400,
      compatibilityScore: 96,
      compatibilityBreakdown: { route: 40, distance: 25, time: 20, fare: 11 },
      note: 'Bisa tunggu di depan gerbang FSM dekat warung kopi',
    },
    {
      id: 'cand-rizky',
      name: 'Rizky Ramadhan',
      role: 'passenger',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      faculty: 'Fakultas Teknik Arsitektur • \'21',
      origin: 'Tembalang Selatan',
      destination: 'Jl. Sriwijaya (Arah Pleburan)',
      departureTime: '08:40 WIB',
      fare: 7500,
      distanceMeters: 850,
      compatibilityScore: 88,
      compatibilityBreakdown: { route: 35, distance: 21, time: 17, fare: 15 },
      note: 'Siap jemput di halte FT',
    },
    {
      id: 'cand-dinda',
      name: 'Dinda Maharani',
      role: 'passenger',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      faculty: 'Fakultas Hukum • \'23',
      origin: 'Tembalang (Banyuputih)',
      destination: 'Simpang Lima Semarang',
      departureTime: '08:50 WIB',
      fare: 10000,
      distanceMeters: 1200,
      compatibilityScore: 79,
      compatibilityBreakdown: { route: 33, distance: 17, time: 13, fare: 16 },
      note: 'Bisa agak molor 5 menit',
    },
    {
      id: 'cand-bima',
      name: 'Bima Arya',
      role: 'passenger',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      faculty: 'Fakultas Psikologi • \'21',
      origin: 'Banjarsari Tembalang',
      destination: 'RS Roemani / Wonodri',
      departureTime: '09:00 WIB',
      fare: 9000,
      distanceMeters: 1800,
      compatibilityScore: 65,
      compatibilityBreakdown: { route: 24, distance: 12, time: 13, fare: 16 },
    },
  ];

  // Dynamically calculate scores for deterministic transparency
  const scoredCandidates = baseCandidates
    .map((c) => {
      const calc = calculateCompatibilityScore(driverRoute, {
        origin: c.origin,
        destination: c.destination,
        departureTime: c.departureTime,
        fare: c.fare,
        distanceMeters: c.distanceMeters,
      });
      return {
        ...c,
        compatibilityScore: calc.score,
        compatibilityBreakdown: calc.breakdown,
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // If there is an active incoming request from passenger, auto-select it for convenient testing
  useEffect(() => {
    if (incomingRequests.length > 0 && !selectedRequest) {
      setSelectedRequest(incomingRequests[0]);
    }
  }, [incomingRequests, selectedRequest]);

  // Handle Driver Response (Accept / Reject Request)
  const handleRespond = async (requestId: string, action: 'accept' | 'reject') => {
    if (!currentUser) return;
    setIsResponding(true);
    try {
      const res = await api.respondToRequest(requestId, currentUser.id, action);
      if (action === 'accept') {
        showToast('Permintaan tebengan berhasil diterima! 1 Koin telah dipotong.', 'success');
        await refreshAllData();
        setCurrentView('active_trip');
      } else {
        showToast('Permintaan tebengan ditolak.', 'info');
        setSelectedRequest(null);
        await refreshAllData();
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses respon tebengan', 'error');
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="px-5 space-y-5 pb-32">
      {/* Top status indicator pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1b5e4b]/40 text-[#44e2cd] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">two_wheeler</span>
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Matching Driver
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b5e4b]/30 border border-[#44e2cd]/30 text-[#44e2cd] text-[11px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#44e2cd] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#44e2cd]"></span>
          </span>
          <span>Auto-Matching Aktif</span>
        </div>
      </div>

      {/* Driver Trip Information Card (Faithful to Image 6) */}
      <section className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#1b5e4b] via-[#12382c] to-[#191c1b] border border-[#93d4bb]/30 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-black/40 text-[#44e2cd]">
              <span className="material-symbols-outlined text-base">sports_motorsports</span>
            </span>
            <span className="text-xs font-bold text-[#94d5bd] uppercase tracking-wider">
              Rute Aktif Driver
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {myOffer && (
              <button
                disabled={isCancellingOffer}
                onClick={handleCancelMyOffer}
                className="text-[11px] text-[#ffb4ab] bg-[#93000a]/30 hover:bg-[#93000a]/50 px-3 py-1 rounded-full border border-[#ffb4ab]/30 flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                type="button"
                title="Tutup tawaran tebengan ini"
              >
                <span>{isCancellingOffer ? 'Menutup...' : 'Tutup Tawaran'}</span>
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
            <button
              onClick={() => setCurrentView('driver_publish')}
              className="text-[11px] text-white bg-black/30 hover:bg-black/50 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 transition-all active:scale-95"
              type="button"
            >
              <span>Ubah Rute</span>
              <span className="material-symbols-outlined text-xs">edit</span>
            </button>
          </div>
        </div>

        <div className="mt-3.5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#44e2cd] ring-4 ring-[#44e2cd]/20"></span>
              <span className="w-0.5 h-6 bg-white/20 my-0.5"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#93d4bb] ring-4 ring-[#93d4bb]/20"></span>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-[11px] text-[#94d5bd]">Lokasi Awal</p>
                <p className="text-xs font-semibold text-white">{driverRoute.origin}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#94d5bd]">Tujuan Akhir</p>
                <p className="text-xs font-semibold text-white">{driverRoute.destination}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 px-3 py-2 rounded-xl bg-black/30 border border-white/5">
            <div className="flex items-center gap-2 text-gray-300 text-xs">
              <span className="material-symbols-outlined text-sm text-[#44e2cd]">schedule</span>
              <span>Waktu Berangkat</span>
            </div>
            <span className="text-xs font-bold text-[#44e2cd]">{driverRoute.departureTime}</span>
          </div>
        </div>
      </section>

      {/* INCOMING REQUESTS FROM PASSENGERS (REAL-TIME INTERACTION) */}
      {incomingRequests.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#44e2cd] animate-ping"></span>
              <h3 className="text-sm font-bold text-white font-rubik">
                Permintaan Tebengan Masuk ({incomingRequests.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#44e2cd] font-medium">Batas Waktu: 60 Detik</span>
          </div>

          {incomingRequests.map((req) => {
            const timeLeftSec = Math.max(0, Math.floor((req.expiresAt - currentTime) / 1000));
            return (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-[#004d44] border-2 border-[#44e2cd] shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.passengerAvatar}
                      alt={req.passengerName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#44e2cd]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{req.passengerName}</h4>
                      <p className="text-[11px] text-[#94d5bd]">{req.passengerFaculty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-[#44e2cd] text-[#003731] text-[10px] font-bold">
                      {timeLeftSec > 0 ? `${timeLeftSec}s lagi` : 'Kedaluwarsa'}
                    </span>
                    <span className="block text-xs font-bold text-white mt-1">
                      Rp {req.fare.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 text-[11px] text-gray-200 space-y-1">
                  <div>
                    <span className="text-gray-400">Jemput:</span> {req.origin}
                  </div>
                  <div>
                    <span className="text-gray-400">Tujuan:</span> {req.destination}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    disabled={isResponding}
                    onClick={() => handleRespond(req.id, 'reject')}
                    className="py-2.5 px-3 rounded-full bg-black/40 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold active:scale-95 transition-all"
                  >
                    Tolak
                  </button>
                  <button
                    disabled={isResponding}
                    onClick={() => handleRespond(req.id, 'accept')}
                    className="py-2.5 px-4 rounded-full bg-[#44e2cd] hover:bg-[#62fae3] text-[#003731] text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isResponding ? (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>Terima Tebengan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Candidates List Header */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-rubik">Passenger Tersedia</h3>
            <span className="text-xs text-[#89938e]">
              {scoredCandidates.length} Mahasiswa Searah
            </span>
          </div>
          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1 text-[11px] bg-[#191c1b] px-2.5 py-1 rounded-full border border-white/10 text-[#44e2cd] hover:underline"
          >
            <span className="material-symbols-outlined text-xs">calculate</span>
            <span>Formula Skor</span>
          </button>
        </div>

        {/* Candidate Cards */}
        <div className="space-y-3">
          {scoredCandidates.map((c, idx) => {
            const isTop = idx === 0;
            return (
              <article
                key={c.id}
                className={`rounded-3xl p-4 transition-all relative overflow-hidden ${
                  isTop
                    ? 'bg-[#191c1b] border-2 border-[#44e2cd]/50 shadow-xl'
                    : 'bg-[#191c1b] border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Score Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.name}</h4>
                      <p className="text-[11px] text-[#89938e]">{c.faculty}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isTop
                        ? 'bg-[#44e2cd] text-[#003731] shadow-sm'
                        : 'bg-[#1e2022] text-[#93d4bb] border border-[#93d4bb]/30'
                    }`}
                  >
                    {c.compatibilityScore}% Cocok
                  </span>
                </div>

                {/* Info Block */}
                <div className="mt-3.5 space-y-1.5 bg-[#121416] p-3 rounded-2xl border border-white/5 text-xs text-[#bfc9c3]">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tujuan:</span>
                    <span className="text-white font-medium truncate max-w-[200px]">
                      {c.destination}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jarak jemput:</span>
                    <span className="text-[#44e2cd] font-medium">~{c.distanceMeters} m dari posisimu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jam berangkat:</span>
                    <span className="text-white font-medium">{c.departureTime}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Estimasi Ongkos</span>
                    <span className="text-sm font-bold text-[#44e2cd]">
                      Rp {c.fare.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(c)}
                    className="px-4 py-2 rounded-full bg-white hover:bg-neutral-100 text-[#0c0e10] text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>Lihat Detail</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* DETAIL BOTTOM SHEET MODAL (Replicating Bottom Sheet in Image 6) */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-[#191c1b] rounded-t-3xl border-t border-white/10 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-1"></div>

            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#44e2cd]"
                />
                <div>
                  <h4 className="text-base font-bold text-white font-rubik">
                    {selectedCandidate.name}
                  </h4>
                  <p className="text-xs text-[#89938e]">{selectedCandidate.faculty}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#44e2cd] text-[#003731] text-xs font-bold shadow-sm">
                {selectedCandidate.compatibilityScore}% Cocok
              </span>
            </div>

            {/* Route Detail */}
            <div className="p-3.5 rounded-2xl bg-[#121416] border border-white/5 space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-[#44e2cd] uppercase tracking-wider">
                Detail Rute Tebengan
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#44e2cd] text-base shrink-0 mt-0.5">
                  trip_origin
                </span>
                <div>
                  <span className="font-semibold text-white block">Titik Temu:</span>
                  <span className="text-gray-300">{selectedCandidate.origin}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#93d4bb] text-base shrink-0 mt-0.5">
                  location_on
                </span>
                <div>
                  <span className="font-semibold text-white block">Menuju:</span>
                  <span className="text-gray-300">{selectedCandidate.destination}</span>
                </div>
              </div>
              {selectedCandidate.note && (
                <div className="p-2.5 rounded-xl bg-[#1e2022] text-gray-300 italic text-[11px]">
                  Catatan: "{selectedCandidate.note}"
                </div>
              )}
            </div>

            {/* Compatibility Breakdown Explanation */}
            <div className="p-3 bg-[#1e2022] rounded-2xl border border-white/5 space-y-1.5 text-[11px] text-gray-300">
              <div className="font-semibold text-white">Rincian Kompatibilitas Prototipe:</div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>Rute: {selectedCandidate.compatibilityBreakdown.route}/40 poin</div>
                <div>Jarak: {selectedCandidate.compatibilityBreakdown.distance}/25 poin</div>
                <div>Waktu: {selectedCandidate.compatibilityBreakdown.time}/20 poin</div>
                <div>Tarif: {selectedCandidate.compatibilityBreakdown.fare}/15 poin</div>
              </div>
              <p className="text-[10px] text-gray-400 pt-1">
                * Skor deterministik untuk membantu mencocokkan mahasiswa tanpa klaim prediksi AI tertutup.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="flex-1 py-3.5 rounded-full bg-[#1e2022] text-white text-xs font-semibold active:scale-95 transition-all"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Pengajuan perjalanan dilakukan dari akun Passenger. Buka tab Passenger untuk mengajukan ke Driver ini.', 'info');
                  setSelectedCandidate(null);
                }}
                className="flex-1 py-3.5 rounded-full bg-[#1e2022] text-gray-300 text-xs font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Buka dari Akun Passenger</span>
                <span className="material-symbols-outlined text-sm">info</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULA EXPLANATION MODAL */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#191c1b] border border-white/10 rounded-3xl p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h4 className="text-sm font-bold text-white font-rubik">
                Logika Formula Kecocokan
              </h4>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Algoritma pencocokan AJUN bekerja secara <strong>deterministik dan transparan</strong>:
            </p>
            <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside">
              <li><strong>Rute &amp; Tujuan (40%)</strong>: Kesesuaian koridor kampus Pleburan/Tembalang.</li>
              <li><strong>Jarak Penjemputan (25%)</strong>: Radius &lt;400m mendapatkan bobot tertinggi.</li>
              <li><strong>Waktu Keberangkatan (20%)</strong>: Selisih jadwal keberangkatan &le;5 menit.</li>
              <li><strong>Kesesuaian Tarif (15%)</strong>: Rentang estimasi ongkos bensin bersama.</li>
            </ul>
            <p className="text-[11px] text-[#94d5bd]">
              Pengguna tetap memiliki kebebasan penuh memilih mitra tebengan secara manual.
            </p>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="w-full py-2.5 rounded-full bg-white text-[#0c0e10] text-xs font-bold"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
