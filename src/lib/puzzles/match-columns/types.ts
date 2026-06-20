export interface MCMatch {
  word: string;
  definition: string;
}

export interface MCResult {
  matches: MCMatch[];
  shuffledDefinitions: string[];
}
