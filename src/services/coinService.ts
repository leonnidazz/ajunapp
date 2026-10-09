/**
 * AJUN COIN RULES ENGINE & FINANCIAL SPECIFICATION
 * 
 * 1. Conversion Rate:
 *    1 AJUN Koin = Rp 500 (Rupiah Indonesia).
 * 
 * 2. Eligibility Gate:
 *    A student (Driver or Passenger) must possess at least 1 Koin (balance >= 1)
 *    to publish an offer or submit a ride request.
 * 
 * 3. Atomic Point of Deduction:
 *    No coins are deducted upon browsing or submitting an initial request.
 *    Deduction occurs ONLY once at the exact moment a Driver successfully ACCEPTS
 *    the single-seat request (Server-side atomic transaction).
 *    Driver fee: 1 Koin
 *    Passenger fee: 1 Koin
 * 
 * 4. Cancellation Penalty Rule:
 *    - If the ride is cancelled after confirmation, the responsible cancelling party
 *      forfeits their 1 Koin (non-refundable matching service penalty).
 *    - The other innocent party is fully refunded their 1 Koin.
 * 
 * 5. Simulation-Only Top Up:
 *    All coin purchases are sandbox simulations through simulated QRIS payments.
 *    Coins are server-verified and never credited purely through client claims.
 * 
 * 6. Separation of Concerns:
 *    Coin balance is the digital platform token for campus matching.
 *    The negotiated cash/transfer ride fare (e.g., Rp 8.000) is settled directly
 *    between the students upon arrival.
 */

export const COIN_TO_RUPIAH_RATE = 500;
export const MATCHING_SERVICE_COIN_FEE = 1;

export function coinsToRupiah(coins: number): number {
  return coins * COIN_TO_RUPIAH_RATE;
}

export function rupiahToCoins(rupiah: number): number {
  return Math.floor(rupiah / COIN_TO_RUPIAH_RATE);
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatCoins(coins: number): string {
  return `${coins} Koin`;
}

export function canStartFlow(userCoins: number): { allowed: boolean; message?: string } {
  if (userCoins >= MATCHING_SERVICE_COIN_FEE) {
    return { allowed: true };
  }
  return {
    allowed: false,
    message: `Saldo AJUN Koin Anda (${userCoins} Koin) tidak mencukupi. Anda memerlukan minimal ${MATCHING_SERVICE_COIN_FEE} Koin (Rp 500) untuk memulai tebengan kampus.`,
  };
}
