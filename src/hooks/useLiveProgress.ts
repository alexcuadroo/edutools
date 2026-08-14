import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProgressPuzzleType, ProgressSnapshot } from "@/lib/progress/types";

const ADJECTIVES = ["Ágil", "Brillante", "Curioso", "Valiente", "Veloz"];
const ANIMALS = ["Zorro", "León", "Nutria", "Búho", "Tigre"];

function randomAlias() {
  const pick = (items: string[]) => items[crypto.getRandomValues(new Uint32Array(1))[0]! % items.length]!;
  return `${pick(ANIMALS)} ${pick(ADJECTIVES)}`;
}

export function useLiveProgress(id: string | undefined, type: ProgressPuzzleType, snapshot: ProgressSnapshot) {
  const storageKey = useMemo(() => `edutools-progress:${id}`, [id]);
  const [identity, setIdentity] = useState<{ participantId: string; alias: string } | null>(() => {
    if (!id) return null;
    const saved = sessionStorage.getItem(`edutools-progress:${id}`);
    return saved ? JSON.parse(saved) as { participantId: string; alias: string } : { participantId: crypto.randomUUID(), alias: randomAlias() };
  });
  const [confirmed, setConfirmed] = useState(false);

  const report = useCallback(async () => {
    if (!id || !identity || !confirmed) return;
    await fetch(`/api/progress/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...identity, type, ...snapshot }) }).catch(() => undefined);
  }, [confirmed, id, identity, snapshot, type]);

  useEffect(() => { void report(); }, [report]);
  useEffect(() => {
    const timer = window.setInterval(() => void report(), 10_000);
    return () => window.clearInterval(timer);
  }, [report]);

  const confirm = (alias: string) => {
    if (!identity) return;
    const next = { ...identity, alias: alias.trim().slice(0, 40) || identity.alias };
    sessionStorage.setItem(storageKey, JSON.stringify(next));
    setIdentity(next);
    setConfirmed(true);
  };
  return { alias: identity?.alias ?? "", confirmed, confirm };
}
