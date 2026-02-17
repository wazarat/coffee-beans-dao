"use client";

interface MoqProgressProps {
  totalBidKg: number;
  moqKg: number;
  targetQuantityKg: number;
}

export function MoqProgress({
  totalBidKg,
  moqKg,
  targetQuantityKg,
}: MoqProgressProps) {
  const moqPct = Math.min((totalBidKg / moqKg) * 100, 100);
  const targetPct = Math.min(
    (totalBidKg / targetQuantityKg) * 100,
    100
  );
  const moqMet = totalBidKg >= moqKg;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-stone-400">Total Bids</span>
        <span className="font-medium text-stone-100">
          {totalBidKg.toLocaleString()} kg
        </span>
      </div>

      {/* MOQ bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className={moqMet ? "text-emerald-400" : "text-amber-400"}>
            {moqMet ? "MOQ Met!" : `${moqPct.toFixed(0)}% to MOQ`}
          </span>
          <span className="text-stone-500">
            MOQ: {moqKg.toLocaleString()} kg
          </span>
        </div>
        <div className="relative w-full h-3 rounded-full bg-stone-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              moqMet ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${moqPct}%` }}
          />
          {/* MOQ marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-stone-400"
            style={{
              left: `${Math.min((moqKg / targetQuantityKg) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Target bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-stone-400">
            {targetPct.toFixed(0)}% to target
          </span>
          <span className="text-stone-500">
            Target: {targetQuantityKg.toLocaleString()} kg
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-stone-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-stone-500 transition-all duration-500"
            style={{ width: `${targetPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
