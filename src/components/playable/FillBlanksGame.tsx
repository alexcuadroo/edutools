import { useState, useCallback, useMemo } from "react";
import { RotateCcw, CheckCircle } from "lucide-react";

interface FillBlanksGameProps {
  text: string;
  blanks: { tokenIndex: number; word: string }[];
  options: string[];
  title?: string;
  attemptCount?: number;
  onAttemptIncrement?: () => void;
}

interface Token {
  type: "word" | "space" | "punctuation";
  value: string;
  index: number;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\s+)|([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)|([^\sa-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)/g;
  let match;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      tokens.push({ type: "space", value: match[1], index: index++ });
    } else if (match[2]) {
      tokens.push({ type: "word", value: match[2], index: index++ });
    } else if (match[3]) {
      tokens.push({ type: "punctuation", value: match[3], index: index++ });
    }
  }

  return tokens;
}

export default function FillBlanksGame({ text, blanks, options, title, attemptCount, onAttemptIncrement }: FillBlanksGameProps) {
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<Record<number, "correct" | "incorrect">>({});
  const [celebration, setCelebration] = useState(false);

  const tokens = useMemo(() => tokenize(text), [text]);
  const blankIndices = useMemo(() => {
    const map = new Map<number, number>();
    blanks.forEach((b, i) => map.set(b.tokenIndex, i));
    return map;
  }, [blanks]);

  const handleSelect = useCallback((blankIndex: number, option: string) => {
    setSelections((prev) => ({ ...prev, [blankIndex]: option }));
    if (checked) {
      setChecked(false);
      setStatus({});
    }
  }, [checked]);

  const handleCheck = useCallback(() => {
    const newStatus: Record<number, "correct" | "incorrect"> = {};
    let allCorrect = true;

    for (let i = 0; i < blanks.length; i++) {
      const selected = selections[i];
      if (!selected) {
        allCorrect = false;
        continue;
      }
      if (selected === blanks[i].word) {
        newStatus[i] = "correct";
      } else {
        newStatus[i] = "incorrect";
        allCorrect = false;
      }
    }

    setStatus(newStatus);
    setChecked(true);

    if (allCorrect && Object.keys(selections).length === blanks.length) {
      setCelebration(true);
    }
  }, [blanks, selections]);

  const handleReset = useCallback(() => {
    setSelections({});
    setChecked(false);
    setStatus({});
    setCelebration(false);
    onAttemptIncrement?.();
  }, [onAttemptIncrement]);

  const renderText = () => {
    return tokens.map((token) => {
      const blankIndex = blankIndices.get(token.index);
      const isBlank = blankIndex !== undefined;

      if (token.type === "space") {
        return <span key={token.index}>{token.value}</span>;
      }

      if (token.type === "punctuation") {
        return <span key={token.index}>{token.value}</span>;
      }

      if (isBlank) {
        const selected = selections[blankIndex];
        const stat = status[blankIndex];

        let bgColor = "bg-white";
        let borderColor = "border-gray-300";
        if (checked) {
          if (stat === "correct") {
            bgColor = "bg-green-100";
            borderColor = "border-green-500";
          } else if (stat === "incorrect") {
            bgColor = "bg-red-100";
            borderColor = "border-red-500";
          }
        }

        return (
          <select
            key={token.index}
            value={selected || ""}
            onChange={(e) => handleSelect(blankIndex, e.target.value)}
            className={`inline-block mx-1 px-2 py-1 border-2 rounded-lg text-sm font-medium ${bgColor} ${borderColor} cursor-pointer`}
          >
            <option value="">---</option>
            {options.map((opt, optIdx) => (
              <option key={optIdx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      }

      return <span key={token.index}>{token.value}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {title && (
        <h1 className="text-xl font-bold text-gray-900 text-center">{title}</h1>
      )}

      {celebration && (
        <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-700">Excelente!</p>
          <p className="text-sm text-green-600">Completaste todos los huecos correctamente</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
        {attemptCount !== undefined && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Intento #{attemptCount}
          </span>
        )}
        <button
          onClick={handleCheck}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Comprobar
        </button>
        <button
          onClick={handleReset}
          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-lg leading-relaxed">
        {renderText()}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Opciones disponibles</h3>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {Object.keys(selections).length}/{blanks.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((opt, idx) => {
            const usedCount = Object.values(selections).filter((s) => s === opt).length;
            const isDisabled = usedCount > 0;
            return (
              <span
                key={idx}
                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  isDisabled
                    ? "bg-gray-200 text-gray-400 line-through"
                    : "bg-indigo-50 text-indigo-700"
                }`}
              >
                {opt}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
