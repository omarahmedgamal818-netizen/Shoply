export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
      <p className="text-[11px] text-muted-gray">{label}</p>
      <p className="mt-2 text-[20px] tracking-[-0.05em] text-ink-black">{value}</p>
      {hint ? <p className="mt-1 text-body-sm text-muted-gray">{hint}</p> : null}
    </div>
  );
}
