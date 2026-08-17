import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 text-foreground shadow-[var(--shadow-card)] ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
