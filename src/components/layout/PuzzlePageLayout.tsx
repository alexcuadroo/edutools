import type { ReactNode } from "react";
import PageHeader from "../ui/PageHeader";
import { usePuzzleStore } from "../../store/puzzle-store";

interface PuzzlePageLayoutProps {
  title: string;
  description: string;
  input: ReactNode;
  preview: ReactNode;
}

export default function PuzzlePageLayout({
  title,
  description,
  input,
  preview,
}: PuzzlePageLayoutProps) {
  const { loading } = usePuzzleStore();

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      {input}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-gray-400 text-sm mt-2">Generando...</p>
        </div>
      )}

      {preview}
    </div>
  );
}
