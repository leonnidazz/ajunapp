import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, orders, activeTrip } = useApp();

  const isHomeActive = currentView === 'home';
  const isOrdersActive = currentView === 'orders' || currentView === 'active_trip';
  const isProfileActive = currentView === 'profile';

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 grid grid-cols-3 items-center px-6 py-2.5 max-w-md mx-auto bg-[#0c0e10]/95 backdrop-blur-md border-t border-white/10 shadow-2xl">
      {/* Home */}
      <button
        onClick={() => setCurrentView('home')}
        className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
          isHomeActive ? 'text-[#44e2cd] font-semibold' : 'text-[#89938e] hover:text-[#e2e2e5]'
        }`}
        type="button"
      >
        <span
          className={`material-symbols-outlined text-[24px] ${isHomeActive ? 'material-symbols-fill' : ''}`}
        >
          home
        </span>
        <span className="text-[11px] tracking-wide mt-0.5">Home</span>
      </button>

      {/* Orders */}
      <button
        onClick={() => {
          if (activeTrip) {
            setCurrentView('active_trip');
          } else {
            setCurrentView('orders');
          }
        }}
        className={`flex flex-col items-center justify-center py-1 relative transition-all active:scale-95 ${
          isOrdersActive ? 'text-[#44e2cd] font-semibold' : 'text-[#89938e] hover:text-[#e2e2e5]'
        }`}
        type="button"
      >
        <span
          className={`material-symbols-outlined text-[24px] ${isOrdersActive ? 'material-symbols-fill' : ''}`}
        >
          commute
        </span>
        <span className="text-[11px] tracking-wide mt-0.5">Orders</span>
        {(orders.aktif.length > 0 || activeTrip) && (
          <span className="absolute top-1 right-[28%] w-2 h-2 rounded-full bg-[#44e2cd] animate-pulse"></span>
        )}
      </button>

      {/* Profile */}
      <button
        onClick={() => setCurrentView('profile')}
        className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
          isProfileActive ? 'text-[#44e2cd] font-semibold' : 'text-[#89938e] hover:text-[#e2e2e5]'
        }`}
        type="button"
      >
        <span
          className={`material-symbols-outlined text-[24px] ${isProfileActive ? 'material-symbols-fill' : ''}`}
        >
          person
        </span>
        <span className="text-[11px] tracking-wide mt-0.5">Profile</span>
      </button>
    </nav>
  );
};
