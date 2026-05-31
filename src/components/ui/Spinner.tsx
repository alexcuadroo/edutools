interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label }: SpinnerProps) {
  return (
    <div role="status" className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600" />
      {label && <p className="text-gray-400 text-sm mt-2">{label}</p>}
    </div>
  );
}
