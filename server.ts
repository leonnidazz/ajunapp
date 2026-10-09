import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '1mb' }));

// ID Validator (Prevents prototype pollution and ID injection - S4)
const SAFE_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && id.length <= 128 && SAFE_ID_REGEX.test(id);
}

// Persistent Data File Path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'ajun_store.json');

interface StoreData {
  users: Record<string, any>;
  vehicles: Record<string, any>;
  offers: Record<string, any>;
  requests: Record<string, any>;
  trips: Record<string, any>;
  chats: Record<string, any[]>;
  coinLedger: any[];
}

function getDefaultStore(): StoreData {
  const store: StoreData = {
    users: Object.create(null),
    vehicles: Object.create(null),
    offers: Object.create(null),
    requests: Object.create(null),
    trips: Object.create(null),
    chats: Object.create(null),
    coinLedger: [],
  };

  store.users['user-driver-1'] = {
    id: 'user-driver-1',
    name: 'Dimas Prasetyo',
    email: 'dimas.prasetyo@students.undip.ac.id',
    role: 'driver',
    batch: "'21",
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    coins: 24,
    rating: 4.9,
    phone: '0812-3456-7890',
    pinActive: true,
    demoLabel: 'Akun A (Driver)',
  };

  store.users['user-pass-1'] = {
    id: 'user-pass-1',
    name: 'Nabila Saraswati',
    email: 'nabila.saraswati@students.undip.ac.id',
    role: 'passenger',
    faculty: 'Fakultas Ekonomika & Bisnis (FEB)',
    batch: "'22",
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coins: 20,
    rating: 4.8,
    phone: '0813-9876-5432',
    pinActive: true,
    demoLabel: 'Akun B (Passenger)',
  };

  store.vehicles['veh-1'] = {
    id: 'veh-1',
    userId: 'user-driver-1',
    merk: 'Honda',
    model: 'Vario 150',
    jenis: 'Motor',
    warna: 'Hitam',
    plat: 'H 4281 AW',
    isDefault: true,
  };

  store.vehicles['veh-2'] = {
    id: 'veh-2',
    userId: 'user-driver-1',
    merk: 'Yamaha',
    model: 'Aerox 155',
    jenis: 'Motor',
    warna: 'Biru Gelap',
    plat: 'H 5129 AA',
    isDefault: false,
  };

  store.offers['offer-seed-1'] = {
    id: 'offer-seed-1',
    driverId: 'user-driver-1',
    driverName: 'Dimas Prasetyo',
    driverAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.9,
    driverFaculty: 'FSM Undip',
    vehicle: 'Honda Vario 150 Hitam (Helm tersedia)',
    vehiclePlat: 'H 4281 AW',
    origin: 'Tembalang (Dekat Gerbang FSM)',
    destination: 'Kampus Pleburan (Jl. Hayam Wuruk / Simpang Lima)',
    departureTime: '08:35 WIB',
    timeFlexibility: 'Fleksibel ±5 mnt',
    fare: 8000,
    note: 'Bisa jemput depan gerbang FSM ya kak',
    status: 'OPEN',
    createdAt: Date.now() - 1000 * 60 * 5,
  };

  // Historical trips for Riwayat tab
  store.trips['trip-hist-1'] = {
    id: 'trip-hist-1',
    offerId: 'offer-hist-1',
    requestId: 'req-hist-1',
    driverId: 'user-other-1',
    driverName: 'Rizky Ramadhan',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    driverVehicle: 'Honda Beat Street',
    driverPlat: 'H 3847 BZ',
    driverRating: 4.8,
    passengerId: 'user-pass-1',
    passengerName: 'Nabila Saraswati',
    passengerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    passengerFaculty: 'FEB Undip',
    origin: 'Fakultas Teknik Undip',
    destination: 'Tembalang Selatan',
    departureTime: 'Kemarin, 16:45 WIB',
    fare: 7500,
    coinsDeducted: 1,
    status: 'COMPLETED',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    completedAt: Date.now() - 1000 * 60 * 60 * 23,
    distanceMeters: 2100,
    etaMinutes: 8,
    refundIssued: false,
  };

  store.trips['trip-hist-2'] = {
    id: 'trip-hist-2',
    offerId: 'offer-hist-2',
    requestId: 'req-hist-2',
    driverId: 'user-driver-1',
    driverName: 'Dimas Prasetyo',
    driverAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    driverVehicle: 'Honda Vario 150',
    driverPlat: 'H 4281 AW',
    driverRating: 4.9,
    passengerId: 'user-other-2',
    passengerName: 'Alya Putri',
    passengerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    passengerFaculty: 'FH Undip',
    origin: 'Banyumanik',
    destination: 'Kampus Widya Purba',
    departureTime: '22 Okt, 07:15 WIB',
    fare: 8000,
    coinsDeducted: 1,
    status: 'CANCELLED',
    cancelledBy: 'user-driver-1',
    cancellationReason: 'Ada urusan mendadak sebelum berangkat',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    distanceMeters: 3500,
    etaMinutes: 12,
    refundIssued: true,
  };

  store.trips['trip-hist-3'] = {
    id: 'trip-hist-3',
    offerId: 'offer-hist-3',
    requestId: 'req-hist-3',
    driverId: 'user-other-3',
    driverName: 'Farhan Mahendra',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    driverVehicle: 'Yamaha NMAX',
    driverPlat: 'H 6219 KT',
    driverRating: 4.9,
    passengerId: 'user-pass-1',
    passengerName: 'Nabila Saraswati',
    passengerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    passengerFaculty: 'FEB Undip',
    origin: 'Perpustakaan Pusat Undip',
    destination: 'Stasiun Poncol Semarang',
    departureTime: '20 Okt, 13:00 WIB',
    fare: 10000,
    coinsDeducted: 1,
    status: 'COMPLETED',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    completedAt: Date.now() - 1000 * 60 * 60 * 71,
    distanceMeters: 6200,
    etaMinutes: 20,
    refundIssued: false,
  };

  return store;
}

