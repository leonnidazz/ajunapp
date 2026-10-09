import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { coinsToRupiah, formatRupiah } from '../services/coinService';

export const DashboardView: React.FC = () => {
  const { currentUser, setCurrentView, activeTrip, incomingRequests, showToast } = useApp();
  const [showBalance, setShowBalance] = useState(true);

  if (!currentUser) return null;

  const coins = currentUser.coins;
  const rupiah = coinsToRupiah(coins);
  const isEligible = coins >= 1;

  const handleDriverClick = () => {
    if (!isEligible) {
      showToast('Saldo koin Anda 0. Silakan Top Up minimal 1 Koin untuk membuka tebengan.', 'error');
      setCurrentView('topup');
      return;
    }
    // If user already has incoming requests or an open offer, take to driver candidates, otherwise publish
    setCurrentView('driver_publish');
  };

  const handlePassengerClick = () => {
    if (!isEligible) {
      showToast('Saldo koin Anda 0. Silakan Top Up minimal 1 Koin untuk mencari tebengan.', 'error');
      setCurrentView('topup');
      return;
    }
    setCurrentView('passenger_search');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Active Trip Banner if currently on a trip */}
      {activeTrip && (
        <div
          onClick={() => setCurrentView('active_trip')}
          className="mx-5 p-3.5 rounded-2xl bg-gradient-to-r from-[#1b5e4b] to-[#12382c] border border-[#44e2cd]/50 shadow-lg cursor-pointer flex items-center justify-between active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c0e10] flex items-center justify-center text-[#44e2cd] relative">
              <span className="material-symbols-outlined text-xl">two_wheeler</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#44e2cd] rounded-full animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Perjalanan Sedang Aktif!</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#44e2cd] text-[#003731] font-bold">
                  {activeTrip.status}
                </span>
              </div>
              <p className="text-[11px] text-[#94d5bd] truncate max-w-[200px]">
                {currentUser.role === 'driver' ? `Penumpang: ${activeTrip.passengerName}` : `Driver: ${activeTrip.driverName}`}
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#44e2cd] text-xl">arrow_forward</span>
        </div>
      )}

      {/* Incoming Requests Banner for Driver */}
      {incomingRequests.length > 0 && currentUser.role === 'driver' && (
        <div
          onClick={() => setCurrentView('driver_candidates')}
          className="mx-5 p-3 rounded-2xl bg-[#004d44] border border-[#62fae3]/40 shadow-md cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#62fae3] animate-pulse"></span>
            <span className="text-xs font-semibold text-white">
              Ada {incomingRequests.length} permintaan tebengan baru menunggumu!
            </span>
          </div>
          <span className="text-xs text-[#62fae3] font-bold underline">Lihat</span>
        </div>
      )}

      {/* Hero Emerald Balance Card */}
      <section className="mx-5 hero-emerald-card rounded-2xl p-5 text-[#e2e2e5] relative overflow-hidden transition-all shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-0.5">
            <p className="text-xs text-[#94d5bd]/90">
              Halo, {currentUser.name.split(' ')[0]} 👋
            </p>
            <h2 className="text-lg font-bold text-white font-rubik tracking-tight">
              {currentUser.name}
            </h2>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-black/30 border border-white/10 text-[11px] text-[#94d5bd]">
            {currentUser.faculty}
          </div>
        </div>

        {/* Balance Section */}
        <div className="space-y-1 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#94d5bd]/80 font-medium">
              Total Saldo AJUN Koin
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              aria-label="Sembunyikan Saldo"
              className="text-[#94d5bd]/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {showBalance ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
          <div className="flex items-baseline gap-2.5 pt-0.5">
            <span className="text-3xl font-bold text-white font-rubik tracking-tight">
              {showBalance ? `${coins} Koin` : '•••• Koin'}
            </span>
            {showBalance && (
              <span className="text-xs text-[#94d5bd] font-medium">
                ≈ {formatRupiah(rupiah)}
              </span>
            )}
          </div>
          
        </div>

        {/* Action Buttons inside Card */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setCurrentView('orders')}
            className="bg-black/30 hover:bg-black/40 text-white py-3 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">history</span>
            <span>Riwayat Trip</span>
          </button>
          <button
            onClick={() => setCurrentView('topup')}
            className="bg-white hover:bg-neutral-100 text-[#0c0e10] py-3 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-black/30 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>Top Up Koin</span>
          </button>
        </div>
      </section>

      {/* Eligibility Indicator Strip */}
      <div className="mx-5 bg-[#191c1b] border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              isEligible ? 'bg-[#1b5e4b]/40 text-[#44e2cd]' : 'bg-[#93000a]/30 text-[#ffb4ab]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isEligible ? 'check' : 'warning'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              {isEligible ? 'Saldo koin aktif' : 'Saldo koin tidak mencukupi'}
            </p>
            <p className="text-[11px] text-[#89938e]">
              {isEligible
                ? 'Siap matching perjalanan kampus Undip'
                : 'Diperlukan minimal 1 Koin untuk memulai tebengan'}
            </p>
          </div>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            isEligible
              ? 'bg-[#1b5e4b] text-[#94d5bd]'
              : 'bg-[#93000a] text-[#ffdad6]'
          }`}
        >
          {isEligible ? 'Aktif' : 'Top Up'}
        </span>
      </div>

      {/* Primary Action Cards: Driver vs Passenger Mode */}
      <section className="mx-5 space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-base font-bold text-white font-rubik">Pilih Mode Perjalanan</h3>
          <span className="text-[11px] text-[#89938e]">Satu Arah &amp; Sepadan</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Driver Card */}
          <div
            onClick={handleDriverClick}
            className="group relative bg-[#191c1b] hover:bg-[#1e2022] border border-white/10 hover:border-[#44e2cd]/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer active:scale-[0.99] shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#142621] text-[#44e2cd] flex items-center justify-center shrink-0 border border-[#44e2cd]/20">
                  <span className="material-symbols-outlined text-2xl">two_wheeler</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#44e2cd] transition-colors">
                    Saya ingin menjadi Driver
                  </h4>
                  <p className="text-xs text-[#89938e] leading-snug">
                    Buka tebengan &amp; cari mahasiswa searah rute harianmu
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#89938e] group-hover:text-[#44e2cd] transition-colors">
                chevron_right
              </span>
            </div>
          </div>

          {/* Passenger Card */}
          <div
            onClick={handlePassengerClick}
            className="group relative bg-[#191c1b] hover:bg-[#1e2022] border border-white/10 hover:border-[#93d4bb]/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer active:scale-[0.99] shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#17222c] text-[#93d4bb] flex items-center justify-center shrink-0 border border-[#93d4bb]/20">
                  <span className="material-symbols-outlined text-2xl">directions_walk</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-[#93d4bb] transition-colors">
                    Saya ingin menjadi Passenger
                  </h4>
                  <p className="text-xs text-[#89938e] leading-snug">
                    Cari tebengan hemat, aman, dan tepat waktu ke fakultas
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#89938e] group-hover:text-[#93d4bb] transition-colors">
                chevron_right
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Hotspots / Quick Nodes */}
      <section className="mx-5 space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold text-[#89938e] uppercase tracking-wider">
            Titik Kumpul Populer Undip
          </h3>
          <span className="text-[11px] text-[#44e2cd]">5 Lokasi</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll no-scrollbar">
          {[
            { name: 'Gerbang FSM Undip', dist: 'Tembalang' },
            { name: 'Rusunawa Undip', dist: 'Tembalang' },
            { name: 'Kampus Pleburan (Hayam Wuruk)', dist: 'Semarang Selatan' },
            { name: 'Gedung Prof. Soedarto', dist: 'Tembalang' },
            { name: 'Perpustakaan Pusat Undip', dist: 'Tembalang' },
          ].map((loc, i) => (
            <div
              key={i}
              className="bg-[#191c1b] border border-white/10 hover:border-white/20 p-2.5 rounded-xl shrink-0 text-left min-w-[140px]"
            >
              <div className="flex items-center gap-1.5 text-[#44e2cd] mb-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="text-[10px] text-gray-400">{loc.dist}</span>
              </div>
              <p className="text-xs font-semibold text-white truncate">{loc.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
