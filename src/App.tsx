import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';

// Views
import { DashboardView } from './views/DashboardView';
import { DriverPublishView } from './views/DriverPublishView';
import { DriverCandidatesView } from './views/DriverCandidatesView';
import { PassengerCandidatesView } from './views/PassengerCandidatesView';
import { ActiveTripView } from './views/ActiveTripView';
import { OrdersView } from './views/OrdersView';
import { ProfileView } from './views/ProfileView';
import { TopUpView } from './views/TopUpView';

const MainContent: React.FC = () => {
  const { currentView, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3 min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#44e2cd]/30 border-t-[#44e2cd] rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 font-medium">Memuat data AJUN UNDIP...</p>
      </div>
    );
  }

  switch (currentView) {
    case 'home':
      return <DashboardView />;
    case 'driver_publish':
      return <DriverPublishView />;
    case 'driver_candidates':
      return <DriverCandidatesView />;
    case 'passenger_search':
      return <PassengerCandidatesView />;
    case 'active_trip':
      return <ActiveTripView />;
    case 'orders':
      return <OrdersView />;
    case 'profile':
      return <ProfileView />;
    case 'topup':
      return <TopUpView />;
    default:
      return <DashboardView />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <div className="bg-[#0c0e10] text-[#e2e2e5] min-h-screen flex flex-col items-center selection:bg-[#44e2cd] selection:text-[#003731]">
        {/* Mobile Viewport Container matching 390px handheld format while centered on desktop */}
        <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-2xl bg-[#0c0e10]">
          <Header />
          <main className="flex-1 pt-2">
            <MainContent />
          </main>
          <BottomNav />
          <ToastContainer />
          <FirebaseStatusModal />
        </div>
      </div>
    </AppProvider>
  );
}
