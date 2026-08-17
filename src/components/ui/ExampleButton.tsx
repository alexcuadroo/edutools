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
      type="button"
      onClick={onClick}
      className="group inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-transparent bg-primary-subtle px-3 text-xs font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary hover:text-primary-foreground"
    >
      {icon ?? (
        <Lightbulb className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
