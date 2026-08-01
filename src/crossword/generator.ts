import type {
    CrosswordWord
} from "./types";


import {
    createEmptyGrid
} from "./utils";



export function generateCrossword(
    words: CrosswordWord[]
){

    const grid =
        createEmptyGrid();


    if(words.length===0)
        return grid;



    const first =
        words[0];


    const answer =
        first.answer.toUpperCase();



    const middle =
        Math.floor(
            grid.length / 2
        );



    answer
    .split("")
    .forEach(
        (
            letter,
            index
        )=>{

            grid[middle]
            [middle + index]
            = letter;

        }
    );



    first.row = middle;
    first.col = middle;
    first.direction="across";


    return grid;

}