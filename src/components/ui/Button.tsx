import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const base =
  "cursor-pointer inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors";

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white px-6 py-2 hover:bg-indigo-700 border border-indigo-600",
  ghost: "px-3 py-1.5 text-indigo-600 hover:text-indigo-800 underline",
  link: "text-xs text-indigo-600 hover:text-indigo-800 underline px-0 py-0",
};

export default function Button({
  variant = "primary",
  className = "",
  iconLeft,
  iconRight,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
