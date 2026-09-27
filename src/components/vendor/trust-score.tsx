export function TrustScore({ score, notes }: { score: number; notes: string | null }) {
  return (
    <div className="rounded-[28px] bg-pure-white p-5 shadow-sm-2">
      <p className="text-[11px] text-muted-gray">AI trust score</p>
      <p className="mt-2 font-display text-headline text-ink">{score}</p>
      <p className="text-body-sm text-muted-gray">out of 100</p>
      {notes ? <p className="mt-3 text-body-sm">{notes}</p> : null}
    </div>
  );
}
