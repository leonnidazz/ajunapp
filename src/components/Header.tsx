import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, incomingRequests, activeTrip, currentUser } = useApp();

  const isHome = currentView === 'home';

  const getPageTitle = () => {
    switch (currentView) {
      case 'driver_publish':
        return 'Tawarkan Tebengan';
      case 'driver_candidates':
        return 'Cari Passenger';
      case 'passenger_search':
        return 'Cari Driver';
      case 'active_trip':
        return 'Perjalanan Aktif';
      case 'orders':
        return 'Pesanan Saya';
      case 'profile':
        return 'Profil Akun';
      case 'topup':
        return 'Top Up Koin';
      default:
        return 'Ajun';
    }
  };

  const handleBack = () => {
    if (currentView === 'driver_candidates' || currentView === 'driver_publish') {
      setCurrentView('home');
    } else if (currentView === 'passenger_search') {
      setCurrentView('home');
    } else if (currentView === 'active_trip') {
      setCurrentView('home');
    } else if (currentView === 'topup') {
      setCurrentView('home');
    } else {
      setCurrentView('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e10]/90 backdrop-blur-md px-5 py-3.5 max-w-md mx-auto w-full border-b border-white/5 transition-all">
      <div className="flex items-center justify-between">
        {!isHome ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              aria-label="Kembali"
              className="w-10 h-10 rounded-full bg-[#1e2022] text-[#e2e2e5] flex items-center justify-center hover:bg-[#282a2c] active:scale-95 transition-all shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                {getPageTitle()}
              </h1>
              <span className="text-[11px] text-[#89938e] leading-none">Antar Jemput Undip</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#1e2022] border border-[#44e2cd]/30 flex items-center justify-center text-[#44e2cd] shadow-md overflow-hidden">
              <span className="material-symbols-outlined text-[22px]">two_wheeler</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-tight font-rubik">
                Ajun
              </span>
              <span className="text-[11px] text-[#89938e] leading-none">Antar Jemput Undip</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {activeTrip && (
            <button
              onClick={() => setCurrentView('active_trip')}
              className="px-2.5 py-1 rounded-full bg-[#1b5e4b]/40 border border-[#44e2cd]/40 text-[#44e2cd] text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#44e2cd] animate-ping"></span>
              Trip Aktif
            </button>
          )}

          {/* Quick role badge */}
          {currentUser && (
            <button
              onClick={() => setCurrentView('profile')}
              title="Profil Pengguna"
              className="px-2.5 py-1 rounded-full bg-[#1e2022] hover:bg-[#282a2c] border border-white/10 text-[11px] text-[#94d5bd] font-medium flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xs">
                {currentUser.role === 'driver' ? 'two_wheeler' : 'directions_walk'}
              </span>
              <span>{currentUser.role === 'driver' ? 'Driver' : 'Passenger'}</span>
            </button>
          )}

          {/* Notifications button */}
          <button
            onClick={() => {
              if (incomingRequests.length > 0) {
                setCurrentView('driver_candidates');
              } else {
                setCurrentView('orders');
              }
            }}
            aria-label="Notifikasi"
            className="relative w-10 h-10 rounded-2xl bg-[#1e2022] flex items-center justify-center text-[#e2e2e5] hover:bg-[#282a2c] transition-colors active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {incomingRequests.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#44e2cd] animate-pulse"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
