import { CircleHelp } from "lucide-react";
import PuzzlePageLayout from "@/components/layout/PuzzlePageLayout";
import RoscoInput from "@/components/puzzles/Rosco/RoscoInput";
import RoscoPreview from "@/components/puzzles/Rosco/RoscoPreview";

export default function RoscoPage() {
  return <PuzzlePageLayout title="Rosco" description="Creá un rosco digital de 26 preguntas para jugar y compartir online." icon={<CircleHelp className="h-5 w-5 text-indigo-600" />} input={<RoscoInput />} preview={<RoscoPreview />} />;
}
