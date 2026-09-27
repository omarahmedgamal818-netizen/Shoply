export function Stars({ rating }: { rating: number }) {
  const full = Math.round(Number(rating) || 0);
  return (
    <span className="text-[9px] tracking-[-0.058em] text-ink-black" aria-label={`${rating} out of 5`}>
      {"★★★★★".slice(0, full)}
      <span className="text-cool-stone">{"★★★★★".slice(full)}</span>
    </span>
  );
}
