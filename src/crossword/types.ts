export interface CrosswordWord {

    answer: string;

    clue: string;

    row?: number;

    col?: number;

    direction?: "across" | "down";

}


export interface Puzzle {

    title: string;

    words: CrosswordWord[];

}