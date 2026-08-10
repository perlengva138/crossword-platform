import type {
    StoredPuzzle
} from "./types";

const STORAGE_KEY = "crossword:puzzle:current";


export function savePuzzle(
    puzzle:StoredPuzzle
):boolean{
    try{
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(puzzle)
        );
        return true;
    } catch (err) {
        console.warn("Could not save puzzle locally:", err);
        return false;
    }
}


export function loadPuzzle():StoredPuzzle|null{
    const raw =
        localStorage.getItem(STORAGE_KEY);
    if(!raw)
        return null;
    try{
        return JSON.parse(raw) as StoredPuzzle;
    } catch {
        return null;
    }
}


// saves the puzzle to the server (Redis via /api/puzzle) so it can be
// opened from any device. returns the short id to build a share link with,
// or null if the save failed (e.g. no network, API not deployed yet).
export async function savePuzzleRemote(
    puzzle:StoredPuzzle
):Promise<string|null> {
    try {
        const res = await fetch("/api/puzzle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(puzzle)
        });

        if(!res.ok)
            return null;

        const data = await res.json();
        return data.id as string;
    } catch (err) {
        console.warn("Could not save puzzle remotely:", err);
        return null;
    }
}


// loads a puzzle from the server by its short id.
export async function loadPuzzleRemote(
    id:string
):Promise<StoredPuzzle|null> {
    try {
        const res = await fetch(`/api/puzzle?id=${encodeURIComponent(id)}`);

        if(!res.ok)
            return null;

        return await res.json() as StoredPuzzle;
    } catch (err) {
        console.warn("Could not load puzzle remotely:", err);
        return null;
    }
}