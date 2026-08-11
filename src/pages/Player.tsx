import { useState, useEffect, useRef } from "react";

import {
    loadPuzzle,
    savePuzzle,
    loadPuzzleRemote
} from "../crossword/puzzleStore";

import {
    decodePuzzleFromParam
} from "../crossword/shareLink";

import {
    computeCellPx
} from "../crossword/utils";

import type {
    StoredPuzzle,
    PlacedWord
} from "../crossword/types";


const DEFAULT_POINTS = 10;

const DEFAULT_HINT_PENALTY = 2;


const DIFFICULTY_STYLES: Record<string,string> = {

    easy: "bg-green-100 text-green-700",

    medium: "bg-yellow-100 text-yellow-700",

    hard: "bg-red-100 text-red-700"

};



function getWordCells(word:PlacedWord) {

    const cells:{row:number,col:number}[] = [];


    for(let i=0;i<word.answer.length;i++){

        const row =
            word.direction === "down"
            ? word.row + i
            : word.row;


        const col =
            word.direction === "across"
            ? word.col + i
            : word.col;


        cells.push({row,col});

    }


    return cells;

}



function isWordSolved(
    word:PlacedWord,
    userAnswers:string[][]
) {

    return getWordCells(word).every(
        ({row,col},i) =>
        userAnswers[row][col] === word.answer[i]
    );

}



function wordKey(word:PlacedWord) {

    return `${word.direction}-${word.number}`;

}



function formatTime(totalSeconds:number) {

    const minutes =
        Math.floor(totalSeconds / 60);


    const seconds =
        totalSeconds % 60;


    return `${minutes}:${seconds.toString().padStart(2,"0")}`;

}




