import { cn } from "@/lib/utils";

const field =
  "rounded-full border border-faint-border bg-pure-white px-5 text-body-lg font-normal tracking-[-0.031em] text-ink-black outline-none placeholder:text-muted-gray focus:border-ink-black/30";

export function Input({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-body-sm text-ink-black">
      {label}
      <input className={cn("h-11", field, className)} {...props} />
    </label>
  );
}

export function TextArea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-body-sm text-ink-black">
      {label}
      <textarea className={cn("min-h-28 rounded-[20px] py-3", field, className)} {...props} />
    </label>
  );
}

export function Select({
  label,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-body-sm text-ink-black">
      {label}
      <select className={cn("h-11", field, className)} {...props}>
        {children}
      </select>
    </label>
  );
}
