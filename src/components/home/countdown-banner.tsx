"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function CountdownBanner({
  title,
  subtitle,
  code,
  discountPercent,
  endsAt,
}: {
  title: string;
  subtitle: string | null;
  code: string;
  discountPercent: number;
  endsAt: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(new Date(endsAt).getTime() - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const ended = remaining !== null && remaining <= 0;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pb-16">
      <div className="rounded-[28px] bg-ink-black px-6 py-6 text-pure-white sm:px-8">
        <p className="text-[11px] text-pure-white/70">Limited drop</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[20px] tracking-[-0.05em]">{title}</h2>
            <p className="mt-1 text-body-lg text-pure-white/80">
              {subtitle ?? `${discountPercent}% off with code`} <span>{code}</span>
            </p>
          </div>
          <p className="text-body-lg">
            {remaining === null ? "Counting down…" : ended ? "This drop has ended" : formatRemaining(remaining)}
          </p>
        </div>
      </div>
    </section>
  );
}
