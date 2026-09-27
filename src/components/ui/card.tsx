import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("overflow-hidden rounded-[28px] bg-pure-white shadow-sm-2", className)}>{children}</div>;
}

export function Overline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-[11px] text-muted-gray", className)}>{children}</p>;
}
