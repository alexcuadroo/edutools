import { UserRound } from "lucide-react";

interface StudentAliasBadgeProps {
  alias: string;
}

export function StudentAliasBadge({ alias }: StudentAliasBadgeProps) {
  return (
    <p className="inline-flex max-w-full items-center gap-1.5 text-xs text-gray-500" aria-label={`Jugás como ${alias}`}>
      <UserRound className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
      <span>Jugás como</span>
      <span className="truncate font-medium text-gray-600">{alias}</span>
    </p>
  );
}
