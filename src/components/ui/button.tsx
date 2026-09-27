import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-shop-violet text-pure-white shadow-lg-2 hover:bg-primary-hover",
  secondary: "border border-faint-border bg-pure-white text-ink-black shadow-sm",
  ghost: "bg-transparent text-muted-gray hover:bg-pure-white",
  destructive: "bg-ink-black text-pure-white",
};

const sizes = {
  sm: "h-[34px] px-4 text-body-sm",
  md: "h-11 px-6 text-body-lg",
  lg: "h-12 px-8 text-body-lg",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-normal tracking-[-0.031em] transition disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

type LinkProps = React.ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function ButtonLink({ className, variant = "primary", size = "md", ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center rounded-full font-normal tracking-[-0.031em] transition",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
