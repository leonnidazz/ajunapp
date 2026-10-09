import {
  UserProfile,
  Vehicle,
  RideOffer,
  RideRequest,
  Trip,
  ChatMessage,
  ServerEvent,
} from '../types';

const BASE_URL = '/api';

export async function fetchUsers(): Promise<UserProfile[]> {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error('Gagal memuat daftar profil demo');
  return res.json();
}

export async function fetchUser(userId: string): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  if (!res.ok) throw new Error('Gagal memuat data profil');
  return res.json();
}

export async function topUpCoins(userId: string, coins: number): Promise<{ success: boolean; user: UserProfile; addedCoins: number }> {
  const res = await fetch(`${BASE_URL}/users/${userId}/topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coins }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memproses top up');
  return data;
}

export async function fetchVehicles(userId: string): Promise<Vehicle[]> {
  const res = await fetch(`${BASE_URL}/vehicles/${userId}`);
  if (!res.ok) throw new Error('Gagal memuat kendaraan');
  return res.json();
}

export async function addVehicle(userId: string, vehicle: Omit<Vehicle, 'id' | 'userId'>): Promise<Vehicle> {
  const res = await fetch(`${BASE_URL}/vehicles/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal menambah kendaraan');
  return data;
}

export async function updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memperbarui kendaraan');
  return data;
}

export async function setDefaultVehicle(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}/set-default`, { method: 'POST' });
  if (!res.ok) throw new Error('Gagal mengatur kendaraan default');
}

export async function deleteVehicle(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus kendaraan');
}

export async function fetchOffers(): Promise<RideOffer[]> {
  const res = await fetch(`${BASE_URL}/offers`);
  if (!res.ok) throw new Error('Gagal memuat daftar tebengan');
  return res.json();
}

export async function createRideOffer(data: {
  driverId: string;
  origin: string;
  destination: string;
  departureTime: string;
  timeFlexibility?: string;
  fare: number;
  note?: string;
  vehicleId?: string;
}): Promise<RideOffer> {
  const res = await fetch(`${BASE_URL}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal mempublikasikan tebengan');
  return json;
}

export async function fetchRequests(params?: { driverId?: string; passengerId?: string }): Promise<RideRequest[]> {
  const query = new URLSearchParams();
  if (params?.driverId) query.set('driverId', params.driverId);
  if (params?.passengerId) query.set('passengerId', params.passengerId);
  const res = await fetch(`${BASE_URL}/requests?${query.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat permintaan');
  return res.json();
}

export async function sendRideRequest(data: {
  offerId: string;
  passengerId: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  fare?: number;
}): Promise<RideRequest> {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal mengajukan tebengan');
  return json;
}

export async function respondToRequest(requestId: string, driverId: string, action: 'accept' | 'reject'): Promise<{ success: boolean; trip?: Trip }> {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId, action }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal memproses respon');
  return json;
}

export async function fetchTrip(tripId: string): Promise<Trip> {
  const res = await fetch(`${BASE_URL}/trips/${tripId}`);
  if (!res.ok) throw new Error('Gagal memuat data perjalanan');
  return res.json();
}

export async function fetchActiveTrip(userId: string): Promise<Trip | null> {
  const res = await fetch(`${BASE_URL}/trips/active/${userId}`);
  if (!res.ok) throw new Error('Gagal memuat perjalanan aktif');
  return res.json();
}

export async function cancelOffer(offerId: string, driverId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/offers/${offerId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal membatalkan tawaran');
}

export async function withdrawRequest(requestId: string, passengerId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passengerId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal menarik kembali permintaan');
}

export async function executeTripAction(
  tripId: string,
  userId: string,
  action: 'start' | 'complete' | 'cancel',
  reason?: string
): Promise<{ success: boolean; trip: Trip }> {
  const res = await fetch(`${BASE_URL}/trips/${tripId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, action, reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal memproses aksi perjalanan');
  return json;
}

export async function fetchChat(tripId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${BASE_URL}/trips/${tripId}/chat`);
  if (!res.ok) throw new Error('Gagal memuat riwayat pesan');
  return res.json();
}

export async function sendChatMessage(tripId: string, senderId: string, text: string): Promise<ChatMessage> {
  const res = await fetch(`${BASE_URL}/trips/${tripId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId, text }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal mengirim pesan');
  return json;
}

export async function fetchOrders(userId: string): Promise<{ aktif: Trip[]; riwayat: Trip[] }> {
  const res = await fetch(`${BASE_URL}/orders/${userId}`);
  if (!res.ok) throw new Error('Gagal memuat riwayat pesanan');
  return res.json();
}

export async function resetDemoData(): Promise<void> {
  await fetch(`${BASE_URL}/demo/reset`, { method: 'POST' });
}

// Subscribe to real-time events via Server-Sent Events (SSE)
export function subscribeToEvents(onEvent: (event: ServerEvent) => void): () => void {
  let eventSource: EventSource | null = null;
  let isClosed = false;

  function connect() {
    if (isClosed) return;
    eventSource = new EventSource(`${BASE_URL}/events`);

    eventSource.onmessage = (event) => {
      try {
        const parsed: ServerEvent = JSON.parse(event.data);
        onEvent(parsed);
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
      }
      // Reconnect after 3 seconds
      if (!isClosed) {
        setTimeout(connect, 3000);
      }
    };
  }

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
    }
  };
}