// Safe Store Loader with Corrupt File Preservation (S6)
let store: StoreData = (function loadStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      try {
        const parsed = JSON.parse(content);
        const fresh = getDefaultStore();
        // Merge into clean null-prototype dictionary
        Object.assign(fresh.users, parsed.users || {});
        Object.assign(fresh.vehicles, parsed.vehicles || {});
        Object.assign(fresh.offers, parsed.offers || {});
        Object.assign(fresh.requests, parsed.requests || {});
        Object.assign(fresh.trips, parsed.trips || {});
        Object.assign(fresh.chats, parsed.chats || {});
        fresh.coinLedger = Array.isArray(parsed.coinLedger) ? parsed.coinLedger : [];
        return fresh;
      } catch (parseErr) {
        console.error('Store JSON corrupted, preserving backup before reset:', parseErr);
        const backupPath = path.resolve(DATA_DIR, `ajun_store.corrupt.${Date.now()}.json`);
        fs.writeFileSync(backupPath, content);
      }
    }
  } catch (err) {
    console.error('Failed to load store, initializing default:', err);
  }
  const initial = getDefaultStore();
  saveStoreAtomic(initial);
  return initial;
})();

// Atomic Save with temporary file and rename (S6)
function saveStore() {
  saveStoreAtomic(store);
}

function saveStoreAtomic(dataToSave: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = path.resolve(DATA_DIR, `ajun_store.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`);
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2));
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving store atomically:', err);
  }
}

// Server-Sent Events (SSE) active client listeners
interface SSEClient {
  id: string;
  res: Response;
}
const sseClients: SSEClient[] = [];

function broadcast(type: string, payload?: any) {
  const data = JSON.stringify({ type, payload, timestamp: Date.now() });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(`data: ${data}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// SSE Heartbeat every 20s to prevent reverse proxy disconnection
setInterval(() => {
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(': heartbeat\n\n');
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 20000);

// Background auto-expiry ticker: Expire pending requests after 60 seconds (1 minute)
setInterval(() => {
  const now = Date.now();
  let changed = false;
  const expiredReqIds: string[] = [];

  for (const req of Object.values(store.requests)) {
    if (req.status === 'REQUESTED' && req.expiresAt && now > req.expiresAt) {
      req.status = 'EXPIRED';
      changed = true;
      expiredReqIds.push(req.id);
    }
  }
  if (changed) {
    saveStore();
    broadcast('REQUEST_EXPIRED', {
      expiredIds: expiredReqIds,
      message: 'Permintaan tebengan kedaluwarsa setelah 1 menit tanpa respon.',
    });
  }
}, 3000);

// SSE Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  const clientId = `client-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  sseClients.push({ id: clientId, res });

  // Do NOT broadcast a full sync here to prevent client infinite loops (C1)
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.findIndex((c) => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Users & Demo Auth Endpoints
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(Object.values(store.users));
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID user tidak valid' });
  }
  const user = store.users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
  res.json(user);
});

