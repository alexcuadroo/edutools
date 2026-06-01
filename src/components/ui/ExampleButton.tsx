import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";

interface ExampleButtonProps {
  onClick: () => void;
  label?: string;
  icon?: ReactNode;
}

export default function ExampleButton({
  onClick,
  label = "Cargar ejemplo",
  icon,
}: ExampleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 transition-all cursor-pointer"
    >
      {icon ?? (
        <Lightbulb className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
      )}
      {label}
    </button>
  );
}
