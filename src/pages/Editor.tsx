import { useState } from "react";

import {
    generateCrossword
} from "../crossword/generator";


import {
    numberGrid
} from "../crossword/numbering";


import {
    computeCellPx,
    useViewportSize
} from "../crossword/utils";


import {
    savePuzzle,
    savePuzzleRemote,
    loadPuzzleRemote
} from "../crossword/puzzleStore";


import {
    encodePuzzleToParam,
    decodePuzzleFromParam,
    buildShareUrl,
    buildShareUrlById,
    MAX_SAFE_URL_LENGTH
} from "../crossword/shareLink";


import type {
    CrosswordWord,
    CrosswordCell,
    CrosswordHint,
    PlacedWord,
    SuperAnswerCell,
    StoredPuzzle
} from "../crossword/types";



type Difficulty = "easy" | "medium" | "hard";


const DEFAULT_POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {

    easy: 5,

    medium: 10,

    hard: 20

};


const DEFAULT_HINT_PENALTY_BY_DIFFICULTY: Record<Difficulty, number> = {

    easy: 1,

    medium: 2,

    hard: 4

};




function parseBulkLine(line:string):CrosswordWord|null {

    const trimmed = line.trim();

    if(trimmed === "")
        return null;


    const match =
        trimmed.match(/^(\S+)\s+(.+)$/);


    if(!match)
        return null;


    const rawAnswer = match[1];

    const rest = match[2];


    const hintParts =
        rest
        .split("/")
        .map(part => part.trim())
        .filter(part => part !== "");


    if(hintParts.length === 0)
        return null;


    const secondaryHints:CrosswordHint[] =
        hintParts
        .slice(1)
        .map(text => ({text}));


    return {

        answer: rawAnswer.toUpperCase().replace(/\s/g, ""),

        clue: hintParts[0],

        hints:
            secondaryHints.length > 0
            ? secondaryHints
            : undefined

    };

}




