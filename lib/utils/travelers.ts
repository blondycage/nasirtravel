export type TravelerType = 'adult' | 'child' | 'infant';

export interface TravelerBreakdown {
  adultTravelers: number;
  childTravelers: number;
  infantTravelers: number;
}

export interface TravelerPrices {
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
}

export const emptyTravelerBreakdown: TravelerBreakdown = {
  adultTravelers: 0,
  childTravelers: 0,
  infantTravelers: 0,
};

export function normalizeCount(value: unknown, fallback = 0) {
  const count = Number(value);
  if (!Number.isFinite(count)) return fallback;
  return Math.max(0, Math.floor(count));
}

export function getTravelerBreakdown(source: any): TravelerBreakdown {
  const total = normalizeCount(source?.numberOfTravelers, 1);
  const adultTravelers = normalizeCount(source?.adultTravelers, total || 1);
  const childTravelers = normalizeCount(source?.childTravelers, 0);
  const infantTravelers = normalizeCount(source?.infantTravelers, 0);

  if (
    source?.adultTravelers === undefined &&
    source?.childTravelers === undefined &&
    source?.infantTravelers === undefined
  ) {
    return {
      adultTravelers: total || 1,
      childTravelers: 0,
      infantTravelers: 0,
    };
  }

  return {
    adultTravelers,
    childTravelers,
    infantTravelers,
  };
}

export function getTravelerTotal(breakdown: TravelerBreakdown) {
  return breakdown.adultTravelers + breakdown.childTravelers + breakdown.infantTravelers;
}

export function calculateTravelerAge(dateOfBirth: string | Date, referenceDate = new Date()) {
  const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  const dayDiff = referenceDate.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function getTravelerTypeFromDateOfBirth(dateOfBirth?: string | Date): TravelerType | null {
  if (!dateOfBirth) return null;

  const age = calculateTravelerAge(dateOfBirth);
  if (age === null || age < 0) return null;

  if (age < 2) return 'infant';
  if (age < 12) return 'child';
  return 'adult';
}

export function normalizeTravelerType(value: unknown): TravelerType | null {
  return value === 'adult' || value === 'child' || value === 'infant' ? value : null;
}

export function getTravelerLabel(type: TravelerType) {
  if (type === 'adult') return 'Adult (12+)';
  if (type === 'child') return 'Child (2-11)';
  return 'Infant (0-2)';
}

export function getDependantSlotUsage(dependants: Array<{ travelerType?: TravelerType | null }>) {
  return dependants.reduce(
    (usage, dependant) => {
      if (dependant.travelerType === 'child') usage.childTravelers += 1;
      else if (dependant.travelerType === 'infant') usage.infantTravelers += 1;
      else usage.adultTravelers += 1;
      return usage;
    },
    { ...emptyTravelerBreakdown }
  );
}

export function getRemainingDependantSlots(
  breakdown: TravelerBreakdown,
  dependants: Array<{ travelerType?: TravelerType | null }>
) {
  const usage = getDependantSlotUsage(dependants);

  return {
    adultTravelers: Math.max(0, breakdown.adultTravelers - 1 - usage.adultTravelers),
    childTravelers: Math.max(0, breakdown.childTravelers - usage.childTravelers),
    infantTravelers: Math.max(0, breakdown.infantTravelers - usage.infantTravelers),
  };
}

export function calculateQuoteTotal(breakdown: TravelerBreakdown, prices: TravelerPrices) {
  const adultTotal = breakdown.adultTravelers * prices.adultPrice;
  const childTotal = breakdown.childTravelers * prices.childPrice;
  const infantTotal = breakdown.infantTravelers * prices.infantPrice;

  return {
    adultTotal: Number(adultTotal.toFixed(2)),
    childTotal: Number(childTotal.toFixed(2)),
    infantTotal: Number(infantTotal.toFixed(2)),
    total: Number((adultTotal + childTotal + infantTotal).toFixed(2)),
  };
}
