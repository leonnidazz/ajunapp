import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { coinsToRupiah, formatRupiah } from '../services/coinService';
import * as api from '../services/api';

export const TopUpView: React.FC = () => {
  const { currentUser, showToast, refreshAllData, setCurrentView } = useApp();

  const [coinAmount, setCoinAmount] = useState<number>(35);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentUser) return null;

  const currentCoins = currentUser.coins;
  const currentRupiah = coinsToRupiah(currentCoins);

  const totalPayment = coinsToRupiah(coinAmount);

  const handleIncrement = (delta: number) => {
    setCoinAmount((prev) => Math.max(1, Math.min(500, prev + delta)));
  };

  const handleSelectPreset = (amount: number) => {
    setCoinAmount(amount);
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    try {
      await api.topUpCoins(currentUser.id, coinAmount);
      showToast(
        `Top Up simulasi berhasil! +${coinAmount} Koin ditambahkan ke saldo Anda.`,
        'success'
      );
      setIsQrModalOpen(false);
      await refreshAllData();
      setCurrentView('home');
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses top up koin', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="px-5 space-y-4 pb-36">
      {/* 1. Saldo Koin Saat Ini Card (Exact match of Image 16) */}
      <section className="hero-emerald-card rounded-2xl p-5 text-white shadow-xl space-y-1">
        <p className="text-xs text-[#94d5bd]/90">Saldo Koin Saat Ini · Mode Demo</p>
        <h2 className="text-3xl font-bold font-rubik tracking-tight">
          {currentCoins} Koin
        </h2>
        <p className="text-xs text-[#94d5bd]">Senilai {formatRupiah(currentRupiah)}</p>
        <div className="pt-2 border-t border-white/10 text-[10px] text-[#94d5bd]/80">
          SIMULASI: 1 AJUN Koin = Rp500. Tidak ada pembayaran QRIS sungguhan dan saldo demo bukan uang nyata.
        </div>
      </section>

      {/* 2. Tentukan Nominal Koin (Exact match of Image 16) */}
      <section className="bg-[#191c1b] rounded-2xl p-4 border border-white/10 space-y-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-[#1e2022] text-[#44e2cd]">
            <span className="material-symbols-outlined text-base">tune</span>
          </span>
          <div>
            <h3 className="text-xs font-bold text-white font-rubik">
              Tentukan Nominal Koin
            </h3>
            <p className="text-[11px] text-amber-300">Top up simulasi untuk pengujian saja — bukan transaksi sungguhan.</p>
          </div>
        </div>

        {/* Stepper Input Container */}
        <div className="p-3 bg-[#121416] rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleIncrement(-5)}
              className="w-10 h-10 rounded-full bg-[#1e2022] hover:bg-[#282a2c] text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
            >
              -
            </button>

            <div className="flex items-baseline gap-1.5 border-b-2 border-[#44e2cd] pb-1 px-4">
              <input
                type="number"
                min={1}
                max={500}
                value={coinAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setCoinAmount(Math.max(1, Math.min(500, val)));
                }}
                className="w-16 bg-transparent text-center text-2xl font-bold font-rubik text-white focus:outline-none"
              />
              <span className="text-xs text-gray-400">Koin</span>
            </div>

            <button
              type="button"
              onClick={() => handleIncrement(5)}
              className="w-10 h-10 rounded-full bg-[#1e2022] hover:bg-[#282a2c] text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
            >
              +
            </button>
          </div>

          <div className="text-center text-xs font-bold text-[#44e2cd] pt-1">
            {formatRupiah(totalPayment)}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Paket Populer</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 20, 35, 50].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectPreset(num)}
                className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  coinAmount === num
                    ? 'bg-[#1b5e4b] border-[#44e2cd] text-white'
                    : 'bg-[#121416] border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                {num} Koin
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Ringkasan Pembayaran (Exact match of Image 16) */}
      <section className="bg-[#191c1b] rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs shadow-md">
        <h3 className="text-xs font-bold text-white font-rubik">Ringkasan Pembayaran</h3>

        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-gray-400">
            <span>Paket Dipilih</span>
            <span className="text-white font-medium">{coinAmount} Koin (Kustom)</span>
          </div>

          <div className="flex justify-between text-gray-400">
            <span>Biaya Layanan Admin</span>
            <span className="text-[#44e2cd] font-semibold">Rp0 (Gratis)</span>
          </div>

          <div className="h-px bg-white/10 my-1"></div>

          <div className="flex justify-between items-center pt-0.5">
            <span className="font-semibold text-white">Total Pembayaran</span>
            <span className="text-sm font-bold text-[#44e2cd]">
              {formatRupiah(totalPayment)}
            </span>
          </div>
        </div>
      </section>

      {/* Simulation Notice Disclaimer */}
      <div className="p-3 bg-[#1b5e4b]/15 border border-[#1b5e4b]/30 rounded-2xl flex items-start gap-2 text-[11px] text-[#94d5bd]">
        <span className="material-symbols-outlined text-base shrink-0 mt-0.5">info</span>
        <p>
          <strong>Simulasi Prototipe:</strong> Pembayaran ini menggunakan simulasi sandbox QRIS internal. Tidak ada saldo uang riil yang dipotong. Koin akan ditambahkan secara aman melalui backend.
        </p>
      </div>

      {/* Fixed Bottom CTA Bar (Exact match of Image 16) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0c0e10]/95 backdrop-blur-md p-4 border-t border-white/10 z-40 space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-gray-400 text-[11px]">Total yang harus dibayar:</span>
          <span className="text-sm font-bold text-[#44e2cd] font-rubik">
            {formatRupiah(totalPayment)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-[#0c0e10] font-bold text-xs tracking-wide shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
          <span>Bayar dengan QRIS</span>
        </button>
      </div>

      {/* SIMULATED QRIS MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#191c1b] border border-white/10 rounded-3xl p-5 text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-[#44e2cd] uppercase tracking-wider">
                Simulasi QRIS AJUN
              </span>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white font-rubik">
                Scan QRIS untuk {coinAmount} Koin
              </h4>
              <p className="text-xs font-bold text-[#44e2cd] mt-0.5">
                {formatRupiah(totalPayment)}
              </p>
            </div>

            {/* Simulated QR Code Canvas Graphic */}
            <div className="p-4 bg-white rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-lg relative">
              <div className="w-full h-full border-4 border-[#0c0e10] p-2 flex flex-col items-center justify-between">
                <div className="w-full flex justify-between">
                  <div className="w-8 h-8 bg-black"></div>
                  <div className="w-8 h-8 bg-black"></div>
                </div>
                <div className="text-[10px] font-mono font-bold text-black tracking-widest text-center">
                  AJUN UNDIP QRIS
                  <br />
                  <span className="text-[9px] text-gray-600">ID: {currentUser.id}</span>
                </div>
                <div className="w-full flex justify-between">
                  <div className="w-8 h-8 bg-black"></div>
                  <div className="w-8 h-8 bg-[#44e2cd] border border-black"></div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-tight">
              Lingkungan prototipe ini memverifikasi pembayaran secara otomatis melalui backend server.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecutePayment}
                className="w-full py-3 rounded-full bg-[#44e2cd] hover:bg-[#3cddc7] text-[#003731] font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                {isProcessing ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>Konfirmasi Pembayaran Simulasi</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2 text-xs text-gray-400 hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