export default function Player() {


    const [puzzle, setPuzzle]
        =
        useState<StoredPuzzle|null>(null);



    const [linkBroken, setLinkBroken]
        =
        useState(false);



    const [userAnswers, setUserAnswers]
        =
        useState<string[][]>([]);



    const [revealedHints, setRevealedHints]
        =
        useState<Record<string,number>>({});



    const [elapsedSeconds, setElapsedSeconds]
        =
        useState(0);



    const [showErrors, setShowErrors]
        =
        useState(false);



    const [activeCell, setActiveCell]
        =
        useState<{row:number,col:number}|null>(null);



    const [direction, setDirection]
        =
        useState<"across"|"down">("across");



    const inputRefs =
        useRef<(HTMLInputElement|null)[][]>([]);



    // measures the real space available for the grid directly from the DOM
    // (its own rendered width, and the gap between it and the bottom of the
    // viewport) instead of guessing with fixed pixel constants. this is what
    // makes sizing adapt correctly to any monitor/window size automatically.
    const gridWrapperRef =
        useRef<HTMLDivElement>(null);


    const [availableSize, setAvailableSize] =
        useState({ width: 900, height: 600 });


    useEffect(
        () => {

            function measure() {

                if(!gridWrapperRef.current)
                    return;


                const rect =
                    gridWrapperRef.current.getBoundingClientRect();


                const availableWidth =
                    rect.width;


                const availableHeight =
                    Math.max(
                        200,
                        window.innerHeight - rect.top - 24
                    );


                setAvailableSize({
                    width: availableWidth,
                    height: availableHeight
                });

            }


            measure();


            window.addEventListener("resize", measure);


            return () =>
                window.removeEventListener("resize", measure);

        },
        [puzzle]
    );




    useEffect(
        () => {

            let cancelled = false;


            async function load() {


                const params =
                    new URLSearchParams(window.location.search);


                const id = params.get("id");

                const encoded = params.get("p");


                let loaded:StoredPuzzle|null = null;

                let broken = false;


                if(id){

                    // remote lookup — stored via /api/puzzle when someone published
                    loaded = await loadPuzzleRemote(id);


                    if(!loaded){

                        broken = true;

                    } else {

                        savePuzzle(loaded);

                    }


                } else if(encoded){

                    // legacy self-contained link — puzzle data lives in the URL itself
                    loaded = await decodePuzzleFromParam(encoded);


                    if(!loaded){

                        broken = true;

                    } else {

                        savePuzzle(loaded);

                    }

                }


                if(!loaded){

                    loaded = loadPuzzle();

                }


                if(cancelled)
                    return;


                setLinkBroken(broken);

                setPuzzle(loaded);


                if(loaded){

                    setUserAnswers(
                        loaded.grid.map(
                            row => row.map(() => "")
                        )
                    );


                    if(loaded.placedWords.length > 0){

                        const first =
                            [...loaded.placedWords]
                            .sort((a,b) => (a.number ?? 0) - (b.number ?? 0))[0];


                        setActiveCell({row:first.row, col:first.col});

                        setDirection(first.direction);

                    }

                }

            }


            load();


            return () => { cancelled = true; };

        },
        []
    );




    const ready =
        puzzle !== null &&
        userAnswers.length === puzzle.grid.length;




    const completed =
        ready
        ? puzzle!.placedWords.every(
            word => isWordSolved(word, userAnswers)
        )
        : false;




    useEffect(
        () => {

            if(!ready)
                return;


            if(completed)
                return;


            const interval =
                setInterval(
                    () => setElapsedSeconds(s => s + 1),
                    1000
                );


            return () => clearInterval(interval);

        },
        [ready, completed]
    );




    useEffect(
        () => {

            if(!ready)
                return;

            if(!activeCell)
                return;

            inputRefs.current[activeCell.row]?.[activeCell.col]?.focus();

        },
        [ready]
    );




    if(!puzzle){

        return (

            <div className="p-10">

                No puzzle found. Ask the puzzle creator to publish one from the Editor first.

            </div>

        );

    }



    if(!ready){

        return (

            <div className="p-10">
                Loading puzzle...
            </div>

        );

    }




    function focusCell(row:number, col:number) {

        inputRefs.current[row]?.[col]?.focus();

    }




    function partOfAcross(row:number, col:number) {

        if(puzzle!.grid[row][col].isBlack)
            return false;


        const left = col > 0 && !puzzle!.grid[row][col-1].isBlack;

        const right = col < puzzle!.grid.length - 1 && !puzzle!.grid[row][col+1].isBlack;


        return left || right;

    }




    function partOfDown(row:number, col:number) {

        if(puzzle!.grid[row][col].isBlack)
            return false;


        const up = row > 0 && !puzzle!.grid[row-1][col].isBlack;

        const down = row < puzzle!.grid.length - 1 && !puzzle!.grid[row+1][col].isBlack;


        return up || down;

    }




    function selectCell(row:number, col:number) {


        if(puzzle!.grid[row][col].isBlack)
            return;


        const acrossOk = partOfAcross(row,col);

        const downOk = partOfDown(row,col);


        let newDirection = direction;


        if(activeCell && activeCell.row === row && activeCell.col === col){


            if(direction === "across" && downOk)
                newDirection = "down";

            else if(direction === "down" && acrossOk)
                newDirection = "across";


        } else {


            if(direction === "across" && acrossOk)
                newDirection = "across";

            else if(direction === "down" && downOk)
                newDirection = "down";

            else if(acrossOk)
                newDirection = "across";

            else if(downOk)
                newDirection = "down";


        }


        setActiveCell({row,col});

        setDirection(newDirection);

        focusCell(row,col);

    }




    function selectWord(word:PlacedWord) {

        setActiveCell({row:word.row, col:word.col});

        setDirection(word.direction);

        focusCell(word.row, word.col);

    }




    function nextCellInDirection(row:number, col:number) {

        const nr = direction === "down" ? row + 1 : row;

        const nc = direction === "across" ? col + 1 : col;


        if(nr < 0 || nc < 0 || nr >= puzzle!.grid.length || nc >= puzzle!.grid.length)
            return null;


        if(puzzle!.grid[nr][nc].isBlack)
            return null;


        return {row:nr, col:nc};

    }




    function prevCellInDirection(row:number, col:number) {

        const pr = direction === "down" ? row - 1 : row;

        const pc = direction === "across" ? col - 1 : col;


        if(pr < 0 || pc < 0 || pr >= puzzle!.grid.length || pc >= puzzle!.grid.length)
            return null;


        if(puzzle!.grid[pr][pc].isBlack)
            return null;


        return {row:pr, col:pc};

    }




    function getActiveWordCells() {

        if(!activeCell)
            return [];


        const cells:{row:number,col:number}[] = [];

        const {row,col} = activeCell;


        if(direction === "across"){

            let c = col;

            while(c > 0 && !puzzle!.grid[row][c-1].isBlack)
                c--;


            while(c < puzzle!.grid.length && !puzzle!.grid[row][c].isBlack){

                cells.push({row,col:c});

                c++;

            }


        } else {

            let r = row;

            while(r > 0 && !puzzle!.grid[r-1][col].isBlack)
                r--;


            while(r < puzzle!.grid.length && !puzzle!.grid[r][col].isBlack){

                cells.push({row:r,col});

                r++;

            }

        }


        return cells;

    }




    function getSuperAnswerOrder(row:number, col:number) {

        const found =
            puzzle!.superAnswer.find(
                cell => cell.row === row && cell.col === col
            );


        return found ? found.order : null;

    }




    function handleCellChange(
        row:number,
        col:number,
        value:string
    ) {

        const letter =
            value.toUpperCase().slice(-1);


        setUserAnswers(
            userAnswers.map(
                (r,ri) =>
                ri === row
                ? r.map((c,ci) => ci === col ? letter : c)
                : r
            )
        );


        if(letter !== ""){

            const next = nextCellInDirection(row,col);


            if(next){

                setActiveCell(next);

                focusCell(next.row, next.col);

            }

        }

    }




    function handleKeyDown(
        e:React.KeyboardEvent<HTMLInputElement>,
        row:number,
        col:number
    ) {

        if(e.key !== "Backspace")
            return;


        e.preventDefault();


        const current = userAnswers[row][col];


        if(current !== ""){

            setUserAnswers(
                userAnswers.map(
                    (r,ri) =>
                    ri === row
                    ? r.map((c,ci) => ci === col ? "" : c)
                    : r
                )
            );


            return;

        }


        const prev = prevCellInDirection(row,col);

        if(!prev)
            return;


        setUserAnswers(
            userAnswers.map(
                (r,ri) =>
                ri === prev.row
                ? r.map((c,ci) => ci === prev.col ? "" : c)
                : r
            )
        );


        setActiveCell(prev);

        focusCell(prev.row, prev.col);

    }




    function revealHint(word:PlacedWord) {

        const key = wordKey(word);

        const current = revealedHints[key] ?? 0;

        const maxHints = word.hints?.length ?? 0;


        if(current >= maxHints)
            return;


        setRevealedHints({
            ...revealedHints,
            [key]: current + 1
        });

    }




    function pointsForWord(word:PlacedWord) {

        const key = wordKey(word);

        const hintsUsed = revealedHints[key] ?? 0;

        const basePoints = word.points ?? DEFAULT_POINTS;

        const penalty = word.hintPenalty ?? DEFAULT_HINT_PENALTY;


        return Math.max(
            basePoints - hintsUsed * penalty,
            0
        );

    }




    const solvedWords =
        puzzle.placedWords.filter(
            word => isWordSolved(word, userAnswers)
        );


    const score =
        solvedWords.reduce(
            (total,word) => total + pointsForWord(word),
            0
        );


    const maxScore =
        puzzle.placedWords.reduce(
            (total,word) => total + (word.points ?? DEFAULT_POINTS),
            0
        );



    const acrossWords =
        puzzle.placedWords
        .filter(word => word.direction === "across")
        .sort((a,b) => (a.number ?? 0) - (b.number ?? 0));


    const downWords =
        puzzle.placedWords
        .filter(word => word.direction === "down")
        .sort((a,b) => (a.number ?? 0) - (b.number ?? 0));



    const superAnswerSolved =
        puzzle.superAnswer.length > 0 &&
        puzzle.superAnswer.every(
            cell =>
            userAnswers[cell.row]?.[cell.col] ===
            puzzle.grid[cell.row][cell.col].letter
        );



    const activeWordCells = getActiveWordCells();

    const activeWordStart = activeWordCells[0] ?? null;


    // sized to fit the actually-measured available space in both
    // directions, so the grid fills the screen without needing to scroll,
    // and adapts correctly across different monitor resolutions
    const cellPx =
        computeCellPx(
            puzzle.grid.length,
            availableSize.width,
            availableSize.height
        );




    function isInActiveWord(row:number, col:number) {

        return activeWordCells.some(
            cell => cell.row === row && cell.col === col
        );

    }




    function renderClueList(list:PlacedWord[]) {

        return list.map(word => {

            const key = wordKey(word);

            const hintsUsed = revealedHints[key] ?? 0;

            const totalHints = word.hints?.length ?? 0;

            const solved = isWordSolved(word, userAnswers);

            const wordPoints = word.points ?? DEFAULT_POINTS;

            const wordPenalty = word.hintPenalty ?? DEFAULT_HINT_PENALTY;

            const difficultyClass =
                DIFFICULTY_STYLES[word.difficulty ?? "medium"];


            const isActiveClue =
                word.direction === direction &&
                activeWordStart !== null &&
                word.row === activeWordStart.row &&
                word.col === activeWordStart.col;


            return (

                <div
                    key={key}

                    onClick={() => selectWord(word)}

                    className={`
                    mt-3
                    cursor-pointer
                    rounded
                    px-1
                    ${isActiveClue ? "bg-blue-50" : ""}
                    `}
                >

                    <div className={solved ? "text-green-600" : ""}>

                        <b>{word.number}.</b>
                        {" "}
                        {word.clue}


                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${difficultyClass}`}>
                            {word.difficulty ?? "medium"} · {wordPoints}pts
                        </span>


                        {
                            totalHints > 0 &&
                            (

                            <button

                                onClick={
                                    e => {
                                        e.stopPropagation();
                                        revealHint(word);
                                    }
                                }

                                disabled={hintsUsed >= totalHints}

                                className="
                                ml-2
                                text-xs
                                bg-yellow-500
                                text-white
                                px-2
                                py-0.5
                                rounded
                                disabled:opacity-40
                                "

                            >

                                Hint ({hintsUsed}/{totalHints}, -{wordPenalty}pts)

                            </button>

                            )
                        }

                    </div>


                    {
                        word.imageUrl &&
                        (
                            <img
                                src={word.imageUrl}
                                alt={word.clue}
                                className="mt-2 max-w-[160px] rounded border ml-4"
                            />
                        )
                    }


                    {
                        Array.from({length:hintsUsed}).map(
                            (_,i) => {

                                const hint = word.hints![i];

                                return (

                                    <div
                                        key={i}
                                        className="text-sm text-gray-500 ml-4 mt-1"
                                    >

                                        <div>Hint {i+1}: {hint.text}</div>


                                        {
                                            hint.imageUrl &&
                                            (
                                                <img
                                                    src={hint.imageUrl}
                                                    alt=""
                                                    className="mt-1 max-w-[140px] rounded border"
                                                />
                                            )
                                        }

                                    </div>

                                );

                            }
                        )
                    }

                </div>

            );

        });

    }




    return (

        <div className="p-10">


            <h1 className="text-4xl font-bold">
                {puzzle.title}
            </h1>



            {
                linkBroken &&
                (
                    <div className="mt-2 text-sm text-orange-600">
                        That share link looked broken or incomplete — showing the most recently published puzzle on this browser instead.
                    </div>
                )
            }



            {/* STATUS BAR */}

            <div className="mt-4 flex gap-8 items-center">

                <div>
                    Time: {formatTime(elapsedSeconds)}
                </div>

                <div>
                    Score: {score} / {maxScore}
                </div>

                <button

                    onClick={() => setShowErrors(!showErrors)}

                    className="bg-gray-600 text-white px-3 py-1 rounded"

                >

                    {showErrors ? "Hide Errors" : "Check Answers"}

                </button>

            </div>



            {
                completed &&
                (

                <div className="mt-4 text-2xl font-bold text-green-600">

                    Solved in {formatTime(elapsedSeconds)}! Final score: {score} / {maxScore}

                </div>

                )
            }




            {/* GRID + CLUES */}

            <div className="mt-10 flex flex-col items-center gap-8">


            <div
                ref={gridWrapperRef}
                className="overflow-auto w-full flex justify-center"
            >

            <div className="inline-block">

            {
                puzzle.grid.map(
                    (row,rowIndex) => (

                        <div key={rowIndex} className="flex">

                        {
                            row.map(
                                (cell,colIndex) => {


                                if(cell.isBlack){

                                    return (
                                        <div
                                            key={colIndex}
                                            style={{width: cellPx, height: cellPx}}
                                            className="border bg-black"
                                        />
                                    );

                                }


                                const typed =
                                    userAnswers[rowIndex][colIndex];


                                const isWrong =
                                    showErrors &&
                                    typed !== "" &&
                                    typed !== cell.letter;


                                const isActive =
                                    activeCell?.row === rowIndex &&
                                    activeCell?.col === colIndex;


                                const inWord =
                                    isInActiveWord(rowIndex,colIndex);


                                const superOrder =
                                    getSuperAnswerOrder(rowIndex,colIndex);


                                let bgClass = "bg-transparent";

                                if(isWrong) bgClass = "bg-red-50";

                                else if(isActive) bgClass = "bg-blue-300";

                                else if(inWord) bgClass = "bg-blue-100";



                                return (

                                    <div
                                        key={colIndex}

                                        style={{width: cellPx, height: cellPx}}

                                        className={`
                                        border
                                        relative
                                        ${superOrder ? "ring-2 ring-orange-400" : ""}
                                        `}
                                    >

                                    {
                                        cell.number &&
                                        (

                                        <span
                                            className="
                                            absolute
                                            top-0
                                            left-1
                                            text-[9px]
                                            text-gray-500
                                            pointer-events-none
                                            "
                                        >

                                            {cell.number}

                                        </span>

                                        )
                                    }


                                    {
                                        superOrder &&
                                        (

                                        <span
                                            className="
                                            absolute
                                            bottom-0
                                            right-1
                                            text-[9px]
                                            text-orange-600
                                            font-bold
                                            pointer-events-none
                                            "
                                        >

                                            {superOrder}

                                        </span>

                                        )
                                    }


                                    <input

                                        ref={
                                            el => {
                                                if(!inputRefs.current[rowIndex])
                                                    inputRefs.current[rowIndex] = [];

                                                inputRefs.current[rowIndex][colIndex] = el;
                                            }
                                        }

                                        maxLength={1}

                                        value={typed}

                                        onChange={
                                            e =>
                                            handleCellChange(
                                                rowIndex,
                                                colIndex,
                                                e.target.value
                                            )
                                        }

                                        onKeyDown={
                                            e =>
                                            handleKeyDown(
                                                e,
                                                rowIndex,
                                                colIndex
                                            )
                                        }

                                        onClick={
                                            () =>
                                            selectCell(rowIndex, colIndex)
                                        }

                                        onFocus={
                                            e => e.target.select()
                                        }

                                        style={{fontSize: Math.max(8, Math.floor(cellPx * 0.5))}}

                                        className={`
                                        w-full
                                        h-full
                                        text-center
                                        font-bold
                                        outline-none
                                        ${bgClass}
                                        ${isWrong ? "text-red-600" : "text-black"}
                                        `}

                                    />


                                    </div>

                                );

                                }
                            )
                        }

                        </div>

                    )
                )
            }

            </div>

            </div>



            {/* CLUES */}

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-x-16">

                <div>

                    <h2 className="text-xl font-bold">Across</h2>

                    {renderClueList(acrossWords)}

                </div>

                <div>

                    <h2 className="text-xl font-bold md:mt-0 mt-6">Down</h2>

                    {renderClueList(downWords)}

                </div>


                {
                    puzzle.superAnswer.length > 0 &&
                    (

                    <div className="mt-8 md:col-span-2">

                        <h2 className="text-xl font-bold">Bonus Answer</h2>

                        <div className="flex gap-2 mt-2 text-2xl font-mono">

                        {
                            puzzle.superAnswer
                            .slice()
                            .sort((a,b) => a.order - b.order)
                            .map((cell,i) => {

                                const typed =
                                    userAnswers[cell.row]?.[cell.col] ?? "";

                                const solutionLetter =
                                    puzzle.grid[cell.row][cell.col].letter;

                                const revealed =
                                    typed === solutionLetter;

                                return (

                                    <span
                                        key={i}
                                        className="border-b-2 w-6 text-center"
                                    >

                                        {revealed ? solutionLetter : "_"}

                                    </span>

                                );

                            })
                        }

                        </div>


                        {
                            superAnswerSolved &&
                            (

                            <p className="mt-2 font-bold text-green-600">
                                Bonus answer revealed!
                            </p>

                            )
                        }

                    </div>

                    )
                }

            </div>


            </div>



        </div>

    );

}