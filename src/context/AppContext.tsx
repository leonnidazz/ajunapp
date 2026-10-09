import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Vehicle, RideOffer, RideRequest, Trip, ChatMessage } from '../types';
import * as api from '../services/api';

export type AppView =
  | 'home'
  | 'driver_publish'
  | 'driver_candidates'
  | 'passenger_search'
  | 'active_trip'
  | 'orders'
  | 'profile'
  | 'topup';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeTrip: Trip | null;
  openOffers: RideOffer[];
  myRequests: RideRequest[];
  incomingRequests: RideRequest[];
  vehicles: Vehicle[];
  orders: { aktif: Trip[]; riwayat: Trip[] };
  unreadChatCount: number;
  isLoading: boolean;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  switchDemoUser: (userId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
  isFirebaseModalOpen: boolean;
  setIsFirebaseModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  // Demo identity is scoped to this tab, never shared through localStorage.
  const [tabUserId, setTabUserId] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlAs = params.get('as');
      const urlUser = params.get('user');
      const requestedId = urlAs === 'driver' || urlAs === 'a'
        ? 'user-driver-1'
        : urlAs === 'passenger' || urlAs === 'b'
          ? 'user-pass-1'
          : urlUser;
      const storedId = sessionStorage.getItem('ajun_session_user_id');
      const initialId = requestedId || storedId || 'user-driver-1';
      sessionStorage.setItem('ajun_session_user_id', initialId);
      // Consume the URL selector so later profile switches are not overridden.
      if (urlAs || urlUser) {
        params.delete('as');
        params.delete('user');
        const query = params.toString();
        window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
      }
      return initialId;
    } catch {
      return 'user-driver-1';
    }
  });
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [openOffers, setOpenOffers] = useState<RideOffer[]>([]);
  const [myRequests, setMyRequests] = useState<RideRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<RideRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<{ aktif: Trip[]; riwayat: Trip[] }>({ aktif: [], riwayat: [] });
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const currentUserRef = React.useRef<UserProfile | null>(null);
  const showToastRef = React.useRef(showToast);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // Each browser tab owns its demo identity. Do not fall back to shared localStorage.
  const getActiveUserId = useCallback(() => {
    try {
      return sessionStorage.getItem('ajun_session_user_id') || tabUserId;
    } catch {
      return tabUserId;
    }
  }, [tabUserId]);

  const refreshAllData = useCallback(async () => {
    try {
      const allUsers = await api.fetchUsers();
      setUsers(allUsers);

      const targetId = getActiveUserId();
      const activeU = allUsers.find((u) => u.id === targetId) || allUsers[0];
      setCurrentUser(activeU);

      if (activeU) {
        // Fetch active trip
        const trip = await api.fetchActiveTrip(activeU.id);
        setActiveTrip(trip);

        // Fetch open offers
        const offers = await api.fetchOffers();
        setOpenOffers(offers);

        // Fetch vehicles
        const vList = await api.fetchVehicles(activeU.id);
        setVehicles(vList);

        // Fetch requests
        const reqs = await api.fetchRequests();
        const mine = reqs.filter((r) => r.passengerId === activeU.id);
        const incoming = reqs.filter((r) => r.driverId === activeU.id && r.status === 'REQUESTED');
        setMyRequests(mine);
        setIncomingRequests(incoming);

        // Fetch orders
        const ord = await api.fetchOrders(activeU.id);
        setOrders(ord);
      }
    } catch (err) {
      console.error('Error refreshing app data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getActiveUserId]);

  const switchDemoUser = async (userId: string) => {
    try {
      sessionStorage.setItem('ajun_session_user_id', userId);
    } catch {
      // Ignore
    }
    setTabUserId(userId);
    setIsLoading(true);
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      showToast(`Beralih ke ${target.demoLabel}: ${target.name}`, 'info');
    }
    await refreshAllData();
    setIsLoading(false);
  };

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // C1 FIX: Subscribe to SSE once on mount; use refs inside the listener so the connection is never torn down in an infinite loop!
  useEffect(() => {
    const unsubscribe = api.subscribeToEvents((event) => {
      // Refresh app data on server mutation
      refreshAllData();

      const user = currentUserRef.current;
      const notify = showToastRef.current;

      if (event.type === 'REQUEST_SUBMITTED') {
        if (user && event.payload?.driverId === user.id) {
          notify(`Permintaan tebengan baru dari ${event.payload.passengerName}!`, 'info');
        }
      } else if (event.type === 'REQUEST_RESPONDED') {
        if (event.payload?.status === 'AGREED') {
          notify('Permintaan tebengan telah diterima! Perjalanan dimulai.', 'success');
        } else if (event.payload?.status === 'REJECTED') {
          notify('Permintaan tebengan ditolak oleh driver.', 'error');
        }
      } else if (event.type === 'REQUEST_EXPIRED') {
        notify('Batas waktu respon permintaan (1 menit) telah kedaluwarsa.', 'info');
      } else if (event.type === 'OFFER_CANCELLED') {
        // Updated
      } else if (event.type === 'TRIP_UPDATED') {
        if (event.payload?.trip?.status === 'COMPLETED') {
          notify('Perjalanan tebengan telah selesai! Terima kasih.', 'success');
        } else if (event.payload?.trip?.status === 'CANCELLED') {
          notify('Perjalanan tebengan dibatalkan.', 'error');
        }
      }
    });

    // Gentle fallback polling every 3 seconds
    const pollInterval = setInterval(() => {
      refreshAllData();
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [refreshAllData]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        currentView,
        setCurrentView,
        activeTrip,
        openOffers,
        myRequests,
        incomingRequests,
        vehicles,
        orders,
        unreadChatCount,
        isLoading,
        toasts,
        showToast,
        switchDemoUser,
        refreshAllData,
        isFirebaseModalOpen,
        setIsFirebaseModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
