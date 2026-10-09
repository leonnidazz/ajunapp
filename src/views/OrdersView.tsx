import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trip } from '../types';

export const OrdersView: React.FC = () => {
  const { currentUser, orders, activeTrip, setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'aktif' | 'riwayat'>('aktif');

  if (!currentUser) return null;

  // Active trips list (includes current active trip if not already in list)
  const activeTripsList = [...orders.aktif];
  if (activeTrip && !activeTripsList.some((t) => t.id === activeTrip.id)) {
    activeTripsList.unshift(activeTrip);
  }

  // Riwayat trips list (completed or cancelled trips ONLY; expired requests excluded)
  const riwayatTripsList = orders.riwayat;

  return (
    <div className="px-5 space-y-4 pb-28">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-white font-rubik tracking-tight">Pesanan Saya</h2>
        <p className="text-xs text-[#89938e] mt-0.5">
          Kelola perjalanan aktif &amp; riwayat tebengan kampus
        </p>
      </div>

      {/* Segmented Tab Controls (Exact replica of Image 12) */}
      <div className="p-1 bg-[#191c1b] rounded-full border border-white/10 flex gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('aktif')}
          className={`flex-1 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'aktif'
              ? 'bg-[#363a38] text-white shadow-sm'
              : 'text-[#89938e] hover:text-white'
          }`}
        >
          <span>Aktif</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'aktif'
                ? 'bg-[#03c6b2] text-[#004d44]'
                : 'bg-[#272b29] text-gray-400'
            }`}
          >
            {activeTripsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('riwayat')}
          className={`flex-1 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'riwayat'
              ? 'bg-[#363a38] text-white shadow-sm'
              : 'text-[#89938e] hover:text-white'
          }`}
        >
          <span>Riwayat</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'riwayat'
                ? 'bg-[#03c6b2] text-[#004d44]'
                : 'bg-[#272b29] text-gray-400'
            }`}
          >
            {riwayatTripsList.length}
          </span>
        </button>
      </div>

      {/* ================== TAB: AKTIF ================== */}
      {activeTab === 'aktif' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-[#89938e] uppercase tracking-wider">
              Tebengan Menuju / Dari Kampus
            </span>
            <span className="text-xs text-[#44e2cd]">
              {activeTripsList.length} Sedang Berjalan
            </span>
          </div>

          {activeTripsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-[#191c1b] rounded-3xl border border-dashed border-white/10 my-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#1e2022] flex items-center justify-center text-[#89938e]">
                <span className="material-symbols-outlined text-3xl">electric_scooter</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-rubik">
                  Belum ada perjalanan aktif
                </h4>
                <p className="text-xs text-[#89938e] max-w-xs mt-1">
                  Cari driver searah atau tawarkan tebengan di Beranda kampus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('passenger_search')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1b5e4b] hover:bg-[#286956] text-[#94d5bd] text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                <span>Cari Tebengan</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ) : (
            activeTripsList.map((trip) => {
              const isUserDriver = trip.driverId === currentUser.id;
              const peerName = isUserDriver ? trip.passengerName : trip.driverName;
              const peerAvatar = isUserDriver ? trip.passengerAvatar : trip.driverAvatar;

              return (
                <article
                  key={trip.id}
                  className="bg-[#191c1b] rounded-3xl p-5 border border-[#44e2cd]/30 relative overflow-hidden flex flex-col gap-3.5 shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={peerAvatar}
                        alt={peerName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#44e2cd]/50 shadow-md"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">{peerName}</h3>
                        <p className="text-[11px] text-[#89938e]">
                          {isUserDriver ? trip.passengerFaculty : trip.driverVehicle}
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1b5e4b]/40 border border-[#44e2cd]/30 text-[#44e2cd] text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#44e2cd] animate-pulse"></span>
                      <span>Dikonfirmasi</span>
                    </div>
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-[#1e2022] text-gray-300 text-[11px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-[#44e2cd]">
                        {isUserDriver ? 'two_wheeler' : 'person'}
                      </span>
                      <span>Kamu: {isUserDriver ? 'Driver' : 'Passenger'}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#1e2022] text-gray-300 text-[11px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-[#93d4bb]">
                        schedule
                      </span>
                      <span>{trip.departureTime}</span>
                    </div>
                  </div>

                  {/* Route Block */}
                  <div className="space-y-2 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-white/20">
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#44e2cd] ring-4 ring-[#191c1b]"></div>
                      <p className="text-[10px] text-gray-400">Penjemputan</p>
                      <p className="text-xs font-semibold text-white">{trip.origin}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-[#ffb4a9] ring-4 ring-[#191c1b]"></div>
                      <p className="text-[10px] text-gray-400">Tujuan</p>
                      <p className="text-xs font-semibold text-white">{trip.destination}</p>
                    </div>
                  </div>

                  {/* Fare & CTA Actions */}
                  <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Estimasi Ongkos Bersama</span>
                      <span className="text-sm font-bold text-[#44e2cd]">
                        Rp {trip.fare.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCurrentView('active_trip')}
                        className="py-2.5 px-4 rounded-full bg-[#1e2022] hover:bg-[#282a2c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-base">chat_bubble</span>
                        <span>Buka Chat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentView('active_trip')}
                        className="py-2.5 px-4 rounded-full bg-[#03c6b2] hover:bg-[#44e2cd] text-[#004d44] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span>Lihat Peta</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* ================== TAB: RIWAYAT ================== */}
      {activeTab === 'riwayat' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-[#89938e] uppercase tracking-wider">
              Riwayat Perjalanan Selesai
            </span>
            <span className="text-[11px] text-gray-400">Bulan Ini</span>
          </div>

          {riwayatTripsList.length === 0 ? (
            <div className="p-8 text-center bg-[#191c1b] rounded-2xl border border-white/10 text-xs text-gray-400">
              Belum ada riwayat perjalanan yang diselesaikan atau dibatalkan.
            </div>
          ) : (
            riwayatTripsList.map((trip) => {
              const isCompleted = trip.status === 'COMPLETED';
              const isUserDriver = trip.driverId === currentUser.id;
              const peerName = isUserDriver ? trip.passengerName : trip.driverName;

              return (
                <article
                  key={trip.id}
                  className="bg-[#191c1b] rounded-2xl p-4 border border-white/10 flex flex-col gap-2.5 hover:border-white/20 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2022] flex items-center justify-center text-[#44e2cd] border border-white/10">
                        <span className="material-symbols-outlined text-xl">
                          {isUserDriver ? 'two_wheeler' : 'person'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{peerName}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <span>Kamu: {isUserDriver ? 'Driver' : 'Passenger'}</span>
                          <span>•</span>
                          <span>{trip.departureTime}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-[#1b5e4b]/40 border border-[#1b5e4b] text-[#94d5bd]'
                          : 'bg-[#93000a]/40 border border-[#93000a] text-[#ffb4ab]'
                      }`}
                    >
                      {isCompleted ? 'Selesai' : 'Dibatalkan'}
                    </span>
                  </div>

                  <div className="bg-[#121416] p-2.5 rounded-xl flex items-center gap-2 text-xs text-gray-300">
                    <span className="material-symbols-outlined text-sm text-[#44e2cd] shrink-0">
                      route
                    </span>
                    <span className={`truncate ${!isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {trip.origin} → {trip.destination}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-gray-400 text-[11px]">
                      {isCompleted ? 'Total Biaya Tebengan' : 'Status Pembatalan'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {isCompleted ? `Rp ${trip.fare.toLocaleString('id-ID')}` : '-'}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
