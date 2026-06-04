import { useState } from "react";
import Card from "../../ui/Card";
import DownloadDropdown from "../../ui/DownloadDropdown";
import ShareModal from "../../ui/ShareModal";
import { usePuzzleStore } from "../../../store/puzzle-store";
import { fillBlanksGenerator } from "../../../lib/puzzles/fill-blanks/generator";
import { generateFillBlanksPDF } from "../../../lib/pdf/fill-blanks";
import { encodePuzzleData, buildPlayUrl } from "../../../lib/share/encoder";
import { fillBlanksResultToPlayData } from "../../../lib/share/types";
import { Eye, Share2 } from "lucide-react";

export default function FillBlanksPreview() {
  const { fillBlanksResult, setFillBlanksResult, fillBlanksTitle } = usePuzzleStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  if (!fillBlanksResult) return null;

  const handleShare = () => {
    const data = fillBlanksResultToPlayData(fillBlanksResult, fillBlanksTitle);
    const encoded = encodePuzzleData(data);
    const url = buildPlayUrl("rellenar-huecos", encoded);
    setShareUrl(url);
    setShareOpen(true);
  };

  const handleToggleBlank = (tokenIndex: number) => {
    const updated = fillBlanksGenerator.toggleBlank(fillBlanksResult, tokenIndex);
    setFillBlanksResult(updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Previsualización</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Haz clic en una palabra para añadir o quitar un hueco
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              <span className="font-medium text-indigo-600">{fillBlanksResult.blanks.length}</span> huecos
            </span>
            <button
              onClick={handleShare}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors border border-emerald-600"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
            <DownloadDropdown
              groups={[
                {
                  label: "PDF",
                  options: [
                    {
                      label: "Ver en navegador",
                      icon: Eye,
                      onClick: () => generateFillBlanksPDF(fillBlanksResult, "students", fillBlanksTitle, "preview"),
                    },
                    {
                      label: "Descargar con huecos",
                      onClick: () => generateFillBlanksPDF(fillBlanksResult, "students", fillBlanksTitle, "download"),
                    },
                    {
                      label: "Descargar con solución",
                      onClick: () => generateFillBlanksPDF(fillBlanksResult, "solution", fillBlanksTitle, "download"),
                    },
                  ],
                },
              ]}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 leading-relaxed">
          {fillBlanksResult.tokens.map((token) => {
            const isBlank = fillBlanksResult.blanks.some(
              (b) => b.tokenIndex === token.index
            );

            if (token.type === "space") {
              return <span key={token.index}>{token.value}</span>;
            }

            if (token.type === "punctuation") {
              return (
                <span key={token.index} className="text-gray-700">
                  {token.value}
                </span>
              );
            }

            const isClickable = token.value.length >= 3 && token.value.length <= 12;

            if (isBlank) {
              return (
                <button
                  key={token.index}
                  onClick={() => handleToggleBlank(token.index)}
                  className="inline-block min-w-[3rem] px-2 py-0.5 mx-0.5 bg-indigo-100 border-2 border-dashed border-indigo-400 rounded text-indigo-600 font-medium cursor-pointer hover:bg-indigo-200 transition-colors"
                >
                  _____
                </button>
              );
            }

            return (
              <span
                key={token.index}
                onClick={() => isClickable && handleToggleBlank(token.index)}
                className={`${
                  isClickable
                    ? "cursor-pointer hover:bg-yellow-100 hover:underline rounded px-0.5 transition-colors"
                    : ""
                }`}
              >
                {token.value}
              </span>
            );
          })}
        </div>
      </Card>

      {fillBlanksResult.blanks.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Respuestas</h2>
          <p className="text-xs text-gray-500 mb-3">
            Palabras correctas mezcladas con distractores
          </p>
          <div className="flex flex-wrap gap-2">
            {fillBlanksResult.options.map((option, i) => {
              const isCorrect = fillBlanksResult.blanks.some(
                (b) => b.word.toLowerCase() === option.toLowerCase()
              );
              return (
                <span
                  key={i}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    isCorrect
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {option}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Verde = respuesta correcta | Gris = distractor
          </p>
        </Card>
      )}

      {shareOpen && shareUrl && (
        <ShareModal
          url={shareUrl}
          title={fillBlanksTitle || "Rellenar Huecos"}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
