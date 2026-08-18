import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import SavePuzzleButton from "@/components/auth/SavePuzzleButton";
import WordleGame from "@/components/playable/WordleGame";
import Card from "@/components/ui/Card";
import ShareModal from "@/components/ui/ShareModal";
import { buildPlayUrl, savePuzzle } from "@/lib/share/api";
import { wordleResultToPlayData } from "@/lib/share/types";
import { usePuzzleStore } from "@/store/puzzle-store";
import { toast } from "react-toastify";

export default function WordlePreview() {
  const { wordleResult, wordleTitle } = usePuzzleStore(); const [sharing, setSharing] = useState(false); const [shareUrl, setShareUrl] = useState("");
  if (!wordleResult) return null; const data = wordleResultToPlayData(wordleResult, wordleTitle);
  const share = async () => { setSharing(true); try { const id = await savePuzzle({ type: "wordle", puzzle: data }); setShareUrl(buildPlayUrl("cadenas-de-palabras", id)); } catch { toast.error("No se pudo generar el link para compartir"); } finally { setSharing(false); } };
  return <div className="space-y-6"><Card><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-gray-900">Juego interactivo</h2><div className="flex gap-3"><SavePuzzleButton type="wordle" title={wordleTitle || "Cadenas de Palabras"} data={data} /><button type="button" onClick={share} disabled={sharing} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">{sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} {sharing ? "Generando..." : "Compartir"}</button></div></div><WordleGame key={`${wordleTitle}-${wordleResult.words.map((entry) => entry.word).join("-")}`} words={wordleResult.words} title={wordleTitle} /></Card>{shareUrl && <ShareModal url={shareUrl} title={wordleTitle || "Cadenas de Palabras"} onClose={() => setShareUrl("")} />}</div>;
}
