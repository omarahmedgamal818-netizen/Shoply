import { cn } from "@/lib/utils";

const tones = {
  success: "bg-ink-black text-pure-white",
  warning: "bg-pure-white text-ink-black border border-faint-border",
  error: "bg-pure-white text-ink-black border border-ink-black",
  info: "bg-canvas-mist text-ink-black",
  neutral: "bg-pure-white text-ink-black border border-faint-border shadow-sm",
};

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex h-[34px] items-center rounded-full px-3.5 text-body-sm", tones[tone], className)}>
      {children}
    </span>
  );
}
