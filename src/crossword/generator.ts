import type { CrosswordWord } from "./types";
import { createEmptyGrid } from "./utils";


function canPlace(
    grid:string[][],
    word:string,
    row:number,
    col:number,
    direction:"across"|"down"
){

    let hasIntersection=false;


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



        if(grid[r][c]!=="" ){

            if(grid[r][c]!==word[i])
                return false;

            hasIntersection=true;
        }

    }


    return hasIntersection;

}




function placeWord(
    grid:string[][],
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


        grid[r][c]=word[i];

    }

}



export function generateCrossword(
    words: CrosswordWord[]
){

    const grid=createEmptyGrid();


    if(words.length===0)
        return grid;



    const sorted =
        [...words]
        .sort(
            (a,b)=>
            b.answer.length-a.answer.length
        );



    const first =
        sorted[0]
        .answer
        .toUpperCase();



    const center =
        Math.floor(grid.length/2);



    placeWord(
        grid,
        first,
        center,
        Math.floor(
            (grid.length-first.length)/2
        ),
        "across"
    );



    for(
        let w=1;
        w<sorted.length;
        w++
    ){

        const word =
            sorted[w]
            .answer
            .toUpperCase();



        let placed=false;



        for(
            let r=0;
            r<grid.length && !placed;
            r++
        ){

            for(
                let c=0;
                c<grid.length && !placed;
                c++
            ){


                for(
                    const direction of [
                        "across",
                        "down"
                    ] as const
                ){


                    if(
                        canPlace(
                            grid,
                            word,
                            r,
                            c,
                            direction
                        )
                    ){

                        placeWord(
                            grid,
                            word,
                            r,
                            c,
                            direction
                        );


                        placed=true;
                        break;

                    }

                }

            }

        }

    }


    return grid;

}