// Gated Prototype Coin Top-Up (S2)
app.post('/api/users/:id/topup', (req: Request, res: Response) => {
  if (isProduction) {
    return res.status(403).json({ error: 'Top up demo dinonaktifkan pada mode production. Integrasikan payment gateway dan verifikasi webhook sebelum mengaktifkan pembayaran.' });
  }
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID user tidak valid' });
  }
  const user = store.users[req.params.id];
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

  const { coins } = req.body;
  const numCoins = parseInt(coins, 10);
  if (isNaN(numCoins) || numCoins < 1 || numCoins > 500) {
    return res.status(400).json({ error: 'Jumlah koin tidak valid (minimal 1, maksimal 500 koin)' });
  }

  user.coins += numCoins;
  const rupiahValue = numCoins * 500;

  store.coinLedger.push({
    id: `tx-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    userId: user.id,
    type: 'TOPUP',
    amount: numCoins,
    balanceAfter: user.coins,
    description: `Top up simulasi demo ${numCoins} Koin (Rp ${rupiahValue.toLocaleString('id-ID')})`,
    timestamp: Date.now(),
  });

  saveStore();
  broadcast('COINS_UPDATED', { userId: user.id, newBalance: user.coins });
  res.json({ success: true, user, addedCoins: numCoins, rupiahValue });
});

// Vehicle Management
app.get('/api/vehicles/:userId', (req: Request, res: Response) => {
  if (!isValidId(req.params.userId)) {
    return res.status(400).json({ error: 'ID user tidak valid' });
  }
  const list = Object.values(store.vehicles).filter((v: any) => v.userId === req.params.userId);
  res.json(list);
});

app.post('/api/vehicles/:userId', (req: Request, res: Response) => {
  if (!isValidId(req.params.userId)) {
    return res.status(400).json({ error: 'ID user tidak valid' });
  }
  const { merk, model, jenis, warna, plat, isDefault } = req.body;
  if (!merk || !model || !plat || typeof merk !== 'string' || typeof model !== 'string' || typeof plat !== 'string') {
    return res.status(400).json({ error: 'Merk, model, dan nomor plat wajib diisi dengan format teks yang valid' });
  }

  const userId = req.params.userId;
  const userVehicles = Object.values(store.vehicles).filter((v: any) => v.userId === userId);
  const shouldBeDefault = Boolean(isDefault) || userVehicles.length === 0;

  if (shouldBeDefault) {
    userVehicles.forEach((v: any) => {
      v.isDefault = false;
    });
  }

  const newId = `veh-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const newVeh = {
    id: newId,
    userId,
    merk: merk.trim().slice(0, 50),
    model: model.trim().slice(0, 50),
    jenis: jenis === 'Mobil' ? 'Mobil' : 'Motor',
    warna: typeof warna === 'string' ? warna.trim().slice(0, 50) : 'Hitam',
    plat: plat.trim().toUpperCase().slice(0, 20),
    isDefault: shouldBeDefault,
  };

  store.vehicles[newId] = newVeh;
  saveStore();
  broadcast('VEHICLE_UPDATED', { userId });
  res.json(newVeh);
});

// Update Vehicle (V1: properly handle isDefault and input sanitization)
app.put('/api/vehicles/:id', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID kendaraan tidak valid' });
  }
  const veh = store.vehicles[req.params.id];
  if (!veh) return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });

  const { merk, model, jenis, warna, plat, isDefault } = req.body;
  if (typeof merk === 'string') veh.merk = merk.trim().slice(0, 50);
  if (typeof model === 'string') veh.model = model.trim().slice(0, 50);
  if (jenis === 'Motor' || jenis === 'Mobil') veh.jenis = jenis;
  if (typeof warna === 'string') veh.warna = warna.trim().slice(0, 50);
  if (typeof plat === 'string') veh.plat = plat.trim().toUpperCase().slice(0, 20);

  if (typeof isDefault === 'boolean' && isDefault) {
    Object.values(store.vehicles)
      .filter((v: any) => v.userId === veh.userId)
      .forEach((v: any) => {
        v.isDefault = v.id === veh.id;
      });
  }

  saveStore();
  broadcast('VEHICLE_UPDATED', { userId: veh.userId });
  res.json(veh);
});

app.post('/api/vehicles/:id/set-default', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID kendaraan tidak valid' });
  }
  const veh = store.vehicles[req.params.id];
  if (!veh) return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });

  Object.values(store.vehicles)
    .filter((v: any) => v.userId === veh.userId)
    .forEach((v: any) => {
      v.isDefault = v.id === veh.id;
    });

  saveStore();
  broadcast('VEHICLE_UPDATED', { userId: veh.userId });
  res.json({ success: true, vehicle: veh });
});

