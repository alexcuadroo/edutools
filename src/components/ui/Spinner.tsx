import { Loader2 } from "lucide-react";

interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label }: SpinnerProps) {
  return (
    <div role="status" className="text-center py-8">
      <Loader2 className="inline-block animate-spin h-6 w-6 text-indigo-600" />
      {label && <p className="text-gray-400 text-sm mt-2">{label}</p>}
    </div>
  );
}
