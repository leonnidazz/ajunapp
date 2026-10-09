import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RideOffer, MatchingCandidate } from '../types';
import * as api from '../services/api';
import { calculateCompatibilityScore } from '../services/matching';

export const PassengerCandidatesView: React.FC = () => {
  const { currentUser, openOffers, myRequests, setCurrentView, showToast, refreshAllData } = useApp();

  const [origin, setOrigin] = useState('Tembalang (Dekat FSM / Rusunawa)');
  const [destination, setDestination] = useState('Kampus Pleburan (Jl. Hayam Wuruk)');
  const [departureTime, setDepartureTime] = useState('08:35 WIB');
  const [targetFare, setTargetFare] = useState(8000);
  const [isEditingRoute, setIsEditingRoute] = useState(false);

  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  if (!currentUser) return null;

  const passengerQuery = {
    origin,
    destination,
    departureTime,
    targetFare,
  };

  // Convert real open offers from drivers into candidate format (excluding self-offers)
  const realDriverCandidates = openOffers
    .filter((offer) => offer.driverId !== currentUser.id)
    .map((offer) => {
    const calc = calculateCompatibilityScore(passengerQuery, {
      origin: offer.origin,
      destination: offer.destination,
      departureTime: offer.departureTime,
      fare: offer.fare,
      distanceMeters: 350,
    });

    return {
      id: offer.id,
      isRealOffer: true,
      offerId: offer.id,
      driverId: offer.driverId,
      name: offer.driverName,
      faculty: offer.driverFaculty || 'FSM Undip',
      avatar: offer.driverAvatar,
      rating: offer.driverRating,
      vehicle: offer.vehicle,
      vehiclePlat: offer.vehiclePlat,
      origin: offer.origin,
      destination: offer.destination,
      departureTime: offer.departureTime,
      fare: offer.fare,
      distanceMeters: 350,
      note: offer.note,
      compatibilityScore: calc.score,
      compatibilityBreakdown: calc.breakdown,
    };
  });

  // Additional mock drivers from the campus community for realistic depth
  const mockDrivers = [
    {
      id: 'mock-farhan',
      isRealOffer: false,
      offerId: 'mock-off-1',
      driverId: 'user-farhan',
      name: 'Farhan Maulana',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      faculty: 'Fakultas Ekonomika & Bisnis • \'20',
      vehicle: 'Beat Street Hitam (H 3218 **)',
      vehiclePlat: 'H 3218 XX',
      origin: 'Banjarsari Tembalang',
      destination: 'Jl. Sriwijaya (Arah Pleburan)',
      departureTime: '08:40 WIB',
      fare: 8000,
      distanceMeters: 600,
      note: 'Helm SNI ada dua',
      compatibilityScore: 89,
      compatibilityBreakdown: { route: 35, distance: 21, time: 17, fare: 16 },
    },
    {
      id: 'mock-bagas',
      isRealOffer: false,
      offerId: 'mock-off-2',
      driverId: 'user-bagas',
      name: 'Bagas Wicaksono',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      faculty: 'Fakultas Hukum • \'22',
      vehicle: 'Honda Vario 125 Putih',
      vehiclePlat: 'H 5891 YY',
      origin: 'Tembalang Selatan',
      destination: 'Simpang Lima Semarang',
      departureTime: '08:45 WIB',
      fare: 10000,
      distanceMeters: 1100,
      compatibilityScore: 82,
      compatibilityBreakdown: { route: 33, distance: 17, time: 13, fare: 19 },
    },
    {
      id: 'mock-aditya',
      isRealOffer: false,
      offerId: 'mock-off-3',
      driverId: 'user-aditya',
      name: 'Aditya Nugroho',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      faculty: 'FISIP • \'21',
      vehicle: 'Honda Scoopy Matte',
      vehiclePlat: 'H 2901 ZZ',
      origin: 'Sirojudin Tembalang',
      destination: 'Pleburan / Wonodri',
      departureTime: '08:50 WIB',
      fare: 8000,
      distanceMeters: 1400,
      compatibilityScore: 74,
      compatibilityBreakdown: { route: 24, distance: 12, time: 13, fare: 25 },
    },
  ];

  // Combine and sort by compatibility score descending
  const allDrivers = [...realDriverCandidates, ...mockDrivers].sort(
    (a, b) => b.compatibilityScore - a.compatibilityScore
  );

  // Check if passenger already has a pending request for an offer
  const pendingRequest = myRequests.find((r) => r.status === 'REQUESTED');

  const handleSelectDriver = async (driver: any) => {
    if (currentUser.coins < 1) {
      showToast('Saldo koin Anda 0. Silakan Top Up minimal 1 Koin untuk memesan tebengan.', 'error');
      setCurrentView('topup');
      return;
    }

    setIsSendingRequest(true);
    try {
      if (driver.isRealOffer) {
        // Submit real request to backend
        await api.sendRideRequest({
          offerId: driver.offerId,
          passengerId: currentUser.id,
          origin,
          destination,
          departureTime,
          fare: driver.fare,
        });

        showToast(
          `Permintaan tebengan berhasil dikirim ke ${driver.name}! Menunggu konfirmasi driver (60 detik)...`,
          'success'
        );
      } else {
        // If passenger requests a mock driver, simulate realistic prompt
        showToast(
          `Simulasi pengajuan tebengan ke ${driver.name} dikirim. Buka jendela kedua dengan Driver (Akun A Dimas) untuk simulasi terima/tolak langsung!`,
          'info'
        );
      }

      await refreshAllData();
      setSelectedDriver(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim permintaan', 'error');
    } finally {
      setIsSendingRequest(false);
    }
  };

  return (
    <div className="px-5 space-y-5 pb-32">
      {/* Top Header Pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1b5e4b]/40 text-[#44e2cd] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">moped</span>
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Matching Passenger
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e2022] border border-white/10 text-[#44e2cd] text-[11px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#44e2cd] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#44e2cd]"></span>
          </span>
          <span>Mencari Driver Aktif</span>
        </div>
      </div>

      {/* Passenger Trip Information Card (Exact replica of Image 4) */}
      <section className="hero-emerald-card rounded-2xl p-4 border border-white/10 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#44e2cd] text-base">route</span>
            <span className="text-[11px] font-semibold text-[#aef0d7] uppercase tracking-wider">
              Rute Permintaanmu
            </span>
          </div>
          <button
            onClick={() => setIsEditingRoute(!isEditingRoute)}
            className="text-[11px] text-white bg-black/30 hover:bg-black/50 px-3 py-1 rounded-full border border-white/10 transition-colors active:scale-95 flex items-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-xs">edit</span>
            <span>{isEditingRoute ? 'Selesai' : 'Ubah Rute'}</span>
          </button>
        </div>

        {isEditingRoute ? (
          <div className="mt-3 space-y-2.5">
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Lokasi Jemput</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Tujuan</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        ) : (
          <div className="mt-3.5 relative pl-6 space-y-3.5">
            <div className="absolute left-[7px] top-[9px] bottom-[10px] w-0.5 border-l border-dashed border-[#44e2cd]/60"></div>
            {/* Jemput */}
            <div className="relative">
              <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#44e2cd] ring-4 ring-[#1b5e4b]"></span>
              <div>
                <p className="text-[11px] text-[#44e2cd]">Lokasi Jemput</p>
                <p className="text-xs font-semibold text-white">{origin}</p>
              </div>
            </div>
            {/* Tujuan */}
            <div className="relative">
              <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#ffb4a9] ring-4 ring-[#1b5e4b]"></span>
              <div>
                <p className="text-[11px] text-[#ffb4a9]">Tujuan</p>
                <p className="text-xs font-semibold text-white">{destination}</p>
              </div>
            </div>
          </div>
        )}

        {/* Meta Route Details */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-lg text-gray-300">
            <span className="material-symbols-outlined text-sm text-[#44e2cd]">schedule</span>
            <span className="text-[11px] text-white">Waktu: {departureTime}</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-[#44e2cd]/15 px-2.5 py-1 rounded-lg">
            <span className="text-[11px] font-bold text-[#44e2cd]">
              Rp 8.000 – Rp 10.000
            </span>
          </div>
        </div>
      </section>

      {/* PENDING REQUEST ALERT IF PASSENGER IS WAITING FOR DRIVER */}
      {pendingRequest && (
        <div className="p-4 rounded-2xl bg-[#004d44] border border-[#62fae3]/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#62fae3] animate-ping"></span>
              <span className="text-xs font-bold text-white">
                Permintaan Terkirim ke {pendingRequest.driverName}!
              </span>
            </div>
            <button
              onClick={async () => {
                try {
                  await api.withdrawRequest(pendingRequest.id, currentUser.id);
                  showToast('Permintaan tebengan berhasil ditarik kembali.', 'info');
                  await refreshAllData();
                } catch (err: any) {
                  showToast(err.message || 'Gagal menarik permintaan', 'error');
                }
              }}
              className="text-[10px] px-2.5 py-1 rounded-full bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:bg-[#93000a]/60 active:scale-95 transition-all"
            >
              Tarik Permintaan
            </button>
          </div>
          <p className="text-[11px] text-[#94d5bd]">
            Driver ({pendingRequest.driverName}) sedang meninjau permintaan tebenganmu. Anda akan otomatis terhubung ke Perjalanan Aktif begitu diterima.
          </p>
        </div>
      )}

      {/* Driver List Section Header */}
      <section className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white font-rubik">Driver Tersedia</h2>
          <span className="bg-[#1e2022] text-[#44e2cd] border border-[#44e2cd]/20 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {allDrivers.length} Driver Searah
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-[11px] bg-[#191c1b] px-2.5 py-1 rounded-full border border-white/10">
          <span className="material-symbols-outlined text-xs text-[#44e2cd]">sort</span>
          <span>Diurutkan paling cocok</span>
        </div>
      </section>

      {/* Driver Cards */}
      <section className="space-y-3">
        {allDrivers.map((driver, idx) => {
          const isTopMatch = idx === 0;
          return (
            <article
              key={driver.id}
              className={`rounded-2xl p-4 transition-all relative overflow-hidden ${
                isTopMatch
                  ? 'bg-[#191c1b] border-2 border-[#44e2cd]/50 shadow-xl'
                  : 'bg-[#191c1b] border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1b5e4b] text-white font-rubik font-bold flex items-center justify-center border border-[#44e2cd]/40 ring-2 ring-[#44e2cd]/20">
                    {driver.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{driver.name}</h3>
                    {driver.faculty && (
                      <p className="text-[11px] text-[#89938e]">{driver.faculty}</p>
                    )}
                  </div>
                </div>
                <span className="bg-[#44e2cd] text-[#003731] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  {driver.compatibilityScore}% Cocok
                </span>
              </div>

              {/* Meta Pills */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#121416] px-2.5 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#44e2cd]">two_wheeler</span>
                  <span className="text-[11px] text-gray-200 truncate">{driver.vehicle}</span>
                </div>
                <div className="bg-[#121416] px-2.5 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#44e2cd]">near_me</span>
                  <span className="text-[11px] text-gray-200">~{driver.distanceMeters} m dari titikmu</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-white/10">
                <div>
                  <p className="text-[11px] text-gray-400">
                    Tujuan: <span className="text-white font-medium">{driver.destination}</span>
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Jam: <span className="text-white font-medium">{driver.departureTime}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Ongkos</span>
                  <span className="text-sm font-bold text-[#44e2cd]">
                    Rp {driver.fare.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedDriver(driver)}
                  className="w-full bg-white hover:bg-neutral-100 text-[#0c0e10] text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>Lihat Detail</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* DRIVER DETAIL BOTTOM SHEET MODAL (Faithful to Image 4 Bottom Half) */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-[#191c1b] rounded-t-3xl border-t border-white/10 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-1"></div>

            {/* Profile Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1b5e4b] text-white font-rubik font-bold text-base flex items-center justify-center border border-[#44e2cd] ring-2 ring-[#44e2cd]/30">
                  {selectedDriver.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-rubik">
                    {selectedDriver.name}
                  </h3>
                  <p className="text-xs text-[#89938e] flex items-center gap-1">
                    <span className="text-amber-300">★ 4.9 (simulasi)</span> • Profil demo (belum diverifikasi)
                  </p>
                </div>
              </div>
              <span className="bg-[#44e2cd] text-[#003731] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {selectedDriver.compatibilityScore}% Cocok
              </span>
            </div>

            {/* Detail Rute Tebengan List */}
            <div className="space-y-2 bg-[#121416] p-3.5 rounded-2xl border border-white/5 text-xs">
              <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">
                Detail Rute Tebengan
              </p>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#44e2cd] text-base shrink-0 mt-0.5">
                  trip_origin
                </span>
                <p className="text-gray-300">
                  <strong className="text-white">Titik Jemput:</strong> {selectedDriver.origin} (Radius ~{selectedDriver.distanceMeters} meter)
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#ffb4a9] text-base shrink-0 mt-0.5">
                  location_on
                </span>
                <p className="text-gray-300">
                  <strong className="text-white">Menuju:</strong> {selectedDriver.destination}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#93d4bb] text-base shrink-0 mt-0.5">
                  two_wheeler
                </span>
                <p className="text-gray-300">
                  <strong className="text-white">Kendaraan:</strong> {selectedDriver.vehicle}
                </p>
              </div>
              {selectedDriver.note && (
                <div className="p-2.5 rounded-xl bg-[#1e2022] text-gray-300 italic text-[11px]">
                  Catatan Driver: "{selectedDriver.note}"
                </div>
              )}
            </div>

            {/* Fare Summary */}
            <div className="p-3 bg-[#1e2022] rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Ongkos Tebengan (Bensin)</span>
                <span className="text-sm font-bold text-[#44e2cd]">
                  Rp {selectedDriver.fare.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[11px]">Biaya Matching Platform</span>
                <span className="text-xs font-semibold text-white">1 AJUN Koin</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="flex-1 py-3.5 rounded-full bg-[#1e2022] text-white text-xs font-semibold active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSendingRequest}
                onClick={() => handleSelectDriver(selectedDriver)}
                className="flex-1 py-3.5 rounded-full bg-[#44e2cd] hover:bg-[#3cddc7] text-[#003731] font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSendingRequest ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <>
                    <span>Pilih Driver</span>
                    <span className="material-symbols-outlined text-sm">send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
