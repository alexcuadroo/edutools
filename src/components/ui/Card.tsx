import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-6 ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
