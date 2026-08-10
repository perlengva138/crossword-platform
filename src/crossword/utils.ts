import type {
    CrosswordCell
} from "./types";



export function createEmptyGrid(size:number){

    return Array.from(
        {
            length: size
        },

        () =>
            Array.from(
                {
                    length: size
                },

                (): CrosswordCell => ({

                    letter:"",

                    isBlack:true

                })

            )

    );

}




export function computeCellPx(gridSize:number):number {

    return Math.max(
        16,
        Math.min(40, Math.floor(700 / gridSize))
    );

}