export default function Editor() {


    const [title, setTitle]
        =
        useState("My Crossword");



    const [words, setWords]
        =
        useState<CrosswordWord[]>([]);



    const [answer, setAnswer]
        =
        useState("");



    const [clue, setClue]
        =
        useState("");



    const [imageUrl, setImageUrl]
        =
        useState("");



    const [draftHints, setDraftHints]
        =
        useState<CrosswordHint[]>([]);



    const [hintDraftText, setHintDraftText]
        =
        useState("");



    const [hintDraftImageUrl, setHintDraftImageUrl]
        =
        useState("");



    const [difficulty, setDifficulty]
        =
        useState<Difficulty>("medium");



    const [points, setPoints]
        =
        useState(DEFAULT_POINTS_BY_DIFFICULTY.medium);



    const [hintPenalty, setHintPenalty]
        =
        useState(DEFAULT_HINT_PENALTY_BY_DIFFICULTY.medium);



    const [bulkText, setBulkText]
        =
        useState("");



    const [importSkippedCount, setImportSkippedCount]
        =
        useState<number|null>(null);



    const [grid, setGrid]
        =
        useState<CrosswordCell[][]>([]);



    const [placedWords, setPlacedWords]
        =
        useState<PlacedWord[]>([]);



    const [unplacedAnswers, setUnplacedAnswers]
        =
        useState<string[]>([]);



    const [markingSuperAnswer, setMarkingSuperAnswer]
        =
        useState(false);



    const [superAnswer, setSuperAnswer]
        =
        useState<SuperAnswerCell[]>([]);



    const [published, setPublished]
        =
        useState(false);



    const [publishError, setPublishError]
        =
        useState(false);



    const [publishing, setPublishing]
        =
        useState(false);



    const [shareLink, setShareLink]
        =
        useState<string|null>(null);



    const [shareLinkTooLong, setShareLinkTooLong]
        =
        useState(false);



    const [linkCopied, setLinkCopied]
        =
        useState(false);



    const [loadLinkInput, setLoadLinkInput]
        =
        useState("");



    const [loading, setLoading]
        =
        useState(false);



    const [loadError, setLoadError]
        =
        useState<string|null>(null);



    const [loadSuccessCount, setLoadSuccessCount]
        =
        useState<number|null>(null);




    function handleDifficultyChange(newDifficulty:Difficulty) {

        setDifficulty(newDifficulty);

        setPoints(DEFAULT_POINTS_BY_DIFFICULTY[newDifficulty]);

        setHintPenalty(DEFAULT_HINT_PENALTY_BY_DIFFICULTY[newDifficulty]);

    }




    function addDraftHint() {


        if(hintDraftText.trim() === "")
            return;


        setDraftHints(
            [
                ...draftHints,
                {
                    text: hintDraftText.trim(),
                    imageUrl:
                        hintDraftImageUrl.trim() !== ""
                        ? hintDraftImageUrl.trim()
                        : undefined
                }
            ]
        );


        setHintDraftText("");

        setHintDraftImageUrl("");

    }




    function removeDraftHint(index:number) {

        setDraftHints(
            draftHints.filter((_,i) => i !== index)
        );

    }




    function addWord() {


        if(answer.trim() === "")
            return;



        const newWord: CrosswordWord = {

            answer:
                answer
                .toUpperCase()
                .replace(/\s/g, ""),

            clue,

            imageUrl:
                imageUrl.trim() !== ""
                ? imageUrl.trim()
                : undefined,

            hints:
                draftHints.length > 0
                ? draftHints
                : undefined,

            difficulty,

            points,

            hintPenalty

        };



        setWords(
            [
                ...words,
                newWord
            ]
        );



        setAnswer("");

        setClue("");

        setImageUrl("");

        setDraftHints([]);

        // difficulty / points / hintPenalty stay as-is on purpose,
        // so a run of similar-difficulty words doesn't need re-picking each time

    }




    function importBulk() {


        const lines =
            bulkText.split("\n");


        const parsedResults =
            lines.map(parseBulkLine);


        const valid =
            parsedResults.filter(
                (word): word is CrosswordWord =>
                word !== null && word.answer !== ""
            );


        const skipped =
            lines.filter(line => line.trim() !== "").length -
            valid.length;



        setWords(
            [
                ...words,
                ...valid
            ]
        );


        setBulkText("");

        setImportSkippedCount(skipped);

    }




    function removeWord(index:number) {

        setWords(
            words.filter((_,i) => i !== index)
        );

    }





    function generate() {


        const result =
            generateCrossword(words);


        const numbered =
            numberGrid(
                result.grid,
                result.placedWords
            );


        setGrid(numbered.grid);

        setPlacedWords(numbered.placedWords);

        setUnplacedAnswers(result.unplacedAnswers);

        setSuperAnswer([]);

        setMarkingSuperAnswer(false);

        setPublished(false);

        setPublishError(false);

        setShareLink(null);

        setShareLinkTooLong(false);

        setLinkCopied(false);

    }





    function toggleSuperAnswerCell(
        row:number,
        col:number
    ) {


        const existing =
            superAnswer.find(
                cell =>
                cell.row === row &&
                cell.col === col
            );



        if(existing){


            const filtered =
                superAnswer
                .filter(
                    cell =>
                    !(
                        cell.row === row &&
                        cell.col === col
                    )
                )
                .map(
                    (cell,index)=>({
                        ...cell,
                        order:index+1
                    })
                );


            setSuperAnswer(filtered);


        } else {


            setSuperAnswer(
                [
                    ...superAnswer,
                    {
                        row,
                        col,
                        order: superAnswer.length + 1
                    }
                ]
            );


        }


    }




    function getSuperAnswerOrder(
        row:number,
        col:number
    ) {


        const found =
            superAnswer.find(
                cell =>
                cell.row === row &&
                cell.col === col
            );


        return found ? found.order : null;

    }




    // loads an already-published puzzle from a pasted share link (either the
    // short ?id=... form saved remotely, or the older self-contained ?p=...
    // encoded-URL form) and restores its words back into the editable words
    // list, so more words can be added and the puzzle regenerated.
    async function loadExistingPuzzle() {


        setLoadError(null);

        setLoadSuccessCount(null);

        setLoading(true);


        let parsedUrl:URL;


        try {

            parsedUrl = new URL(loadLinkInput.trim());

        } catch {

            setLoadError("That doesn't look like a valid link — paste the full share URL.");

            setLoading(false);

            return;

        }


        const id = parsedUrl.searchParams.get("id");

        const encoded = parsedUrl.searchParams.get("p");


        let puzzle:StoredPuzzle|null = null;


        if(id){

            puzzle = await loadPuzzleRemote(id);

        } else if(encoded){

            puzzle = await decodePuzzleFromParam(encoded);

        }


        if(!puzzle){

            setLoadError("Couldn't find a puzzle at that link. Double check it was copied in full.");

            setLoading(false);

            return;

        }


        // strip placement-only fields (row/col/direction/number) so these
        // become plain editable words again, ready to regenerate alongside
        // any new words added on top
        const restoredWords:CrosswordWord[] =
            puzzle.placedWords.map(
                w => ({

                    answer: w.answer,

                    clue: w.clue,

                    imageUrl: w.imageUrl,

                    hints: w.hints,

                    difficulty: w.difficulty,

                    points: w.points,

                    hintPenalty: w.hintPenalty

                })
            );


        setTitle(puzzle.title);

        setWords(restoredWords);


        // clear any previously generated grid — regenerate fresh once
        // new words (if any) are added on top of the restored list
        setGrid([]);

        setPlacedWords([]);

        setUnplacedAnswers([]);

        setSuperAnswer([]);

        setMarkingSuperAnswer(false);

        setPublished(false);

        setPublishError(false);

        setShareLink(null);

        setShareLinkTooLong(false);

        setLinkCopied(false);


        setLoadSuccessCount(restoredWords.length);

        setLoadLinkInput("");

        setLoading(false);

    }




    async function publish() {


        setPublishing(true);

        setLinkCopied(false);


        const puzzle: StoredPuzzle = {

            title,

            grid,

            placedWords,

            superAnswer

        };



        const localSaveSuccess =
            savePuzzle(puzzle);


        setPublished(localSaveSuccess);

        setPublishError(!localSaveSuccess);


        // try a remote save first — gives a short link with no size limit,
        // and lets any device open it (not just this browser).
        const remoteId =
            await savePuzzleRemote(puzzle);


        if(remoteId){

            setShareLink(buildShareUrlById(remoteId));

            setShareLinkTooLong(false);

            setPublishing(false);

            return;

        }


        // fallback: old self-contained URL-encoded link, in case the
        // API/database isn't reachable (e.g. offline, not deployed yet)
        try {


            const encoded =
                await encodePuzzleToParam(puzzle);


            const url =
                buildShareUrl(encoded);


            if(url.length > MAX_SAFE_URL_LENGTH){

                setShareLink(null);

                setShareLinkTooLong(true);

            } else {

                setShareLink(url);

                setShareLinkTooLong(false);

            }


        } catch {

            setShareLink(null);

            setShareLinkTooLong(true);

        }


        setPublishing(false);

    }




    async function copyLink() {


        if(!shareLink)
            return;


        try {

            await navigator.clipboard.writeText(shareLink);

            setLinkCopied(true);

        } catch {

            setLinkCopied(false);

        }

    }




    function handleCellClick(
        row:number,
        col:number,
        isBlack:boolean
    ) {


        if(!markingSuperAnswer)
            return;


        if(isBlack)
            return;


        toggleSuperAnswerCell(row,col);

    }




    const superAnswerText =
        superAnswer
        .slice()
        .sort((a,b) => a.order - b.order)
        .map(cell => grid[cell.row]?.[cell.col]?.letter ?? "")
        .join("");


    const { width: viewportWidth, height: viewportHeight } =
        useViewportSize();


    // full-width layout here (no side clue panel like Player has), so the
    // grid can use almost the whole window, minus some breathing room
    const cellPx =
        grid.length > 0
        ? computeCellPx(
            grid.length,
            Math.min(viewportWidth - 80, 1100),
            viewportHeight * 0.7
        )
        : 40;




    return (

        <div className="p-10">


            <h1
                className="
                text-4xl
                font-bold
                "
            >
                Crossword Editor
            </h1>



            {/* TITLE */}

            <div className="mt-6">

                <label className="block text-sm font-bold mb-1">
                    Puzzle Title
                </label>

                <input

                    className="
                    border
                    p-2
                    rounded
                    w-80
                    "

                    value={title}

                    onChange={
                        e =>
                        setTitle(
                            e.target.value
                        )
                    }

                />

            </div>



            {/* LOAD EXISTING PUZZLE */}

            <div className="mt-6 max-w-2xl border-t pt-4">

                <h3 className="font-bold text-sm">
                    Load an Existing Puzzle
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                    Paste a puzzle's share link (from Publish) to pull its words, clues, hints, and images back in here — add more on top, then regenerate.
                </p>

                <div className="flex gap-2 mt-2">

                    <input

                        className="border p-2 rounded flex-1"

                        placeholder="https://yoursite.vercel.app/play?id=..."

                        value={loadLinkInput}

                        onChange={
                            e =>
                            setLoadLinkInput(
                                e.target.value
                            )
                        }

                    />

                    <button

                        onClick={loadExistingPuzzle}

                        disabled={loading || loadLinkInput.trim() === ""}

                        className="
                        bg-indigo-600
                        text-white
                        px-4
                        py-2
                        rounded
                        disabled:opacity-50
                        whitespace-nowrap
                        "

                    >

                        {loading ? "Loading..." : "Load Puzzle"}

                    </button>

                </div>


                {
                    loadError &&
                    (
                        <p className="mt-2 text-sm text-red-600">
                            {loadError}
                        </p>
                    )
                }


                {
                    loadSuccessCount !== null &&
                    (
                        <p className="mt-2 text-sm text-green-600">
                            Loaded {loadSuccessCount} word{loadSuccessCount !== 1 ? "s" : ""} — add more below, then click Generate Crossword to rebuild.
                        </p>
                    )
                }

            </div>



            {/* WORD INPUT */}

            <div className="mt-8 max-w-2xl">


                <div className="flex gap-3 flex-wrap">


                    <input

                        className="border p-2 rounded"

                        placeholder="Answer"

                        value={answer}

                        onChange={
                            e =>
                            setAnswer(
                                e.target.value
                            )
                        }

                    />



                    <input

                        className="border p-2 rounded"

                        placeholder="Clue"

                        value={clue}

                        onChange={
                            e =>
                            setClue(
                                e.target.value
                            )
                        }

                    />



                    <input

                        type="text"

                        placeholder="Clue Image URL (optional)"

                        className="border p-2 rounded w-64"

                        value={imageUrl}

                        onChange={
                            e =>
                            setImageUrl(
                                e.target.value
                            )
                        }

                    />


                </div>


                {
                    imageUrl &&
                    (
                        <img
                            src={imageUrl}
                            alt="preview"
                            className="h-16 rounded border mt-2"
                        />
                    )
                }



                {/* DIFFICULTY / POINTS / HINT PENALTY */}

                <div className="flex gap-3 flex-wrap items-center mt-3">

                    <label className="text-sm">Difficulty:</label>

                    <select

                        value={difficulty}

                        onChange={
                            e =>
                            handleDifficultyChange(
                                e.target.value as Difficulty
                            )
                        }

                        className="border p-2 rounded"

                    >

                        <option value="easy">Easy</option>

                        <option value="medium">Medium</option>

                        <option value="hard">Hard</option>

                    </select>


                    <label className="text-sm">Points:</label>

                    <input

                        type="number"

                        value={points}

                        onChange={
                            e =>
                            setPoints(
                                Number(e.target.value)
                            )
                        }

                        className="border p-2 rounded w-20"

                    />


                    <label className="text-sm">Hint Penalty:</label>

                    <input

                        type="number"

                        value={hintPenalty}

                        onChange={
                            e =>
                            setHintPenalty(
                                Number(e.target.value)
                            )
                        }

                        className="border p-2 rounded w-20"

                    />

                </div>



                {/* HINT BUILDER */}

                <div className="mt-4 border-t pt-4">

                    <h3 className="font-bold text-sm">
                        Hints (optional — revealed one at a time in Player, each can have its own image)
                    </h3>


                    <div className="flex gap-2 flex-wrap mt-2">


                        <input

                            className="border p-2 rounded w-64"

                            placeholder="Hint text"

                            value={hintDraftText}

                            onChange={
                                e =>
                                setHintDraftText(
                                    e.target.value
                                )
                            }

                        />



                        <input

                            type="text"

                            className="border p-2 rounded w-64"

                            placeholder="Hint Image URL (optional)"

                            value={hintDraftImageUrl}

                            onChange={
                                e =>
                                setHintDraftImageUrl(
                                    e.target.value
                                )
                            }

                        />


                    </div>


                    {
                        hintDraftImageUrl.trim() !== "" &&
                        (
                            <img
                                src={hintDraftImageUrl}
                                alt="hint preview"
                                className="h-16 rounded border mt-2"
                            />
                        )
                    }


                    <button

                        onClick={addDraftHint}

                        className="bg-yellow-500 text-white px-3 py-2 rounded mt-2"

                    >

                        Add Hint

                    </button>



                    {
                        draftHints.length > 0 &&
                        (

                        <div className="mt-2">

                            {
                                draftHints.map(
                                    (hint,index) => (

                                        <div
                                            key={index}
                                            className="flex items-center gap-2 mt-1 text-sm"
                                        >

                                            <span>{index+1}. {hint.text}</span>


                                            {
                                                hint.imageUrl &&
                                                (
                                                    <img
                                                        src={hint.imageUrl}
                                                        alt=""
                                                        className="h-8 rounded border"
                                                    />
                                                )
                                            }


                                            <button

                                                onClick={() => removeDraftHint(index)}

                                                className="text-red-600 text-xs underline"

                                            >

                                                Remove

                                            </button>


                                        </div>

                                    )
                                )
                            }

                        </div>

                        )
                    }

                </div>



                <button

                    onClick={addWord}

                    className="
                    mt-4
                    bg-blue-600
                    text-white
                    px-4
                    py-2
                    rounded
                    "

                >

                    Add Word

                </button>


            </div>




            {/* BULK IMPORT */}

            <div className="mt-6 max-w-2xl">

                <h2 className="text-xl font-bold">
                    Bulk Import
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    One word per line: ANSWER, then a tab or two-plus spaces, then the clue. Add / to append extra hints, e.g. "CAT   Feline pet / Meow-maker". Bulk-imported words get Medium difficulty/points by default — adjust individually above if needed.
                </p>

                <textarea

                    className="
                    border
                    p-2
                    rounded
                    w-full
                    mt-2
                    font-mono
                    text-sm
                    "

                    rows={6}

                    value={bulkText}

                    onChange={
                        e =>
                        setBulkText(
                            e.target.value
                        )
                    }

                />

                <div className="mt-2 flex items-center gap-3">

                    <button

                        onClick={importBulk}

                        className="
                        bg-blue-600
                        text-white
                        px-4
                        py-2
                        rounded
                        "

                    >

                        Import Words

                    </button>


                    {
                        importSkippedCount !== null &&
                        importSkippedCount > 0 &&
                        (
                            <span className="text-sm text-orange-600">
                                Skipped {importSkippedCount} line{importSkippedCount > 1 ? "s" : ""} that didn't match the format.
                            </span>
                        )
                    }

                </div>

            </div>





            {/* WORD LIST */}

            <div
                className="
                mt-6
                "
            >

                <h2
                    className="
                    text-xl
                    font-bold
                    "
                >
                    Words ({words.length})
                </h2>


                {
                    words.map(
                        (word,index)=>(

                            <div
                                key={index}
                                className="
                                mt-2
                                flex
                                items-center
                                "
                            >

                                <b>
                                    {word.answer}
                                </b>

                                {" - "}

                                {word.clue}


                                <span className="text-sm text-gray-500">
                                    {" "}
                                    ({word.difficulty ?? "medium"} · {word.points ?? 10}pts · -{word.hintPenalty ?? 2}/hint)
                                </span>


                                {
                                    word.hints &&
                                    word.hints.length > 0 &&
                                    (
                                        <span className="text-sm text-gray-500">
                                            {" "}
                                            ({word.hints.length} hint{word.hints.length > 1 ? "s" : ""})
                                        </span>
                                    )
                                }

                                {
                                    word.imageUrl &&
                                    (
                                        <img
                                            src={word.imageUrl}
                                            alt=""
                                            className="h-8 ml-2 rounded border"
                                        />
                                    )
                                }


                                <button

                                    onClick={() => removeWord(index)}

                                    className="
                                    ml-3
                                    text-xs
                                    text-red-600
                                    underline
                                    whitespace-nowrap
                                    "

                                >

                                    Remove

                                </button>

                            </div>

                        )
                    )
                }


            </div>






            {/* GENERATE BUTTON */}


            <button

                onClick={generate}

                className="
                mt-8
                bg-green-600
                text-white
                px-5
                py-2
                rounded
                "

            >

                Generate Crossword

            </button>



            {
                unplacedAnswers.length > 0 &&
                (
                    <p className="mt-2 text-sm text-orange-600 max-w-2xl">
                        Couldn't fit {unplacedAnswers.length} word{unplacedAnswers.length > 1 ? "s" : ""}: {unplacedAnswers.join(", ")}. They're left out of this puzzle for now.
                    </p>
                )
            }



            {/* SUPER-ANSWER CONTROLS */}

            {
                grid.length > 0 &&
                (

                <div className="mt-4 flex items-center gap-3">

                    <button

                        onClick={
                            () =>
                            setMarkingSuperAnswer(!markingSuperAnswer)
                        }

                        className={`
                        px-4
                        py-2
                        rounded
                        text-white
                        ${
                            markingSuperAnswer
                            ? "bg-orange-600"
                            : "bg-gray-600"
                        }
                        `}

                    >

                        {
                            markingSuperAnswer
                            ? "Done Marking Super-Answer"
                            : "Mark Super-Answer"
                        }

                    </button>


                    {
                        superAnswer.length > 0 &&
                        (
                            <span className="font-bold">
                                Super-Answer: {superAnswerText}
                            </span>
                        )
                    }

                </div>

                )
            }



            {/* PUBLISH BUTTON */}

            {
                grid.length > 0 &&
                (

                <div className="mt-4 max-w-2xl">

                    <button

                        onClick={publish}

                        disabled={publishing}

                        className="
                        bg-purple-600
                        text-white
                        px-5
                        py-2
                        rounded
                        disabled:opacity-50
                        "

                    >

                        {publishing ? "Publishing..." : "Publish to Player"}

                    </button>

{
                        published &&
                        (
                            <span className="ml-3 text-green-600 font-bold">
                                Published — open Player to try it.
                            </span>
                        )
                    }


                    {
                        publishError &&
                        shareLink &&
                        (
                            <p className="mt-2 text-sm text-orange-600">
                                Couldn't save a local preview copy in this browser (storage full or restricted) — but the share link below is self-contained and works on its own regardless.
                            </p>
                        )
                    }


                    {
                        publishError &&
                        !shareLink &&
                        (
                            <p className="mt-2 text-sm text-red-600 font-bold">
                                Publish failed completely — browser storage is full or restricted, and the share link couldn't be generated either. Check the browser console for the exact error.
                            </p>
                        )
                    }



                    {
                        shareLink &&
                        (

                        <div className="mt-3 flex items-center gap-2">

                            <input

                                readOnly

                                value={shareLink}

                                onClick={
                                    e =>
                                    (e.target as HTMLInputElement).select()
                                }

                                className="border p-2 rounded flex-1 text-sm"

                            />


                            <button

                                onClick={copyLink}

                                className="bg-gray-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap"

                            >

                                {linkCopied ? "Copied!" : "Copy Link"}

                            </button>

                        </div>

                        )
                    }



                    {
                        shareLinkTooLong &&
                        (
                            <p className="mt-2 text-sm text-orange-600">
                                This puzzle is too large to fit in a shareable link. It's still saved for you to test in Player on this browser.
                            </p>
                        )
                    }

                </div>

                )
            }



            {
                markingSuperAnswer &&
                (
                    <p className="mt-2 text-sm text-gray-500">
                        Click letters in the grid, in order, to build the super-answer. Click a marked cell again to remove it.
                    </p>
                )
            }




            {/* CROSSWORD GRID */}


            <div
                className="mt-10 overflow-auto"
                style={{maxWidth:"100%", maxHeight:"80vh"}}
            >

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, ${cellPx}px)`,
                    gridTemplateRows: `repeat(${grid.length}, ${cellPx}px)`,
                    fontSize: Math.max(8, Math.floor(cellPx * 0.5))
                }}
            >

            {
                grid.map(
                    (row,rowIndex)=>
                    row.map(
                        (cell,colIndex)=>{


                        const superOrder =
                            getSuperAnswerOrder(
                                rowIndex,
                                colIndex
                            );


                        return (


                        <div

                            key={`${rowIndex}-${colIndex}`}

                            onClick={
                                () =>
                                handleCellClick(
                                    rowIndex,
                                    colIndex,
                                    cell.isBlack
                                )
                            }

                            className={`
                            border
                            relative
                            flex
                            items-center
                            justify-center
                            font-bold

                            ${
                                cell.isBlack
                                ?
                                "bg-black"
                                :
                                "bg-white text-black"
                            }

                            ${
                                markingSuperAnswer &&
                                !cell.isBlack
                                ?
                                "cursor-pointer"
                                :
                                ""
                            }

                            ${
                                superOrder
                                ?
                                "ring-2 ring-orange-500"
                                :
                                ""
                            }

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
                                "
                            >

                                {cell.number}

                            </span>

                            )
                        }



                        {
                            !cell.isBlack &&
                            cell.letter
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
                                "
                            >

                                {superOrder}

                            </span>

                            )
                        }


                        </div>


                        );

                        }
                    )
                )
            }

            </div>

            </div>



        </div>

    );

}