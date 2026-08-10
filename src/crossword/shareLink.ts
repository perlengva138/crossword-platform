import type {
    StoredPuzzle
} from "./types";

// matches the route in App.tsx: <Route path="/play" element={<Player/>} />
export const PLAYER_ROUTE = "/play";

// a conservative, widely-safe upper bound for URL length
export const MAX_SAFE_URL_LENGTH = 2000;


async function compressToBase64(data:string):Promise<string> {
    const stream =
        new Blob([data])
        .stream()
        .pipeThrough(new CompressionStream("gzip"));
    const compressedBlob =
        await new Response(stream).blob();
    const buffer =
        await compressedBlob.arrayBuffer();
    const bytes =
        new Uint8Array(buffer);
    let binary = "";
    for(let i=0;i<bytes.length;i++)
        binary += String.fromCharCode(bytes[i]);
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


async function decompressFromBase64(encoded:string):Promise<string> {
    const base64 =
        encoded
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const padded =
        base64 + "=".repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)
        bytes[i] = binary.charCodeAt(i);
    const stream =
        new Blob([bytes])
        .stream()
        .pipeThrough(new DecompressionStream("gzip"));
    const decompressedBlob =
        await new Response(stream).blob();
    return decompressedBlob.text();
}


export async function encodePuzzleToParam(
    puzzle:StoredPuzzle
):Promise<string> {
    return compressToBase64(JSON.stringify(puzzle));
}


export async function decodePuzzleFromParam(
    param:string
):Promise<StoredPuzzle|null> {
    try {
        const json = await decompressFromBase64(param);
        return JSON.parse(json) as StoredPuzzle;
    } catch {
        return null;
    }
}


// self-contained link: the whole puzzle lives in the URL itself.
// works with zero backend, but can hit MAX_SAFE_URL_LENGTH on big puzzles.
export function buildShareUrl(encoded:string):string {
    return `${window.location.origin}${PLAYER_ROUTE}?p=${encoded}`;
}


// short link: the puzzle lives in Redis (via /api/puzzle), the URL just
// carries the lookup id. No size limit, much shorter link to share.
export function buildShareUrlById(id:string):string {
    return `${window.location.origin}${PLAYER_ROUTE}?id=${id}`;
}