export interface MemoryCard {
  id: string;
  pairId: number;
  content: string;
  type: "word" | "definition";
}

export interface MemoryResult {
  cards: MemoryCard[];
  pairs: { word: string; definition: string }[];
  pairCount: number;
}
