import type {
    CrosswordCell,
    PlacedWord
} from "./types";



export function numberGrid(
    grid:CrosswordCell[][],
    placedWords:PlacedWord[]
){


    const size =
        grid.length;



    for(let r=0;r<size;r++){

        for(let c=0;c<size;c++){

            grid[r][c].number = undefined;

        }

    }



    let currentNumber=1;



    for(let r=0;r<size;r++){

        for(let c=0;c<size;c++){


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
                    c+1<size &&
                    grid[r][c+1].letter !== ""
                );


            const startsDown =
                (
                    r===0 ||
                    grid[r-1][c].letter === ""
                ) &&
                (
                    r+1<size &&
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
                    grid[word.row][word.col].number

            })
        );



    return {

        grid,

        placedWords:numberedWords

    };


}