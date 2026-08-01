export const GRID_SIZE = 15;


export function createEmptyGrid(){

    return Array.from(
        {
            length: GRID_SIZE
        },
        () =>
            Array(GRID_SIZE).fill("")
    );

}