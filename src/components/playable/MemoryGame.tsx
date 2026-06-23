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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export default function MemoryGame({ cards, pairs, title, attemptCount, onAttemptIncrement }: MemoryGameProps) {
  const [shuffledCards, setShuffledCards] = useState(() => shuffleArray(cards));
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [firstCard, setFirstCard] = useState<MemoryCard | null>(null);
  const [moves, setMoves] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const isComplete = matched.size === pairs.length;

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
      }, 1200);
    }
  }, [disabled, flipped, matched, firstCard]);

  const handleReset = useCallback(() => {
    setShuffledCards(shuffleArray(cards));
    setFlipped(new Set());
    setMatched(new Set());
    setFirstCard(null);
    setMoves(0);
    setDisabled(false);
    onAttemptIncrement?.();
  }, [cards, onAttemptIncrement]);

  return (
    <div className="space-y-4">
      {title && (
        <h1 className="text-xl font-bold text-gray-900 text-center">{title}</h1>
      )}

      <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          Movimientos: {moves}
        </span>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          Pares: {matched.size}/{pairs.length}
        </span>
        {attemptCount !== undefined && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Intento #{attemptCount}
          </span>
        )}
        <button
          onClick={handleReset}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>

      {isComplete && (
        <div className="text-center py-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-700">Felicidades!</p>
          <p className="text-sm text-green-600 mb-3">
            Encontraste todos los pares en {moves} movimientos
          </p>
          <button
            onClick={handleReset}
            className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            Jugar de nuevo
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {shuffledCards.map((card) => {
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
                  className="absolute inset-0 rounded-xl flex items-center justify-center border-2 border-indigo-300 bg-linear-to-br from-indigo-600 to-indigo-700 text-white shadow-sm"
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
    </div>
  );
}
