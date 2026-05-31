import type { ReactNode } from "react";
import PageHeader from "../ui/PageHeader";
import Spinner from "../ui/Spinner";
import { usePuzzleStore } from "../../store/puzzle-store";

interface PuzzlePageLayoutProps {
  title: string;
  description: string;
  icon?: ReactNode;
  input: ReactNode;
  preview: ReactNode;
}

export default function PuzzlePageLayout({
  title,
  description,
  icon,
  input,
  preview,
}: PuzzlePageLayoutProps) {
  const { loading } = usePuzzleStore();

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} icon={icon} />

      {input}

      {loading && <Spinner label="Generando..." />}

      {preview}
    </div>
  );
}
