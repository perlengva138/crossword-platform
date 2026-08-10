export interface CrosswordCell {

    letter: string;

    isBlack: boolean;

    number?: number;

}


export interface CrosswordWord {

    answer: string;

    clue: string;

    hints?: string[];

    imageUrl?: string;

    row?: number;

    col?: number;

    direction?: "across" | "down";

}


export interface PlacedWord extends CrosswordWord {

    row: number;

    col: number;

    direction: "across" | "down";

    number?: number;

}


export interface CrosswordResult {

    grid: CrosswordCell[][];

    placedWords: PlacedWord[];

}


export interface SuperAnswerCell {

    row: number;

    col: number;

    order: number;

}


export interface StoredPuzzle {

    title: string;

    grid: CrosswordCell[][];

    placedWords: PlacedWord[];

    superAnswer: SuperAnswerCell[];

}


export interface Puzzle {

    title: string;

    words: CrosswordWord[];

    grid?: CrosswordCell[][];

}