import { useState, useCallback, useEffect, useRef } from "react";
import type { ButtonHTMLAttributes, ReactNode, MouseEvent } from "react";

type Variant = "primary" | "ghost" | "link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const base =
  "cursor-pointer inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-200";

const variants: Record<Variant, string> = {
  primary:
    "btn-primary px-6 py-2.5",
  ghost: "btn-ghost px-3 py-1.5 text-indigo-600 hover:text-indigo-800 underline",
  link: "btn-link text-xs text-indigo-600 hover:text-indigo-800 underline px-0 py-0",
};

export default function Button({
  variant = "primary",
  className = "",
  iconLeft,
  iconRight,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    if (variant !== "primary") {
      onClick?.(e);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    const timer = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
      timersRef.current.delete(id);
    }, 600);
    timersRef.current.set(id, timer);

    onClick?.(e);
  }, [variant, onClick]);

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
