import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

export const DriverPublishView: React.FC = () => {
  const { currentUser, vehicles, setCurrentView, showToast, refreshAllData } = useApp();

  const [origin, setOrigin] = useState('Tembalang (Dekat Gerbang FSM)');
  const [destination, setDestination] = useState('Kampus Pleburan (Jl. Hayam Wuruk / Simpang Lima)');
  const [departureTime, setDepartureTime] = useState('08:35 WIB');
  const [timeFlexibility, setTimeFlexibility] = useState('Fleksibel ±5 mnt');
  const [fare, setFare] = useState(8000);
  const [note, setNote] = useState('Helm cadangan bersih tersedia, jemput depan FSM');
  const defaultVehicle = vehicles.find((v) => v.isDefault) || vehicles[0];
  const [selectedVehicleId, setSelectedVehicleId] = useState(defaultVehicle?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
    if (currentUser.coins < 1) {
      showToast('Saldo Koin tidak mencukupi. Top up minimal 1 Koin untuk membuka tebengan.', 'error');
      setCurrentView('topup');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createRideOffer({
        driverId: currentUser.id,
        origin,
        destination,
        departureTime,
        timeFlexibility,
        fare,
        note,
        vehicleId: selectedVehicleId || defaultVehicle?.id,
      });

      showToast('Tawaran tebengan berhasil dipublikasikan! Menunggu penumpang...', 'success');
      await refreshAllData();
      setCurrentView('driver_candidates');
    } catch (err: any) {
      showToast(err.message || 'Gagal mempublikasikan tebengan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 space-y-5 pb-28">
      <div>
        <h2 className="text-xl font-bold text-white font-rubik tracking-tight">
          Buka Tawaran Tebengan
        </h2>
        <p className="text-xs text-[#89938e] mt-0.5">
          Tentukan rute harian kampusmu untuk dicocokkan dengan mahasiswa searah.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Route Card */}
        <div className="bg-[#191c1b] border border-white/10 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-xs font-semibold text-[#44e2cd]">
            <span className="material-symbols-outlined text-base">route</span>
            <span>Rute &amp; Penjemputan</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#89938e] block mb-1">
              Titik Keberangkatan / Jemput
            </label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="cth. Tembalang (Dekat Gerbang FSM)"
              className="w-full bg-[#121416] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#44e2cd]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#89938e] block mb-1">
              Tujuan Akhir
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="cth. Kampus Pleburan (Jl. Hayam Wuruk)"
              className="w-full bg-[#121416] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#44e2cd]"
            />
          </div>
        </div>

        {/* Time and Fare Card */}
        <div className="bg-[#191c1b] border border-white/10 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-xs font-semibold text-[#44e2cd]">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>Waktu &amp; Ongkos Bersama</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-[#89938e] block mb-1">
                Jam Berangkat
              </label>
              <input
                type="text"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="cth. 08:35 WIB"
                className="w-full bg-[#121416] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#44e2cd]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#89938e] block mb-1">
                Fleksibilitas
              </label>
              <select
                value={timeFlexibility}
                onChange={(e) => setTimeFlexibility(e.target.value)}
                className="w-full bg-[#121416] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#44e2cd]"
              >
                <option value="Tepat Waktu">Tepat Waktu</option>
                <option value="Fleksibel ±5 mnt">Fleksibel ±5 mnt</option>
                <option value="Fleksibel ±15 mnt">Fleksibel ±15 mnt</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#89938e]">
                Estimasi Ongkos Bersama (Bensin)
              </label>
              <span className="text-xs font-bold text-[#44e2cd]">
                Rp {fare.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[6000, 8000, 10000].map((nominal) => (
                <button
                  key={nominal}
                  type="button"
                  onClick={() => setFare(nominal)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    fare === nominal
                      ? 'bg-[#1b5e4b] border-[#44e2cd] text-white shadow-sm'
                      : 'bg-[#121416] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  Rp {nominal.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Selection Card */}
        <div className="bg-[#191c1b] border border-white/10 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#44e2cd]">
              <span className="material-symbols-outlined text-base">two_wheeler</span>
              <span>Pilih Kendaraan Tebengan</span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('profile')}
              className="text-[11px] text-[#94d5bd] hover:underline"
            >
              Kelola Kendaraan
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-3 bg-[#121416] rounded-xl text-center text-xs text-gray-400">
              Belum ada data kendaraan.{' '}
              <button
                type="button"
                onClick={() => setCurrentView('profile')}
                className="text-[#44e2cd] underline ml-1"
              >
                Tambah di Profil
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => {
                const isSelected = selectedVehicleId === v.id || (!selectedVehicleId && v.isDefault);
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#1b5e4b]/40 border-[#44e2cd] text-white shadow-sm ring-1 ring-[#44e2cd]/30'
                        : 'bg-[#121416] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-lg text-[#44e2cd]">
                        {v.jenis === 'Mobil' ? 'directions_car' : 'two_wheeler'}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {v.merk} {v.model} ({v.warna})
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">{v.plat}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#44e2cd] text-lg">
                        check_circle
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="text-[11px] font-semibold text-[#89938e] block mb-1">
            Catatan untuk Calon Penumpang (Opsional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="cth. Helm penumpang bersih tersedia"
            className="w-full bg-[#191c1b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#44e2cd]"
          />
        </div>

        {/* Coin Rule Transparency Notice */}
        <div className="p-3 bg-[#1b5e4b]/20 border border-[#1b5e4b]/40 rounded-xl flex items-start gap-2 text-[11px] text-[#94d5bd]">
          <span className="material-symbols-outlined text-base shrink-0 mt-0.5">info</span>
          <p>
            Membuka tebengan <strong>tidak memotong koin</strong> sekarang. 1 Koin AJUN hanya akan didebit secara otomatis saat Anda dan penumpang resmi mengonfirmasi kecocokan perjalanan.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-[#44e2cd] hover:bg-[#3cddc7] text-[#003731] font-bold text-xs tracking-wide shadow-lg shadow-[#44e2cd]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">
                  progress_activity
                </span>
                <span>Mempublikasikan...</span>
              </>
            ) : (
              <>
                <span>Publikasikan Tebengan</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
