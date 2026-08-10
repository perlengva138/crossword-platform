import type {
    CrosswordWord,
    CrosswordCell,
    PlacedWord,
    CrosswordResult
} from "./types";


import {
    createEmptyGrid
} from "./utils";


const MIN_GRID_SIZE = 15;

const MAX_RETRY_PASSES = 8;



export function computeGridSize(wordCount:number):number {

    return Math.max(
        MIN_GRID_SIZE,
        13 + Math.ceil(wordCount * 0.6)
    );

}




function isFilled(
    grid:CrosswordCell[][],
    row:number,
    col:number
){

    if(
        row<0 ||
        col<0 ||
        row>=grid.length ||
        col>=grid.length
    )
        return false;


    return grid[row][col].letter !== "";

}




function canPlace(
    grid:CrosswordCell[][],
    word:string,
    row:number,
    col:number,
    direction:"across"|"down"
){

    let intersects=false;


    const beforeR =
        direction==="down"
        ? row-1
        : row;


    const beforeC =
        direction==="across"
        ? col-1
        : col;


    const afterR =
        direction==="down"
        ? row+word.length
        : row;


    const afterC =
        direction==="across"
        ? col+word.length
        : col;


    if(isFilled(grid,beforeR,beforeC))
        return false;


    if(isFilled(grid,afterR,afterC))
        return false;



    for(let i=0;i<word.length;i++){

        const r =
            direction==="down"
            ? row+i
            : row;


        const c =
            direction==="across"
            ? col+i
            : col;



        if(
            r<0 ||
            c<0 ||
            r>=grid.length ||
            c>=grid.length
        )
            return false;



        const cell =
            grid[r][c];



        if(cell.letter !== ""){


            if(cell.letter !== word[i])
                return false;


            intersects=true;

        } else {


            if(direction==="across"){

                if(isFilled(grid,r-1,c))
                    return false;

                if(isFilled(grid,r+1,c))
                    return false;

            } else {

                if(isFilled(grid,r,c-1))
                    return false;

                if(isFilled(grid,r,c+1))
                    return false;

            }

        }


    }


    return intersects;

}




function placeWord(
    grid:CrosswordCell[][],
    word:string,
    row:number,
    col:number,
    direction:"across"|"down"
){


    for(let i=0;i<word.length;i++){

        const r =
            direction==="down"
            ? row+i
            : row;


        const c =
            direction==="across"
            ? col+i
            : col;



        grid[r][c]={
            letter:word[i],
            isBlack:false
        };

    }

}




function findSpotAnywhere(
    grid:CrosswordCell[][],
    word:string
) {


    for(let r=0;r<grid.length;r++){

        for(let c=0;c<grid.length;c++){

            for(
                const dir of [
                    "across",
                    "down"
                ] as const
            ){

                if(canPlace(grid,word,r,c,dir)){

                    return {row:r, col:c, direction:dir};

                }

            }

        }

    }


    return null;

}




export function generateCrossword(
    words:CrosswordWord[]
):CrosswordResult{


    if(words.length === 0){

        return {

            grid: createEmptyGrid(MIN_GRID_SIZE),

            placedWords: [],

            unplacedAnswers: []

        };

    }



    const gridSize =
        computeGridSize(words.length);


    const grid =
        createEmptyGrid(gridSize);



    const placedWords:PlacedWord[]=[];



    const sorted =
        [...words]
        .sort(
            (a,b)=>
            b.answer.length-a.answer.length
        );



    const first =
        sorted[0];



    const answer =
        first.answer
        .toUpperCase();



    const row =
        Math.floor(
            grid.length/2
        );



    const col =
        Math.floor(
            (grid.length-answer.length)/2
        );



    placeWord(
        grid,
        answer,
        row,
        col,
        "across"
    );



    placedWords.push({

        ...first,

        row,

        col,

        direction:"across"

    });




    let remaining = sorted.slice(1);

    let pass = 0;


    while(remaining.length > 0 && pass < MAX_RETRY_PASSES){


        const stillUnplaced:CrosswordWord[] = [];

        let placedThisPass = 0;


        for(const current of remaining){


            const word =
                current.answer
                .toUpperCase();


            const spot =
                findSpotAnywhere(grid, word);


            if(spot){

                placeWord(
                    grid,
                    word,
                    spot.row,
                    spot.col,
                    spot.direction
                );


                placedWords.push({

                    ...current,

                    row: spot.row,

                    col: spot.col,

                    direction: spot.direction

                });


                placedThisPass++;


            } else {

                stillUnplaced.push(current);

            }


        }


        remaining = stillUnplaced;

        pass++;


        if(placedThisPass === 0)
            break;


    }



    if(remaining.length > 0){

        console.warn(
            "Could not place",
            remaining.length,
            "word(s):",
            remaining.map(w => w.answer).join(", ")
        );

    }



    return {

        grid,

        placedWords,

        unplacedAnswers: remaining.map(w => w.answer)

    };


}