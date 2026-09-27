export function PayoutsChart({ vendorId }: { vendorId: string }) {
  const bars = Array.from({ length: 8 }, (_, index) => {
    const seed = vendorId.charCodeAt(index % vendorId.length) + index * 17;
    return 24 + (seed % 72);
  });

  return (
    <div className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
      <p className="text-[11px] text-muted-gray">Payouts</p>
      <p className="mt-1 text-body-sm text-muted-gray">Simulated 8-week view until live transfers start.</p>
      <div className="mt-4 flex h-28 items-end gap-2">
        {bars.map((height, index) => (
          <div key={index} className="flex-1 rounded-full bg-ink-black" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}
