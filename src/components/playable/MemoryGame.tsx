import { useState, useCallback } from "react";
import { RotateCcw, Trophy, Layers } from "lucide-react";

interface MemoryCard {
  id: string;
  pairId: number;
  content: string;
  type: "word" | "definition";
}

interface MemoryGameProps {
  cards: MemoryCard[];
  pairs: { word: string; definition: string }[];
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

export default function MemoryGame({ cards, pairs, onAttemptIncrement }: MemoryGameProps) {
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [firstCard, setFirstCard] = useState<MemoryCard | null>(null);
  const [moves, setMoves] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [celebration, setCelebration] = useState(false);

  const handleCardClick = useCallback((card: MemoryCard) => {
    if (disabled) return;
    if (flipped.has(card.id) || matched.has(card.pairId)) return;

    const newFlipped = new Set(flipped);
    newFlipped.add(card.id);
    setFlipped(newFlipped);

    if (!firstCard) {
      setFirstCard(card);
      return;
    }

    setMoves((m) => m + 1);

    if (firstCard.pairId === card.pairId && firstCard.id !== card.id) {
      const newMatched = new Set(matched);
      newMatched.add(card.pairId);
      setMatched(newMatched);
      setFirstCard(null);

      if (newMatched.size === pairs.length) {
        setTimeout(() => setCelebration(true), 500);
      }
    } else {
      setDisabled(true);
      const firstId = firstCard.id;
      const secondId = card.id;
      setTimeout(() => {
        setFlipped((prev) => {
          const next = new Set(prev);
          next.delete(firstId);
          next.delete(secondId);
          return next;
        });
        setFirstCard(null);
        setDisabled(false);
      }, 800);
    }
  }, [disabled, flipped, matched, firstCard, pairs.length]);

  const handleReset = useCallback(() => {
    setFlipped(new Set());
    setMatched(new Set());
    setFirstCard(null);
    setMoves(0);
    setDisabled(false);
    setCelebration(false);
    onAttemptIncrement?.();
  }, [onAttemptIncrement]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
          Movimientos: {moves}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
          Pares: {matched.size}/{pairs.length}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isFlipped = flipped.has(card.id) || matched.has(card.pairId);
          const isMatched = matched.has(card.pairId);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={disabled || isMatched}
              className="aspect-square cursor-pointer disabled:cursor-default"
              style={{ perspective: "600px" }}
            >
              <div
                className="relative w-full h-full"
                style={{
                  transformStyle: "preserve-3d",
                  transition: "transform 0.5s",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center border-2 border-indigo-300 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <Layers className="w-6 h-6 opacity-30" />
                </div>

                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 p-2 text-center text-xs sm:text-sm font-medium shadow-sm ${
                    isMatched
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : card.type === "word"
                      ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                      : "border-gray-300 bg-gray-50 text-gray-800"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {card.content}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {celebration && (
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-medium">
            <Trophy className="w-5 h-5" />
            Felicidades!
          </div>
          <p className="text-sm text-gray-600">
            Encontraste todos los pares en {moves} movimientos
          </p>
          <button
            onClick={handleReset}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
          >
            Jugar de nuevo
          </button>
        </div>
      )}

      {!celebration && (
        <div className="text-center">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}
