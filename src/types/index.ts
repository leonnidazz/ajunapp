export type UserRole = 'driver' | 'passenger' | 'both';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty: string;
  batch?: string;
  avatar: string;
  coins: number;
  rating: number;
  phone: string;
  pinActive: boolean;
  demoLabel: string; // e.g. "Akun A (Driver)" or "Akun B (Passenger)"
}

export interface Vehicle {
  id: string;
  userId: string;
  merk: string;
  model: string;
  jenis: 'Motor' | 'Mobil';
  warna: string;
  plat: string;
  isDefault: boolean;
}

export type OfferStatus = 'OPEN' | 'MATCHED' | 'COMPLETED' | 'CANCELLED';

export interface RideOffer {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  driverFaculty: string;
  vehicle: string;
  vehiclePlat: string;
  origin: string;
  destination: string;
  departureTime: string;
  timeFlexibility: string;
  fare: number;
  note: string;
  status: OfferStatus;
  createdAt: number;
}

export type RequestStatus = 'REQUESTED' | 'AGREED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface RideRequest {
  id: string;
  offerId: string;
  driverId: string;
  driverName: string;
  passengerId: string;
  passengerName: string;
  passengerAvatar: string;
  passengerFaculty: string;
  origin: string;
  destination: string;
  departureTime: string;
  fare: number;
  status: RequestStatus;
  createdAt: number;
  expiresAt: number; // 60 seconds after creation
}

export type TripStatus = 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  offerId: string;
  requestId: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverVehicle: string;
  driverPlat: string;
  driverRating: number;
  passengerId: string;
  passengerName: string;
  passengerAvatar: string;
  passengerFaculty: string;
  origin: string;
  destination: string;
  departureTime: string;
  fare: number;
  coinsDeducted: number;
  status: TripStatus;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: number;
  completedAt?: number;
  distanceMeters: number;
  etaMinutes: number;
}

export interface ChatMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timeStr: string;
  createdAt: number;
}

export interface MatchingCandidate {
  id: string;
  name: string;
  role: 'driver' | 'passenger';
  avatar: string;
  faculty: string;
  vehicle?: string;
  origin: string;
  destination: string;
  departureTime: string;
  fare: number;
  distanceMeters: number;
  compatibilityScore: number; // 0 - 100
  compatibilityBreakdown: {
    route: number;      // 0-40 pts
    distance: number;   // 0-25 pts
    time: number;       // 0-20 pts
    fare: number;       // 0-15 pts
  };
  note?: string;
  offerId?: string;
  requestId?: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  type: 'TOPUP' | 'MATCH_FEE' | 'CANCEL_PENALTY' | 'REFUND';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: number;
}

export interface ServerEvent {
  type:
    | 'CONNECTED'
    | 'SYNC'
    | 'OFFER_CREATED'
    | 'OFFER_CANCELLED'
    | 'REQUEST_SUBMITTED'
    | 'REQUEST_RESPONDED'
    | 'REQUEST_EXPIRED'
    | 'REQUEST_CANCELLED'
    | 'TRIP_UPDATED'
    | 'CHAT_MESSAGE'
    | 'COINS_UPDATED'
    | 'VEHICLE_UPDATED';
  payload?: any;
}
