import {
useState
} from "react";


import {
generateCrossword
} from "../crossword/generator";


import type {
CrosswordWord
} from "../crossword/types";



export default function Editor(){


const [words,setWords]
=
useState<CrosswordWord[]>([]);



const [answer,setAnswer]
=
useState("");



const [clue,setClue]
=
useState("");



const [grid,setGrid]
=
useState<string[][]>([]);




function addWord(){


setWords(
[
...words,
{
answer,
clue
}
]
);


setAnswer("");
setClue("");

}



function generate(){


setGrid(
generateCrossword(words)
);


}




return (

<div className="p-10">


<h1 className="
text-4xl
font-bold
">

Crossword Editor

</h1>



<div className="
mt-8
flex
gap-3
">


<input

className="
border
p-2
"

placeholder="Answer"

value={answer}

onChange={
e=>setAnswer(e.target.value)
}

/>



<input

className="
border
p-2
"

placeholder="Clue"

value={clue}

onChange={
e=>setClue(e.target.value)
}

/>


<button

onClick={addWord}

className="
bg-blue-500
text-white
px-4
"

>

Add

</button>


</div>



<button

onClick={generate}

className="
mt-5
bg-green-600
text-white
px-5
py-2
"

>

Generate Crossword

</button>



<div className="
mt-10
">

{
grid.map(
(row,i)=>(

<div
key={i}
className="flex"
>

{
row.map(
(cell,j)=>(

<div

key={j}

className="
w-8
h-8
border
text-center
"

>

{cell}

</div>

))

}

</div>

)
)

}


</div>


</div>

)

}