app.delete('/api/vehicles/:id', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID kendaraan tidak valid' });
  }
  const veh = store.vehicles[req.params.id];
  if (!veh) return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });

  const userId = veh.userId;
  const wasDefault = veh.isDefault;
  delete store.vehicles[req.params.id];

  if (wasDefault) {
    const remaining = Object.values(store.vehicles).filter((v: any) => v.userId === userId);
    if (remaining.length > 0) {
      (remaining[0] as any).isDefault = true;
    }
  }

  saveStore();
  broadcast('VEHICLE_UPDATED', { userId });
  res.json({ success: true });
});

// Driver Ride Offers
app.get('/api/offers', (_req: Request, res: Response) => {
  const list = Object.values(store.offers).filter((o: any) => o.status === 'OPEN');
  res.json(list);
});

app.post('/api/offers', (req: Request, res: Response) => {
  const { driverId, origin, destination, departureTime, timeFlexibility, fare, note, vehicleId } = req.body;
  if (!isValidId(driverId)) {
    return res.status(400).json({ error: 'Driver ID tidak valid' });
  }
  const driver = store.users[driverId];
  if (!driver) return res.status(404).json({ error: 'Driver tidak ditemukan' });

  // Active Trip Constraint (D3): Driver cannot open new ride offer if already in confirmed or ongoing trip
  const activeTrip = Object.values(store.trips).find(
    (t: any) => (t.driverId === driverId || t.passengerId === driverId) && (t.status === 'CONFIRMED' || t.status === 'ONGOING')
  );
  if (activeTrip) {
    return res.status(400).json({
      error: 'Anda masih memiliki perjalanan yang sedang aktif. Selesaikan perjalanan terlebih dahulu sebelum membuka tebengan baru.',
    });
  }

  // Coin Gate: Driver must possess at least 1 coin
  if (driver.coins < 1) {
    return res.status(403).json({
      error: 'Saldo AJUN Koin tidak mencukupi. Anda memerlukan minimal 1 Koin aktif untuk membuka tebengan.',
    });
  }

  // Fare bounds validation (F1)
  const parsedFare = parseInt(fare, 10);
  if (isNaN(parsedFare) || parsedFare < 1000 || parsedFare > 100000) {
    return res.status(400).json({ error: 'Tarif ongkos harus antara Rp 1.000 dan Rp 100.000' });
  }

  // Find vehicle
  let vehicleName = 'Motor Mahasiswa';
  let vehiclePlat = 'H UNDIP';
  if (vehicleId && isValidId(vehicleId) && store.vehicles[vehicleId]) {
    const v = store.vehicles[vehicleId];
    vehicleName = `${v.merk} ${v.model} (${v.warna})`;
    vehiclePlat = v.plat;
  } else {
    const defaultV = Object.values(store.vehicles).find((v: any) => v.userId === driverId && v.isDefault);
    if (defaultV) {
      const v = defaultV as any;
      vehicleName = `${v.merk} ${v.model} (${v.warna})`;
      vehiclePlat = v.plat;
    }
  }

  // Close previous OPEN offers by this driver so driver only has one current active offer (D3)
  Object.values(store.offers).forEach((o: any) => {
    if (o.driverId === driverId && o.status === 'OPEN') {
      o.status = 'CANCELLED';
      // Auto-cancel remaining pending requests on old offer
      Object.values(store.requests).forEach((r: any) => {
        if (r.offerId === o.id && r.status === 'REQUESTED') {
          r.status = 'CANCELLED';
        }
      });
    }
  });

  const offerId = `offer-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const newOffer = {
    id: offerId,
    driverId: driver.id,
    driverName: driver.name,
    driverAvatar: driver.avatar,
    driverRating: driver.rating,
    driverFaculty: driver.faculty,
    vehicle: vehicleName,
    vehiclePlat,
    origin: typeof origin === 'string' ? origin.trim().slice(0, 150) : 'Tembalang (Gerbang FSM / Rusunawa)',
    destination: typeof destination === 'string' ? destination.trim().slice(0, 150) : 'Kampus Pleburan (Jl. Hayam Wuruk)',
    departureTime: typeof departureTime === 'string' ? departureTime.trim().slice(0, 50) : '08:35 WIB',
    timeFlexibility: typeof timeFlexibility === 'string' ? timeFlexibility.trim().slice(0, 50) : 'Fleksibel ±5 mnt',
    fare: parsedFare,
    note: typeof note === 'string' ? note.trim().slice(0, 200) : 'Helm cadangan tersedia',
    status: 'OPEN',
    createdAt: Date.now(),
  };

  store.offers[offerId] = newOffer;
  saveStore();
  broadcast('OFFER_CREATED', newOffer);
  res.json(newOffer);
});

// Cancel / Close an Offer (L1)
app.post('/api/offers/:id/cancel', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID tawaran tidak valid' });
  }
  const offer = store.offers[req.params.id];
  if (!offer) return res.status(404).json({ error: 'Tawaran tidak ditemukan' });

  const { driverId } = req.body;
  if (offer.driverId !== driverId) {
    return res.status(403).json({ error: 'Hanya driver pembuat tawaran yang dapat membatalkannya' });
  }

  offer.status = 'CANCELLED';
  // Also reject any pending requests on this offer
  Object.values(store.requests).forEach((r: any) => {
    if (r.offerId === offer.id && r.status === 'REQUESTED') {
      r.status = 'CANCELLED';
    }
  });

  saveStore();
  broadcast('OFFER_CANCELLED', { offerId: offer.id });
  res.json({ success: true, offer });
});

// Ride Requests
app.get('/api/requests', (req: Request, res: Response) => {
  const { driverId, passengerId } = req.query;
  let list = Object.values(store.requests);
  if (driverId && typeof driverId === 'string' && isValidId(driverId)) {
    list = list.filter((r: any) => r.driverId === driverId);
  }
  if (passengerId && typeof passengerId === 'string' && isValidId(passengerId)) {
    list = list.filter((r: any) => r.passengerId === passengerId);
  }
  res.json(list);
});

app.post('/api/requests', (req: Request, res: Response) => {
  const { offerId, passengerId, origin, destination, departureTime, fare } = req.body;
  if (!isValidId(passengerId) || !isValidId(offerId)) {
    return res.status(400).json({ error: 'Parameter permintaan tidak valid' });
  }

  const passenger = store.users[passengerId];
  if (!passenger) return res.status(404).json({ error: 'Passenger tidak ditemukan' });

  const offer = store.offers[offerId];
  if (!offer || offer.status !== 'OPEN') {
    return res.status(400).json({ error: 'Tawaran tebengan ini sudah tidak tersedia atau sudah terisi.' });
  }

  // SELF-MATCHING GUARD (D2)
  if (passenger.id === offer.driverId) {
    return res.status(400).json({ error: 'Anda tidak dapat memesan tawaran tebengan milik Anda sendiri.' });
  }

  // ACTIVE TRIP GUARD (D3)
  const existingActiveTrip = Object.values(store.trips).find(
    (t: any) => (t.passengerId === passengerId || t.driverId === passengerId) && (t.status === 'CONFIRMED' || t.status === 'ONGOING')
  );
  if (existingActiveTrip) {
    return res.status(400).json({ error: 'Anda sedang memiliki perjalanan yang aktif. Selesaikan perjalanan tersebut terlebih dahulu.' });
  }

  // Request fare bounds validation: do not accept arbitrary client-provided values.
  if (fare !== undefined && (!Number.isFinite(Number(fare)) || Number(fare) < 1000 || Number(fare) > 100000)) {
    return res.status(400).json({ error: 'Estimasi ongkos harus antara Rp 1.000 dan Rp 100.000.' });
  }

  // Coin check
  if (passenger.coins < 1) {
    return res.status(403).json({
      error: 'Saldo AJUN Koin tidak mencukupi. Anda memerlukan minimal 1 Koin aktif untuk memesan tebengan.',
    });
  }

  // Prevent duplicate active request from same passenger for same offer
  const existing = Object.values(store.requests).find(
    (r: any) => r.offerId === offerId && r.passengerId === passengerId && r.status === 'REQUESTED'
  );
  if (existing) {
    return res.status(400).json({ error: 'Anda sudah mengirim permintaan untuk tebengan ini. Menunggu respon driver.' });
  }

  const reqId = `req-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const now = Date.now();
  const newReq = {
    id: reqId,
    offerId: offer.id,
    driverId: offer.driverId,
    driverName: offer.driverName,
    passengerId: passenger.id,
    passengerName: passenger.name,
    passengerAvatar: passenger.avatar,
    passengerFaculty: passenger.faculty,
    origin: typeof origin === 'string' ? origin.trim().slice(0, 150) : offer.origin,
    destination: typeof destination === 'string' ? destination.trim().slice(0, 150) : offer.destination,
    departureTime: typeof departureTime === 'string' ? departureTime.trim().slice(0, 50) : offer.departureTime,
    fare: typeof fare === 'number' && fare > 0 ? fare : offer.fare,
    status: 'REQUESTED',
    createdAt: now,
    expiresAt: now + 60000, // 1 minute auto-expiry
  };

  store.requests[reqId] = newReq;
  saveStore();
  broadcast('REQUEST_SUBMITTED', newReq);
  res.json(newReq);
});

