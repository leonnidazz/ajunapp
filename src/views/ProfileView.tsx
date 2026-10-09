import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle } from '../types';
import * as api from '../services/api';

export const ProfileView: React.FC = () => {
  const { currentUser, users, switchDemoUser, vehicles, setCurrentView, showToast, refreshAllData } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Form states
  const [merk, setMerk] = useState('');
  const [model, setModel] = useState('');
  const [jenis, setJenis] = useState<'Motor' | 'Mobil'>('Motor');
  const [warna, setWarna] = useState('');
  const [plat, setPlat] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setMerk('');
    setModel('');
    setJenis('Motor');
    setWarna('');
    setPlat('');
    setIsDefault(vehicles.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setMerk(veh.merk);
    setModel(veh.model);
    setJenis(veh.jenis);
    setWarna(veh.warna);
    setPlat(veh.plat);
    setIsDefault(veh.isDefault);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merk || !model || !plat) {
      showToast('Merk, model, dan nomor plat wajib diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, {
          merk,
          model,
          jenis,
          warna,
          plat: plat.toUpperCase(),
          isDefault: editingVehicle.isDefault,
        });
        showToast('Data kendaraan berhasil diperbarui', 'success');
      } else {
        await api.addVehicle(currentUser.id, {
          merk,
          model,
          jenis,
          warna,
          plat: plat.toUpperCase(),
          isDefault,
        });
        showToast('Kendaraan baru berhasil ditambahkan', 'success');
      }
      setIsModalOpen(false);
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan kendaraan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (vehId: string) => {
    try {
      await api.setDefaultVehicle(vehId);
      showToast('Kendaraan utama berhasil diubah', 'success');
      await refreshAllData();
    } catch {
      showToast('Gagal mengubah kendaraan utama', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await api.deleteVehicle(vehicleToDelete.id);
      showToast('Kendaraan berhasil dihapus', 'success');
      setVehicleToDelete(null);
      await refreshAllData();
    } catch {
      showToast('Gagal menghapus kendaraan', 'error');
    }
  };

  return (
    <div className="px-5 space-y-5 pb-28">
      {/* Profile Hero Banner Card (Exact replica of Image 14) */}
      <section className="hero-emerald-card rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Avatar Cluster */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-3xl p-1 bg-gradient-to-b from-[#44e2cd] to-[#1b5e4b] shadow-xl">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <button
              onClick={() => showToast('Foto profil demo belum dapat diubah pada prototipe ini.', 'info')}
              aria-label="Ganti Foto Profil"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0c0e10] text-[#44e2cd] flex items-center justify-center border border-[#44e2cd]/30 shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
          </div>

          {/* Student Name */}
          <h2 className="text-base font-bold text-white font-rubik tracking-tight">
            {currentUser.name}
          </h2>
          <p className="text-xs text-[#94d5bd]/90 font-medium mt-0.5">{currentUser.email}</p>
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-black/30 border border-white/10 text-[10px] text-[#44e2cd]">
            {currentUser.faculty} {currentUser.batch}
          </div>

          {/* Coins Strip Inside Hero */}
          <div className="w-full mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between px-1">
            <div className="text-left">
              <p className="text-[10px] text-[#94d5bd]/80 uppercase tracking-wide">
                Saldo Koin AJUN Aktif
              </p>
              <span className="text-lg font-bold text-white font-rubik">
                {currentUser.coins} Koin
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('topup')}
              className="px-4 py-1.5 rounded-full bg-white text-[#0c0e10] font-bold text-xs shadow-md active:scale-95 transition-all hover:bg-neutral-100"
            >
              Top Up
            </button>
          </div>
        </div>
      </section>

      {/* Account Information Bento Group */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-bold text-white font-rubik px-1">Informasi Akun</h3>
        <div className="bg-[#191c1b] rounded-3xl p-4 border border-white/10 space-y-3 shadow-sm text-xs">
          {/* Username */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1e2022] flex items-center justify-center text-[#44e2cd]">
                <span className="material-symbols-outlined text-base">alternate_email</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Username Akun</p>
                <p className="font-semibold text-white">
                  {currentUser.email.split('@')[0]}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(currentUser.email.split('@')[0]);
                showToast('Username disalin ke papan klip', 'success');
              }}
              className="text-gray-400 hover:text-[#44e2cd]"
              title="Salin"
            >
              <span className="material-symbols-outlined text-base">content_copy</span>
            </button>
          </div>

          <div className="h-px bg-white/5"></div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1e2022] flex items-center justify-center text-[#44e2cd]">
              <span className="material-symbols-outlined text-base">mail</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Email Terdaftar</p>
              <p className="font-semibold text-white">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Keamanan Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white font-rubik">Keamanan &amp; Akses</h3>
          <span className="text-[10px] text-gray-400">Privasi Pengguna</span>
        </div>
        <div className="bg-[#191c1b] rounded-3xl p-2 border border-white/10 space-y-1 text-xs">
          <div
            onClick={() => showToast('Ganti PIN belum tersedia. Prototipe ini belum menggunakan autentikasi atau PIN sungguhan.', 'info')}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#1e2022]/60 hover:bg-[#1e2022] cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1b5e4b]/40 flex items-center justify-center text-[#44e2cd]">
                <span className="material-symbols-outlined text-base">lock</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Ganti PIN</h4>
                <p className="text-[11px] text-gray-400">Belum aktif di prototipe — autentikasi belum terintegrasi</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1e2022] flex items-center justify-center text-[#93d4bb]">
                <span className="material-symbols-outlined text-sm">shield</span>
              </div>
              <p className="text-gray-300">Keamanan akun belum diaktifkan (mode demo)</p>
            </div>
            <span className="text-[11px] font-bold text-amber-300">Demo</span>
          </div>
        </div>
      </section>

      {/* Data Kendaraan Section (CRUD Actions - Faithful to Image 14) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-white font-rubik">Data Kendaraan</h3>
            <p className="text-[11px] text-[#89938e]">
              Simpan kendaraan saat menjadi Driver tebengan
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-full bg-[#44e2cd]/15 hover:bg-[#44e2cd]/25 text-[#44e2cd] border border-[#44e2cd]/30 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Tambah</span>
          </button>
        </div>

        {/* Vehicle List */}
        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <div className="p-4 bg-[#191c1b] rounded-2xl border border-white/10 text-center text-xs text-gray-400">
              Belum ada kendaraan yang ditambahkan.
            </div>
          ) : (
            vehicles.map((v) => {
              return (
                <div
                  key={v.id}
                  className={`bg-[#191c1b] rounded-3xl p-4 border transition-all ${
                    v.isDefault ? 'border-[#44e2cd]/40 shadow-md' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${
                          v.isDefault
                            ? 'bg-[#1b5e4b]/40 text-[#44e2cd]'
                            : 'bg-[#1e2022] text-[#93d4bb]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {v.jenis === 'Mobil' ? 'directions_car' : 'two_wheeler'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">
                            {v.merk} {v.model}
                          </h4>
                          {v.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-[#44e2cd]/20 border border-[#44e2cd]/30 text-[#44e2cd] text-[10px] font-bold">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {v.jenis} • {v.warna}
                        </p>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-xl bg-[#1e2022] text-[11px] font-mono font-bold text-white border border-white/10">
                      {v.plat}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    {v.isDefault ? (
                      <span className="text-[11px] text-[#44e2cd] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Kendaraan Aktif Driver
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(v.id)}
                        className="text-[11px] text-[#93d4bb] hover:text-[#44e2cd] flex items-center gap-1 font-medium active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">
                          radio_button_unchecked
                        </span>
                        Jadikan Default
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(v)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVehicleToDelete(v)}
                        className="p-1 rounded-lg text-gray-400 hover:text-[#ffb4ab] transition-colors"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Account Switching & Logout Actions */}
      <div className="pt-2 space-y-2.5">
        <button
          type="button"
          onClick={() => setIsAccountModalOpen(true)}
          className="w-full py-3.5 rounded-full bg-[#1b5e4b]/20 hover:bg-[#1b5e4b]/30 text-[#44e2cd] text-xs font-bold border border-[#44e2cd]/30 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-base">switch_account</span>
          <span>Beralih Profil Pengguna (Driver / Penumpang)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            showToast('Ini hanya profil demo, bukan sesi SSO. Gunakan Beralih Profil untuk mengganti akun simulasi.', 'info');
          }}
          className="w-full py-3 rounded-full bg-[#1e2022] hover:bg-[#93000a]/20 text-[#ffb4ab] text-xs font-bold border border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Info Sesi Demo</span>
        </button>
      </div>

      {/* ACCOUNT SWITCHER MODAL */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#191c1b] rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-1 sm:hidden"></div>
            
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1b5e4b]/40 text-[#44e2cd] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">switch_account</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-rubik">Pilih Akun Mahasiswa</h3>
                  <p className="text-[11px] text-gray-400">Mode demo untuk pengujian dua akun di tab terpisah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1e2022] text-gray-400 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {users.map((u) => {
                const isSelected = currentUser.id === u.id;
                const isDriver = u.role === 'driver';

                return (
                  <div
                    key={u.id}
                    onClick={async () => {
                      // Always write the tab-scoped identity, even when the UI already shows this profile.
                      await switchDemoUser(u.id);
                      if (!isSelected) showToast(`Berhasil beralih ke akun demo ${u.name}`, 'success');
                      setIsAccountModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1b5e4b]/30 border-[#44e2cd] ring-1 ring-[#44e2cd]/50 shadow-md'
                        : 'bg-[#1d201f] border-white/10 hover:border-white/25 hover:bg-[#232726]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-white/10"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] shadow-sm ${
                            isDriver ? 'bg-[#005047] text-[#62fae3]' : 'bg-[#17222c] text-[#93d4bb]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {isDriver ? 'two_wheeler' : 'directions_walk'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white">{u.name}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                              isDriver
                                ? 'bg-[#1b5e4b] text-[#62fae3]'
                                : 'bg-[#17222c] text-[#93d4bb]'
                            }`}
                          >
                            {isDriver ? 'Driver' : 'Penumpang'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{u.email}</p>
                        <p className="text-[10px] text-[#94d5bd]">{u.faculty} • Saldo: {u.coins} Koin</p>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-[#44e2cd] text-[#003731] flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-base font-bold">check</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 hover:text-white font-medium">Pilih</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-400 text-center pt-1 leading-relaxed">
              Tip: Anda dapat membuka dua jendela browser atau tab terpisah. Tab satu sebagai Driver dan tab lainnya sebagai Penumpang untuk melihat interaksi langsung real-time.
            </p>
          </div>
        </div>
      )}

      {/* TAMBAH / EDIT KENDARAAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-0">
          <div className="w-full max-w-md bg-[#191c1b] rounded-t-3xl border-t border-white/10 p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-1"></div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white font-rubik">
                  {editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  Lengkapi spesifikasi motor atau mobil tebengan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1e2022] text-gray-400 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
              {/* Jenis Kendaraan */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  Jenis Kendaraan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenis('Motor')}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      jenis === 'Motor'
                        ? 'bg-[#1b5e4b] border-[#44e2cd] text-white shadow-sm'
                        : 'bg-[#1e2022] border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">two_wheeler</span>
                    <span>Motor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenis('Mobil')}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      jenis === 'Mobil'
                        ? 'bg-[#1b5e4b] border-[#44e2cd] text-white shadow-sm'
                        : 'bg-[#1e2022] border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">directions_car</span>
                    <span>Mobil</span>
                  </button>
                </div>
              </div>

              {/* Merk & Model */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Merk
                  </label>
                  <input
                    type="text"
                    required
                    value={merk}
                    onChange={(e) => setMerk(e.target.value)}
                    placeholder="cth. Honda"
                    className="w-full bg-[#121416] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Model / Seri
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="cth. Vario 150"
                    className="w-full bg-[#121416] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Plat & Warna */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Nomor Plat
                  </label>
                  <input
                    type="text"
                    required
                    value={plat}
                    onChange={(e) => setPlat(e.target.value.toUpperCase())}
                    placeholder="cth. H 4281 AW"
                    className="w-full bg-[#121416] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Warna
                  </label>
                  <input
                    type="text"
                    required
                    value={warna}
                    onChange={(e) => setWarna(e.target.value)}
                    placeholder="cth. Hitam Matte"
                    className="w-full bg-[#121416] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#1e2022] text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-[#44e2cd] text-[#003731] font-bold text-xs shadow-md active:scale-95"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kendaraan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#191c1b] border border-white/10 rounded-3xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#93000a]/30 text-[#ffb4ab] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-rubik">Hapus Kendaraan?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Hapus {vehicleToDelete.merk} {vehicleToDelete.model} ({vehicleToDelete.plat}) dari daftar kendaraan tebengan Anda?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="flex-1 py-2.5 rounded-full bg-[#1e2022] text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-full bg-[#93000a] text-white text-xs font-bold shadow-md"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
