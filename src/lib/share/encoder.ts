import { gzipSync, gunzipSync, strToU8, strFromU8 } from "fflate";

function uint8ToBase64Url(uint8: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodePuzzleData(data: object): string {
  const json = JSON.stringify(data);
  const compressed = gzipSync(strToU8(json));
  return uint8ToBase64Url(compressed);
}

export function decodePuzzleData<T>(encoded: string): T {
  const bytes = base64UrlToUint8(encoded);
  const json = strFromU8(gunzipSync(bytes));
  return JSON.parse(json) as T;
}

export function buildPlayUrl(puzzleType: string, encoded: string): string {
  return `${window.location.origin}/jugar/${puzzleType}#${encoded}`;
}
