export type TourInventoryInput = {
  totalSeats?: number | string | null;
  remainingSeats?: number | string | null;
};

export const normalizeTourInventoryInput = (input: TourInventoryInput) => {
  const hasTotalSeats = Object.prototype.hasOwnProperty.call(input, 'totalSeats');
  const hasRemainingSeats = Object.prototype.hasOwnProperty.call(input, 'remainingSeats');
  if (!hasTotalSeats && !hasRemainingSeats) return { value: {} };

  const totalBlank = input.totalSeats === '' || input.totalSeats == null;
  const remainingBlank = input.remainingSeats === '' || input.remainingSeats == null;

  if (totalBlank && remainingBlank) {
    return { value: { totalSeats: null, remainingSeats: null, inventoryUpdatedAt: null } };
  }
  if (totalBlank || remainingBlank) {
    return { error: 'Total seats and remaining seats must be provided together.' };
  }

  const totalSeats = Number(input.totalSeats);
  const remainingSeats = Number(input.remainingSeats);
  if (!Number.isInteger(totalSeats) || totalSeats <= 0) {
    return { error: 'Total seats must be a whole number greater than zero.' };
  }
  if (!Number.isInteger(remainingSeats) || remainingSeats < 0 || remainingSeats > totalSeats) {
    return { error: 'Remaining seats must be a whole number between zero and total seats.' };
  }

  return { value: { totalSeats, remainingSeats, inventoryUpdatedAt: new Date() } };
};

export const getTourOccupancy = (input: TourInventoryInput) => {
  const totalSeats = Number(input.totalSeats);
  const remainingSeats = Number(input.remainingSeats);
  if (!Number.isFinite(totalSeats) || totalSeats <= 0 || !Number.isFinite(remainingSeats)) return null;

  const safeRemaining = Math.min(totalSeats, Math.max(0, remainingSeats));
  const percentage = Math.min(100, Math.max(0, Math.round(((totalSeats - safeRemaining) / totalSeats) * 100)));
  const tone = percentage >= 80 ? 'red' : percentage >= 50 ? 'amber' : 'green';
  return { totalSeats, remainingSeats: safeRemaining, percentage, tone, soldOut: safeRemaining === 0 };
};
