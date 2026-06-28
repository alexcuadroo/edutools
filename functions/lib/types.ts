export interface UserRecord {
  id: string;
  email: string;
  displayName: string | null;
  passwordHash: string;
  verified: boolean;
  verifiedAt?: number;
  createdAt: number;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface SessionRecord {
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface VerifyTokenRecord {
  userId: string;
  expiresAt: number;
}

export interface ResetTokenRecord {
  userId: string;
  expiresAt: number;
}

export interface SavedPuzzleRecord {
  id: string;
  type: string;
  title: string;
  data: unknown;
  createdAt: number;
  shareIds: string[];
}

export interface SavedPuzzleMeta {
  id: string;
  type: string;
  title: string;
  createdAt: number;
  shareCount: number;
}

export type SavedPuzzleFull = SavedPuzzleMeta & { data: unknown };
