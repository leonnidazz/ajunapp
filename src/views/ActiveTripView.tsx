import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage, Trip } from '../types';
import * as api from '../services/api';

export const ActiveTripView: React.FC = () => {
  const { currentUser, activeTrip, setCurrentView, showToast, refreshAllData } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ada urusan mendadak');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [completedTripSummary, setCompletedTripSummary] = useState<Trip | null>(null);
  const [gpsStatus, setGpsStatus] = useState('Lokasi simulasi — GPS langsung belum terhubung');

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const tripId = activeTrip?.id;

  // Load chat messages
  const loadChat = async () => {
    if (!tripId) return;
    try {
      const chatList = await api.fetchChat(tripId);
      setMessages(chatList);
    } catch (err) {
      console.error('Error fetching chat:', err);
    }
  };

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 2500);
    return () => clearInterval(interval);
  }, [tripId]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!currentUser) return null;

  // T1 Fix: If trip completed, render the success overlay even if activeTrip in context has become null
  if (showSuccessOverlay && completedTripSummary) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0e10]/95 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in">
        <div className="w-full max-w-sm bg-[#191c1b] border border-[#44e2cd]/30 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#1b5e4b] text-[#44e2cd] flex items-center justify-center ring-8 ring-[#44e2cd]/10">
            <span className="material-symbols-outlined text-4xl">task_alt</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#44e2cd] uppercase tracking-wider">
              Perjalanan Berhasil
            </span>
            <h3 className="text-lg font-bold text-white font-rubik mt-1">
              Perjalanan Berhasil Diselesaikan! 🎉
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              Terima kasih telah berbagi tebengan ramah lingkungan di lingkungan Universitas Diponegoro.
            </p>
          </div>

          <div className="w-full bg-[#121416] p-3.5 rounded-2xl border border-white/5 text-left text-xs space-y-1.5">
            <div className="flex justify-between text-gray-400">
              <span>Rute:</span>
              <span className="text-white font-medium truncate max-w-[180px]">
                {completedTripSummary.origin} ➔ {completedTripSummary.destination}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Status:</span>
              <span className="text-[#44e2cd] font-semibold">Dipindahkan ke Riwayat</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Biaya matching:</span>
              <span className="text-white font-semibold">1 AJUN Koin</span>
            </div>
          </div>

          <button
            onClick={() => {
              setShowSuccessOverlay(false);
              setCompletedTripSummary(null);
              setCurrentView('orders');
            }}
            className="w-full py-3.5 px-6 rounded-full bg-white text-[#0c0e10] font-bold text-xs hover:bg-neutral-100 active:scale-95 transition-all shadow-lg"
          >
            Lihat di Pesanan Saya
          </button>
        </div>
      </div>
    );
  }

  // If no active trip is ongoing
  if (!activeTrip) {
    return (
      <div className="px-5 py-12 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#1e2022] flex items-center justify-center text-[#89938e] mx-auto">
          <span className="material-symbols-outlined text-3xl">electric_moped</span>
        </div>
        <h3 className="text-base font-bold text-white font-rubik">Tidak ada perjalanan aktif</h3>
        <p className="text-xs text-[#89938e] max-w-xs mx-auto">
          Mulai tebengan dengan membuka tawaran sebagai Driver atau mencari tebengan sebagai Passenger.
        </p>
        <button
          onClick={() => setCurrentView('home')}
          className="px-6 py-2.5 rounded-full bg-[#44e2cd] text-[#003731] text-xs font-bold shadow-md"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const isDriver = currentUser.id === activeTrip.driverId;
  const peerName = isDriver ? activeTrip.passengerName : activeTrip.driverName;
  const peerAvatar = isDriver ? activeTrip.passengerAvatar : activeTrip.driverAvatar;
  const peerRole = isDriver ? 'Passenger' : 'Driver';

  const handleStartTrip = async () => {
    setIsSubmittingAction(true);
    try {
      await api.executeTripAction(activeTrip.id, currentUser.id, 'start');
      showToast('Perjalanan resmi dimulai! Selamat berkendara.', 'success');
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal memulai perjalanan', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isSending || !tripId) return;

    setIsSending(true);
    try {
      const newMsg = await api.sendChatMessage(tripId, currentUser.id, text);
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } catch {
      showToast('Gagal mengirim pesan', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleEndTrip = async () => {
    setIsSubmittingAction(true);
    try {
      const res = await api.executeTripAction(activeTrip.id, currentUser.id, 'complete');
      setIsConfirmModalOpen(false);
      setCompletedTripSummary(res.trip || activeTrip);
      setShowSuccessOverlay(true);
      await refreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyelesaikan trip', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCancelTrip = async () => {
    setIsSubmittingAction(true);
    try {
      await api.executeTripAction(activeTrip.id, currentUser.id, 'cancel', cancelReason);
      setIsCancelModalOpen(false);
      showToast('Perjalanan dibatalkan. Koin penalti 1 koin diterapkan pada pembatal.', 'info');
      await refreshAllData();
      setCurrentView('orders');
    } catch (err: any) {
      showToast(err.message || 'Gagal membatalkan trip', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const triggerGpsRefresh = () => {
    setGpsStatus('Lokasi ini hanya simulasi; GPS langsung belum diintegrasikan.');
  };

  return (
    <div className="relative flex flex-col pb-24">
      {/* 1. TOP HEADER & PEER CARD (Faithful to Image 10) */}
      <div className="px-5 pt-1 pb-3 space-y-3">
        <div className="p-3.5 rounded-2xl bg-[#191c1b] border border-white/10 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={peerAvatar}
                alt={peerName}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#44e2cd]/50 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#44e2cd] text-[#003731] rounded-full p-0.5 flex items-center justify-center shadow">
                <span className="material-symbols-outlined text-[12px] font-bold">verified</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{peerName}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#1b5e4b] text-[#94d5bd]">
                  {peerRole}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#89938e]">
                <span className="flex items-center text-amber-300 font-semibold text-[11px]">
                  ★ {activeTrip.driverRating}
                </span>
                <span>•</span>
                <span className="text-gray-300 truncate max-w-[150px]">
                  {activeTrip.driverVehicle}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">Ongkos Bersama</span>
            <span className="text-xs font-bold text-[#44e2cd]">
              Rp {activeTrip.fare.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* 1b. START TRIP ACTION (CONFIRMED -> ONGOING) */}
        {activeTrip.status === 'CONFIRMED' && isDriver && (
          <div className="p-3 bg-[#1b5e4b]/40 border border-[#44e2cd]/40 rounded-2xl flex items-center justify-between shadow-md animate-in fade-in">
            <div>
              <span className="text-xs font-bold text-white block">Tebengan Terkonfirmasi</span>
              <span className="text-[11px] text-[#94d5bd]">Klik saat kedua pihak siap berangkat</span>
            </div>
            <button
              disabled={isSubmittingAction}
              onClick={handleStartTrip}
              className="px-4 py-2 rounded-full bg-[#44e2cd] hover:bg-[#62fae3] text-[#003731] text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              <span>Mulai Perjalanan</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. NOCTURNAL DARK CAMPUS MAP (Exact replica of Image 10) */}
      <div
        className={`relative w-full transition-all duration-300 bg-[#0c0e10] overflow-hidden border-y border-white/10 ${
          isMapExpanded ? 'h-[440px]' : 'h-[310px]'
        }`}
      >
        {/* Background Dark Map Grid / Nocturnal Campus Aesthetic */}
        <div className="absolute inset-0 bg-[#0d1614] bg-[radial-gradient(#1b5e4b_1px,transparent_1px)] [background-size:16px_16px] opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0e10]/80 via-transparent to-[#0c0e10]/90"></div>

        {/* Route Vectors & Street Curves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="routeGrad" x1="0%" x2="100%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="#44e2cd" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#93d4bb" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Main street lines */}
          <path d="M 0 150 Q 150 140 390 120" stroke="#1d2b27" strokeWidth="18" fill="none" />
          <path d="M 80 300 Q 140 180 320 85" stroke="#1d2b27" strokeWidth="14" fill="none" />
          {/* Active GPS Route */}
          <path
            d="M 80 230 Q 140 170 200 150 T 320 85"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="5"
            strokeDasharray="2 8"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>

        {/* Driver Marker with radar pulse */}
        <div className="absolute left-[80px] top-[220px] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 rounded-full bg-[#44e2cd]/30 driver-pulse"></span>
            <div className="w-9 h-9 rounded-full bg-[#0c0e10] ring-2 ring-[#44e2cd] flex items-center justify-center text-[#44e2cd] z-10 shadow-lg shadow-[#44e2cd]/40">
              <span className="material-symbols-outlined text-[19px]">two_wheeler</span>
            </div>
          </div>
          <span className="mt-1 px-1.5 py-0.5 rounded-full bg-[#0c0e10]/95 border border-[#44e2cd]/40 text-[9px] font-bold text-[#44e2cd] whitespace-nowrap">
            {activeTrip.driverName.split(' ')[0]} (Driver)
          </span>
        </div>

        {/* Pickup Location Marker */}
        <div className="absolute left-[310px] top-[85px] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-[#03c6b2] text-[#004d44] flex items-center justify-center ring-4 ring-[#44e2cd]/20 shadow-lg">
            <span className="material-symbols-outlined text-[18px]">person_pin_circle</span>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded-md bg-[#191c1b]/95 border border-white/10 text-[9px] font-medium text-white whitespace-nowrap shadow-md">
            Titik Jemput: FSM Undip
          </div>
        </div>

        {/* Floating Top Info Bar Over Map */}
        <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between bg-[#0c0e10]/90 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1b5e4b]/50 flex items-center justify-center text-[#44e2cd]">
              <span className="material-symbols-outlined text-lg">schedule</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                Tiba dlm ~{activeTrip.etaMinutes} Menit
              </div>
              <div className="text-[10px] text-[#89938e] flex items-center gap-1.5">
                <span>Jarak: {activeTrip.distanceMeters} m</span>
                <span>•</span>
                <span className="text-amber-300 flex items-center gap-0.5">Lokasi simulasi</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="p-1.5 rounded-xl bg-[#1e2022] hover:bg-[#282a2c] text-white active:scale-95 transition-all"
              title="Perbesar Peta"
            >
              <span className="material-symbols-outlined text-base">
                {isMapExpanded ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-[#1e2022] hover:bg-[#282a2c] text-[#44e2cd] active:scale-95 transition-all"
              title="Buka Maps Eksternal"
            >
              <span className="material-symbols-outlined text-base">map</span>
            </a>
          </div>
        </div>

        {/* Subtle GPS Alert Pill */}
        <div className="absolute bottom-2.5 left-4 right-4 z-30 flex items-center justify-between bg-[#191c1b]/85 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/5 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-amber-300">info</span>
            <span>{gpsStatus}</span>
          </span>
          <button
            onClick={triggerGpsRefresh}
            className="text-[#44e2cd] hover:underline flex items-center gap-0.5 font-medium"
          >
            <span className="material-symbols-outlined text-xs">sync</span> Refresh
          </button>
        </div>
      </div>

      {/* 3. ROUTE SUMMARY ACCORDION */}
      <div className="px-5 pt-3 space-y-3">
        <div className="p-3 bg-[#191c1b] rounded-2xl border border-white/10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#44e2cd]"></span>
              <div className="w-0.5 h-3 bg-white/20 my-0.5"></div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#93d4bb]"></span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white truncate">{activeTrip.origin}</span>
              <span className="text-[11px] text-gray-400 truncate">{activeTrip.destination}</span>
            </div>
          </div>
          <a
            href="tel:08123456789"
            className="w-9 h-9 rounded-full bg-[#1e2022] flex items-center justify-center text-[#44e2cd] hover:bg-[#282a2c] active:scale-95 shrink-0 transition-all ml-2"
            title="Panggil Kontak"
          >
            <span className="material-symbols-outlined text-lg">call</span>
          </a>
        </div>

        {/* 4. REAL-TIME CHAT DRAWER */}
        <section className="bg-[#191c1b] rounded-3xl border border-white/10 p-3.5 shadow-md flex flex-col space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#44e2cd] animate-pulse"></div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Pesan Langsung
              </h3>
            </div>
            <span className="text-[10px] text-gray-400">Tersinkronisasi Real-Time</span>
          </div>

          {/* Quick Reply Chips Rail */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scroll no-scrollbar">
            {[
              'Saya sudah di titik jemput',
              'Siap, OTW!',
              'Tunggu 2 menit ya',
              'Helm sudah siap kak',
            ].map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(reply)}
                className="px-2.5 py-1 rounded-full bg-[#121416] text-[11px] text-gray-300 hover:text-white hover:bg-[#1e2022] border border-white/10 whitespace-nowrap active:scale-95 transition-all shrink-0"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div
            ref={chatScrollRef}
            className="h-[140px] overflow-y-auto space-y-2 pr-1 custom-scroll"
          >
            {messages.length === 0 ? (
              <p className="text-center text-[11px] text-gray-500 pt-8">
                Belum ada pesan. Ketik pesan atau pilih balasan cepat di atas.
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.senderAvatar || peerAvatar}
                        alt={msg.senderName}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs shadow-sm ${
                        isMe
                          ? 'bg-[#1b5e4b] text-white rounded-br-sm'
                          : 'bg-[#121416] text-gray-200 border border-white/10 rounded-bl-sm'
                      }`}
                    >
                      <p className="leading-snug">{msg.text}</p>
                      <span className="block text-[9px] text-gray-400 text-right mt-0.5">
                        {msg.timeStr}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan ke rekan tebengan..."
              className="flex-1 bg-[#121416] border border-white/10 rounded-full px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#44e2cd]"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="w-9 h-9 rounded-full bg-[#44e2cd] text-[#003731] flex items-center justify-center hover:bg-[#62fae3] active:scale-95 disabled:opacity-50 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </form>
        </section>

        {/* 5. BOTTOM ACTIONS: AKHIRI TRIP & BATALKAN */}
        <div className="pt-2 space-y-2">
          {isDriver && activeTrip.status === 'ONGOING' && (
          <button
            type="button"
            onClick={() => setIsConfirmModalOpen(true)}
            className="w-full py-3.5 px-6 rounded-full bg-[#93000a]/20 border border-[#ffb4ab]/40 text-[#ffb4ab] hover:bg-[#93000a]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs font-bold tracking-wide shadow-lg"
          >
            <span className="material-symbols-outlined text-base">flag</span>
            <span>Selesaikan Perjalanan</span>
          </button>
          )}

          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="w-full py-2 text-[11px] text-gray-400 hover:text-[#ffb4ab] text-center"
          >
            Batalkan Tebengan (Penalti 1 Koin)
          </button>
        </div>
      </div>

      {/* CONFIRMATION END TRIP MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#191c1b] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1b5e4b]/40 text-[#44e2cd] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">sports_score</span>
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white font-rubik">Akhiri perjalanan?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Pastikan Anda dan rekan tebengan sudah tiba dengan selamat di lokasi tujuan.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#121416] border border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400">Status Penyelesaian</span>
              <span className="text-[#44e2cd] font-semibold">Tuntas (Tanpa Biaya Tambahan)</span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleEndTrip}
                className="w-full py-3 rounded-full bg-[#44e2cd] hover:bg-[#3cddc7] text-[#003731] font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                {isSubmittingAction ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span>Ya, Selesaikan Trip</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#1e2022] text-gray-300 text-xs font-semibold active:scale-95 transition-all"
              >
                Lanjutkan Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#191c1b] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#93000a]/40 text-[#ffb4ab] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white font-rubik">Batalkan Perjalanan?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Sesuai aturan AJUN, pembatalan sepihak setelah konfirmasi akan <strong>mengurangi 1 Koin penalti</strong> dari saldo Anda. Lawan transaksi akan menerima pengembalian penuh.
              </p>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Alasan Pembatalan</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#121416] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Ada urusan mendadak">Ada urusan mendadak</option>
                <option value="Kendaraan mengalami kendala">Kendaraan mengalami kendala</option>
                <option value="Titik jemput terlalu jauh">Titik jemput terlalu jauh</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleCancelTrip}
                className="w-full py-3 rounded-full bg-[#93000a] text-white font-bold text-xs active:scale-95 transition-all"
              >
                {isSubmittingAction ? 'Membatalkan...' : 'Tetap Batalkan (Penalti 1 Koin)'}
              </button>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#1e2022] text-gray-300 text-xs font-semibold"
              >
                Kembali ke Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CELEBRATION OVERLAY (Faithful to Image 10) */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 bg-[#0c0e10]/95 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#191c1b] border border-[#44e2cd]/30 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1b5e4b] text-[#44e2cd] flex items-center justify-center ring-8 ring-[#44e2cd]/10">
              <span className="material-symbols-outlined text-4xl">task_alt</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#44e2cd] uppercase tracking-wider">
                Perjalanan Berhasil
              </span>
              <h3 className="text-lg font-bold text-white font-rubik mt-1">
                Perjalanan Berhasil Diselesaikan! 🎉
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Terima kasih telah berbagi tebengan ramah lingkungan di lingkungan Universitas Diponegoro.
              </p>
            </div>

            <div className="w-full bg-[#121416] p-3.5 rounded-2xl border border-white/5 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-gray-400">
                <span>Rute:</span>
                <span className="text-white font-medium">Tembalang ➔ Pleburan</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Status:</span>
                <span className="text-[#44e2cd] font-semibold">Dipindahkan ke Riwayat</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Biaya matching:</span>
                <span className="text-white font-semibold">1 AJUN Koin</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccessOverlay(false);
                setCurrentView('orders');
              }}
              className="w-full py-3.5 px-6 rounded-full bg-white text-[#0c0e10] font-bold text-xs hover:bg-neutral-100 active:scale-95 transition-all shadow-lg"
            >
              Lihat di Pesanan Saya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
