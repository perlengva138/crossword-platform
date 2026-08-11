import { useState, useEffect } from "react";

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




// picks a cell size (px) that makes the grid fit within the given available
// width/height, instead of assuming a fixed 700px box. this is what lets a
// small, cropped grid render as large, easy-to-read squares, and a big grid
// shrink just enough to still fit on screen without scrolling.
export function computeCellPx(
    gridSize:number,
    maxWidthPx:number = 700,
    maxHeightPx:number = 700
):number {

    if(gridSize <= 0)
        return 40;


    const maxByWidth =
        Math.floor(maxWidthPx / gridSize);


    const maxByHeight =
        Math.floor(maxHeightPx / gridSize);


    return Math.max(
        16,
        Math.min(48, maxByWidth, maxByHeight)
    );

}




// tracks the browser window's size, so grid containers can recompute cell
// size on resize instead of relying on a value calculated once at load.
export function useViewportSize() {

    const [size, setSize] =
        useState({
            width:
                typeof window !== "undefined"
                ? window.innerWidth
                : 1200,

            height:
                typeof window !== "undefined"
                ? window.innerHeight
                : 800
        });


    useEffect(
        () => {

            function handleResize() {

                setSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                });

            }


            window.addEventListener("resize", handleResize);


            return () =>
                window.removeEventListener("resize", handleResize);

        },
        []
    );


    return size;

}