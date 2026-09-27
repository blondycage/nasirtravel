import { getTourOccupancy } from '@/lib/utils/tourInventory';

export default function PackageOccupancy({
  totalSeats,
  remainingSeats,
  compact = false,
}: {
  totalSeats?: number | null;
  remainingSeats?: number | null;
  compact?: boolean;
}) {
  const occupancy = getTourOccupancy({ totalSeats, remainingSeats });
  if (!occupancy) return null;

  const barClass = occupancy.tone === 'red' ? 'bg-red-500' : occupancy.tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500';
  const textClass = occupancy.tone === 'red' ? 'text-red-700' : occupancy.tone === 'amber' ? 'text-amber-700' : 'text-emerald-700';

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span className={textClass}>{occupancy.soldOut ? 'Sold out - 100% booked' : `${occupancy.percentage}% booked`}</span>
        {!compact && <span className="text-gray-500">{occupancy.remainingSeats} of {occupancy.totalSeats} seats left</span>}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label="Package seats booked" aria-valuemin={0} aria-valuemax={100} aria-valuenow={occupancy.percentage}>
        <div className={`h-full ${barClass}`} style={{ width: `${occupancy.percentage}%` }} />
      </div>
    </div>
  );
}
