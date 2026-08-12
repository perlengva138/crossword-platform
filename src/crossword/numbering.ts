import type {
    CrosswordCell,
    PlacedWord
} from "./types";



export function numberGrid(
    grid:CrosswordCell[][],
    placedWords:PlacedWord[]
){


    const rowCount =
        grid.length;


    // grids produced by generator.ts are not guaranteed to be square —
    // cropToContent trims to the actual bounding box of placed words,
    // which is usually wider or taller than it is the other way around.
    // using a single "size" for both row and column bounds (as this used
    // to) silently skips columns on non-square grids and breaks numbering.
    const colCount =
        rowCount > 0
        ? grid[0].length
        : 0;



    for(let r=0;r<rowCount;r++){

        for(let c=0;c<colCount;c++){

            grid[r][c].number = undefined;

        }

    }



    let currentNumber=1;



    for(let r=0;r<rowCount;r++){

        for(let c=0;c<colCount;c++){


            const cell =
                grid[r][c];


            if(cell.letter === "")
                continue;



            const startsAcross =
                (
                    c===0 ||
                    grid[r][c-1].letter === ""
                ) &&
                (
                    c+1<colCount &&
                    grid[r][c+1].letter !== ""
                );


            const startsDown =
                (
                    r===0 ||
                    grid[r-1][c].letter === ""
                ) &&
                (
                    r+1<rowCount &&
                    grid[r+1][c].letter !== ""
                );



            if(startsAcross || startsDown){

                cell.number = currentNumber;

                currentNumber++;

            }


        }

    }



    const numberedWords =
        placedWords.map(
            (word)=>({

                ...word,

                number:
                    grid[word.row]?.[word.col]?.number

            })
        );



    return {

        grid,

        placedWords:numberedWords

    };


}