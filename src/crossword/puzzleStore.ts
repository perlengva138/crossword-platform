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