// Withdraw / Cancel Request by Passenger (L1)
app.post('/api/requests/:id/withdraw', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID permintaan tidak valid' });
  }
  const request = store.requests[req.params.id];
  if (!request) return res.status(404).json({ error: 'Permintaan tidak ditemukan' });

  const { passengerId } = req.body;
  if (request.passengerId !== passengerId) {
    return res.status(403).json({ error: 'Hanya penumpang yang mengajukan yang dapat membatalkan permintaan ini' });
  }

  if (request.status !== 'REQUESTED') {
    return res.status(400).json({ error: `Permintaan ini sudah berstatus ${request.status}` });
  }

  request.status = 'CANCELLED';
  saveStore();
  broadcast('REQUEST_CANCELLED', { requestId: request.id });
  res.json({ success: true, request });
});

// Driver responds to request (Accept / Reject) - ATOMIC TRANSACTION & SINGLE-SEAT LOCK
app.post('/api/requests/:id/respond', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID permintaan tidak valid' });
  }
  const request = store.requests[req.params.id];
  if (!request) return res.status(404).json({ error: 'Permintaan tidak ditemukan' });

  const { action, driverId } = req.body;
  if (request.driverId !== driverId) {
    return res.status(403).json({ error: 'Hanya driver terkait yang dapat merespon permintaan ini' });
  }

  if (request.status !== 'REQUESTED') {
    return res.status(400).json({ error: `Permintaan ini sudah berstatus ${request.status}` });
  }

  // Check 1-minute expiry
  if (Date.now() > request.expiresAt) {
    request.status = 'EXPIRED';
    saveStore();
    broadcast('REQUEST_EXPIRED', request);
    return res.status(400).json({ error: 'Permintaan tebengan telah kedaluwarsa (lebih dari 1 menit tanpa respon)' });
  }

  const offer = store.offers[request.offerId];
  const driver = store.users[request.driverId];
  const passenger = store.users[request.passengerId];

  if (action === 'reject') {
    request.status = 'REJECTED';
    saveStore();
    broadcast('REQUEST_RESPONDED', { requestId: request.id, status: 'REJECTED' });
    return res.json({ success: true, status: 'REJECTED' });
  }

  if (action === 'accept') {
    // ATOMIC VALIDATIONS (Single-seat lock & balance check):
    if (!offer || offer.status !== 'OPEN') {
      return res.status(409).json({ error: 'Tawaran tebengan ini telah terisi atau ditutup untuk penumpang lain.' });
    }

    // Re-check passenger active trip at accept time (D3)
    const passengerActiveTrip = Object.values(store.trips).find(
      (t: any) => (t.passengerId === passenger.id || t.driverId === passenger.id) && (t.status === 'CONFIRMED' || t.status === 'ONGOING')
    );
    if (passengerActiveTrip) {
      return res.status(409).json({ error: 'Penumpang ini sudah terikat dengan perjalanan aktif lain yang baru saja dikonfirmasi.' });
    }

    if (driver.coins < 1) {
      return res.status(400).json({ error: 'Saldo Koin Driver tidak mencukupi untuk konfirmasi tebengan.' });
    }
    if (passenger.coins < 1) {
      return res.status(400).json({ error: 'Saldo Koin Passenger tidak mencukupi untuk konfirmasi tebengan.' });
    }

    // Atomic deduction: Exactly 1 coin each
    driver.coins -= 1;
    passenger.coins -= 1;

    store.coinLedger.push({
      id: `tx-${Date.now()}-drv-${crypto.randomBytes(2).toString('hex')}`,
      userId: driver.id,
      type: 'MATCH_FEE',
      amount: -1,
      balanceAfter: driver.coins,
      description: `Biaya matching tebengan dengan ${passenger.name}`,
      timestamp: Date.now(),
    });

    store.coinLedger.push({
      id: `tx-${Date.now()}-pass-${crypto.randomBytes(2).toString('hex')}`,
      userId: passenger.id,
      type: 'MATCH_FEE',
      amount: -1,
      balanceAfter: passenger.coins,
      description: `Biaya matching tebengan dengan ${driver.name}`,
      timestamp: Date.now(),
    });

    offer.status = 'MATCHED';
    request.status = 'AGREED';

    const tripId = `trip-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const newTrip = {
      id: tripId,
      offerId: offer.id,
      requestId: request.id,
      driverId: driver.id,
      driverName: driver.name,
      driverAvatar: driver.avatar,
      driverVehicle: offer.vehicle,
      driverPlat: offer.vehiclePlat,
      driverRating: driver.rating,
      passengerId: passenger.id,
      passengerName: passenger.name,
      passengerAvatar: passenger.avatar,
      passengerFaculty: passenger.faculty,
      origin: request.origin,
      destination: request.destination,
      departureTime: request.departureTime,
      fare: request.fare,
      coinsDeducted: 1,
      status: 'CONFIRMED', // Begins in CONFIRMED state per lifecycle specification
      createdAt: Date.now(),
      distanceMeters: 650,
      etaMinutes: 4,
      refundIssued: false,
    };

    store.trips[tripId] = newTrip;

    // Seed default greeting message
    store.chats[tripId] = [
      {
        id: `chat-${Date.now()}-1`,
        tripId,
        senderId: driver.id,
        senderName: driver.name,
        senderAvatar: driver.avatar,
        text: 'Halo kak, tebengan sudah terkonfirmasi! Saya sedang bersiap menuju titik jemput.',
        timeStr: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
      },
    ];

    // Auto-reject other pending requests for this same offer
    Object.values(store.requests).forEach((r: any) => {
      if (r.offerId === offer.id && r.id !== request.id && r.status === 'REQUESTED') {
        r.status = 'REJECTED';
      }
    });

    saveStore();

    broadcast('TRIP_UPDATED', { tripId, trip: newTrip });
    broadcast('COINS_UPDATED', { driverCoins: driver.coins, passengerCoins: passenger.coins });
    broadcast('REQUEST_RESPONDED', { requestId: request.id, status: 'AGREED', tripId });

    return res.json({ success: true, status: 'AGREED', trip: newTrip });
  }

  return res.status(400).json({ error: 'Aksi tidak dikenal' });
});

// Trip Details
app.get('/api/trips/:id', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID perjalanan tidak valid' });
  }
  const trip = store.trips[req.params.id];
  if (!trip) return res.status(404).json({ error: 'Perjalanan tidak ditemukan' });
  res.json(trip);
});

// Get user's current active trip
app.get('/api/trips/active/:userId', (req: Request, res: Response) => {
  if (!isValidId(req.params.userId)) {
    return res.status(400).json({ error: 'ID user tidak valid' });
  }
  const userId = req.params.userId;
  const activeTrip = Object.values(store.trips).find(
    (t: any) => (t.driverId === userId || t.passengerId === userId) && (t.status === 'CONFIRMED' || t.status === 'ONGOING')
  );
  res.json(activeTrip || null);
});

// Trip Action (Start, Complete, Cancel) - Hardened against S3 exploit
app.post('/api/trips/:id/action', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID perjalanan tidak valid' });
  }
  const trip = store.trips[req.params.id];
  if (!trip) return res.status(404).json({ error: 'Perjalanan tidak ditemukan' });

  const { action, userId, reason } = req.body;
  if (!isValidId(userId)) {
    return res.status(400).json({ error: 'User ID tidak valid' });
  }

  // S3 GUARD: Only actual participants of the trip may perform actions
  if (trip.driverId !== userId && trip.passengerId !== userId) {
    return res.status(403).json({ error: 'Hanya peserta perjalanan (Driver/Passenger) yang berhak melakukan tindakan ini' });
  }

  // S3 GUARD: Terminal State Locking
  if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
    return res.status(400).json({ error: `Perjalanan sudah berstatus ${trip.status} dan tidak dapat diubah lagi.` });
  }

  // 1. ACTION: START TRIP (CONFIRMED -> ONGOING)
  if (action === 'start') {
    if (userId !== trip.driverId) {
      return res.status(403).json({ error: 'Hanya driver yang dapat memulai perjalanan.' });
    }
    if (trip.status !== 'CONFIRMED') {
      return res.status(400).json({ error: 'Perjalanan hanya dapat dimulai dari status CONFIRMED.' });
    }
    trip.status = 'ONGOING';
    saveStore();
    broadcast('TRIP_UPDATED', { tripId: trip.id, trip });
    return res.json({ success: true, trip });
  }

  // 2. ACTION: COMPLETE TRIP
  if (action === 'complete') {
    if (userId !== trip.driverId) {
      return res.status(403).json({ error: 'Hanya driver yang dapat menyelesaikan perjalanan pada prototipe ini.' });
    }
    if (trip.status !== 'ONGOING') {
      return res.status(400).json({ error: 'Perjalanan harus berstatus ONGOING sebelum dapat diselesaikan.' });
    }
    trip.status = 'COMPLETED';
    trip.completedAt = Date.now();
    saveStore();
    broadcast('TRIP_UPDATED', { tripId: trip.id, trip });
    return res.json({ success: true, trip });
  }

  // 3. ACTION: CANCEL TRIP (Strictly idempotent 1-coin penalty & single refund)
  if (action === 'cancel') {
    trip.status = 'CANCELLED';
    trip.cancelledBy = userId;
    trip.cancellationReason = typeof reason === 'string' ? reason.trim().slice(0, 200) : 'Dibatalkan oleh pengguna';

    const isDriverCancelling = trip.driverId === userId;
    const innocentUserId = isDriverCancelling ? trip.passengerId : trip.driverId;
    const innocentUser = store.users[innocentUserId];
    const cancellingUser = store.users[userId];

    // Ledger penalty entry for the cancelling party (deposit was forfeited at confirmation)
    if (cancellingUser) {
      store.coinLedger.push({
        id: `tx-${Date.now()}-pen-${crypto.randomBytes(2).toString('hex')}`,
        userId: cancellingUser.id,
        type: 'CANCEL_PENALTY',
        amount: 0,
        balanceAfter: cancellingUser.coins,
        description: `Deposit 1 Koin hangus akibat pembatalan sepihak perjalanan tebengan ID ${trip.id}`,
        timestamp: Date.now(),
      });
    }

    // Refund innocent party ONLY ONCE (S3 fix)
    if (innocentUser && !trip.refundIssued) {
      trip.refundIssued = true;
      innocentUser.coins += 1;
      store.coinLedger.push({
        id: `tx-${Date.now()}-ref-${crypto.randomBytes(2).toString('hex')}`,
        userId: innocentUser.id,
        type: 'REFUND',
        amount: 1,
        balanceAfter: innocentUser.coins,
        description: `Pengembalian 1 Koin karena tebengan dibatalkan oleh mitra perjalanan`,
        timestamp: Date.now(),
      });
    }

    saveStore();
    broadcast('TRIP_UPDATED', { tripId: trip.id, trip });
    broadcast('COINS_UPDATED', { refundedUserId: innocentUserId });
    return res.json({ success: true, trip });
  }

  return res.status(400).json({ error: 'Aksi perjalanan tidak dikenal' });
});

// Trip Real-time Chat
app.get('/api/trips/:id/chat', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID perjalanan tidak valid' });
  }
  const chats = store.chats[req.params.id] || [];
  res.json(chats);
});

app.post('/api/trips/:id/chat', (req: Request, res: Response) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID perjalanan tidak valid' });
  }
  const { senderId, text } = req.body;
  if (!isValidId(senderId) || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Pesan tidak valid atau kosong' });
  }

  const trip = store.trips[req.params.id];
  if (!trip) return res.status(404).json({ error: 'Perjalanan tidak ditemukan' });

  // Only participants can chat
  if (trip.driverId !== senderId && trip.passengerId !== senderId) {
    return res.status(403).json({ error: 'Hanya peserta perjalanan yang dapat mengirim pesan' });
  }

  const sender = store.users[senderId] || { name: 'User', avatar: '' };

  const newMsg = {
    id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    tripId: trip.id,
    senderId,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    text: text.trim().slice(0, 1000),
    timeStr: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now(),
  };

  if (!store.chats[trip.id]) {
    store.chats[trip.id] = [];
  }
  store.chats[trip.id].push(newMsg);

  saveStore();
  broadcast('CHAT_MESSAGE', { tripId: trip.id, message: newMsg });
  res.json(newMsg);
});

// Orders Endpoint (Aktif vs Riwayat tabs)
app.get('/api/orders/:userId', (req: Request, res: Response) => {
  if (!isValidId(req.params.userId)) {
    return res.status(400).json({ error: 'ID user tidak valid' });
  }
  const userId = req.params.userId;
  const userTrips = Object.values(store.trips).filter(
    (t: any) => t.driverId === userId || t.passengerId === userId
  );

  const aktif = userTrips
    .filter((t: any) => t.status === 'CONFIRMED' || t.status === 'ONGOING')
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  const riwayat = userTrips
    .filter((t: any) => t.status === 'COMPLETED' || t.status === 'CANCELLED')
    .sort((a: any, b: any) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt));

  res.json({ aktif, riwayat });
});

// Demo reset is development-only; never rely on a hardcoded header secret.
app.post('/api/demo/reset', (req: Request, res: Response) => {
  if (isProduction) {
    return res.status(403).json({ error: 'Reset demo hanya tersedia pada mode development.' });
  }
  store = getDefaultStore();
  saveStore();
  broadcast('SYNC', { message: 'Data demo direset ke kondisi awal' });
  res.json({ success: true, message: 'Data demo telah direset' });
});

// Server Mount (Dev Vite Middleware / Prod Static Files)
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AJUN full-stack server running on http://0.0.0.0:${PORT} [mode: ${isProduction ? 'prod' : 'dev'}]`);
  });
}

startServer();
