import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import SavePuzzleButton from "@/components/auth/SavePuzzleButton";
import RoscoGame from "@/components/playable/RoscoGame";
import Card from "@/components/ui/Card";
import ShareModal from "@/components/ui/ShareModal";
import { roscoResultToPlayData } from "@/lib/share/types";
import { buildPlayUrl, savePuzzle } from "@/lib/share/api";
import { usePuzzleStore } from "@/store/puzzle-store";
import { toast } from "react-toastify";

export default function RoscoPreview() {
  const { roscoResult, roscoTitle } = usePuzzleStore();
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  if (!roscoResult) return null;
  const data = roscoResultToPlayData(roscoResult, roscoTitle);
  const share = async () => {
    setSharing(true);
    try {
      const id = await savePuzzle({ type: "rosco", puzzle: data });
      setShareUrl(buildPlayUrl("rosco", id));
    } catch { toast.error("No se pudo generar el link para compartir"); } finally { setSharing(false); }
  };
  return <div className="space-y-6"><Card><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-gray-900">Juego interactivo</h2><div className="flex gap-3"><SavePuzzleButton type="rosco" title={roscoTitle || "Rosco"} data={data} /><button type="button" onClick={share} disabled={sharing} className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">{sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} {sharing ? "Generando..." : "Compartir"}</button></div></div><RoscoGame key={`${roscoTitle}-${roscoResult.durationSeconds}`} entries={roscoResult.entries} durationSeconds={roscoResult.durationSeconds} title={roscoTitle} /></Card>{shareUrl && <ShareModal url={shareUrl} title={roscoTitle || "Rosco"} onClose={() => setShareUrl("")} />}</div>;
}
