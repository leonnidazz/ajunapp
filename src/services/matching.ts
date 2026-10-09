import { MatchingCandidate } from '../types';

/**
 * DETERMINISTIC PROTOTYPE MATCHING ALGORITHM (AJUN UNDIP)
 * 
 * Formula:
 * Total Compatibility Score = RouteScore (40%) + DistanceScore (25%) + TimeScore (20%) + FareScore (15%)
 * Max Score: 100 points
 * 
 * 1. Route/Destination Compatibility (Max 40 points):
 *    - Compares destination strings (case-insensitive & campus keyword matching).
 *    - Same faculty/zone (e.g. Pleburan, Tembalang, Simpang Lima, Undip Hayam Wuruk) = 35-40 pts
 *    - Adjacent campus corridor = 25-34 pts
 *    - Different general area = 15 pts
 * 
 * 2. Distance Compatibility (Max 25 points):
 *    - Under 400m radius: 25 pts (ideal pedestrian meetpoint)
 *    - 400m - 750m: 20 pts
 *    - 750m - 1200m: 15 pts
 *    - > 1200m: 10 pts
 * 
 * 3. Time Compatibility (Max 20 points):
 *    - Departure time within 5 minutes: 20 pts
 *    - Within 10 minutes: 16 pts
 *    - Within 20 minutes: 12 pts
 *    - > 20 minutes: 6 pts
 * 
 * 4. Fare Compatibility (Max 15 points):
 *    - Within requested range: 15 pts
 *    - Difference <= Rp 2.000: 11 pts
 *    - Difference > Rp 2.000: 6 pts
 * 
 * NOTE: This is a deterministic rule-based prototype heuristic, NOT an AI or black-box prediction.
 * Students always remain free to select any driver or passenger manually.
 */

export function calculateCompatibilityScore(
  userQuery: {
    origin: string;
    destination: string;
    departureTime: string;
    targetFare: number;
  },
  candidate: {
    origin: string;
    destination: string;
    departureTime: string;
    fare: number;
    distanceMeters: number;
  }
): { score: number; breakdown: { route: number; distance: number; time: number; fare: number } } {
  // 1. Route Score (0 - 40)
  let routeScore = 15;
  const qDest = userQuery.destination.toLowerCase();
  const cDest = candidate.destination.toLowerCase();
  const qOrig = userQuery.origin.toLowerCase();
  const cOrig = candidate.origin.toLowerCase();

  const campusKeywords = ['pleburan', 'tembalang', 'fsm', 'feb', 'hayam wuruk', 'simpang lima', 'teknik', 'poncol'];
  const destMatches = campusKeywords.filter(k => qDest.includes(k) && cDest.includes(k));
  const origMatches = campusKeywords.filter(k => qOrig.includes(k) && cOrig.includes(k));

  if (qDest === cDest && qOrig === cOrig) {
    routeScore = 40;
  } else if (destMatches.length > 0 && origMatches.length > 0) {
    routeScore = 38;
  } else if (destMatches.length > 0) {
    routeScore = 32;
  } else if (qDest.includes('pleburan') && cDest.includes('simpang lima')) {
    routeScore = 28;
  } else {
    routeScore = 15;
  }

  // 2. Distance Score (0 - 25)
  let distanceScore = 10;
  const dist = candidate.distanceMeters;
  if (dist <= 400) {
    distanceScore = 25;
  } else if (dist <= 750) {
    distanceScore = 20;
  } else if (dist <= 1200) {
    distanceScore = 15;
  } else {
    distanceScore = 10;
  }

  // 3. Time Compatibility (0 - 20)
  let timeScore = 8;
  const parseMinutes = (t: string) => {
    const match = t.match(/(\d{1,2}):(\d{2})/);
    if (!match) return 8 * 60 + 30;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };
  const diffMinutes = Math.abs(parseMinutes(userQuery.departureTime) - parseMinutes(candidate.departureTime));
  if (diffMinutes <= 5) {
    timeScore = 20;
  } else if (diffMinutes <= 10) {
    timeScore = 16;
  } else if (diffMinutes <= 20) {
    timeScore = 12;
  } else {
    timeScore = 6;
  }

  // 4. Fare Score (0 - 15)
  let fareScore = 6;
  const fareDiff = Math.abs(userQuery.targetFare - candidate.fare);
  if (fareDiff <= 500) {
    fareScore = 15;
  } else if (fareDiff <= 2000) {
    fareScore = 11;
  } else {
    fareScore = 6;
  }

  const total = Math.min(100, Math.max(0, routeScore + distanceScore + timeScore + fareScore));

  return {
    score: total,
    breakdown: {
      route: routeScore,
      distance: distanceScore,
      time: timeScore,
      fare: fareScore,
    },
  };
}
