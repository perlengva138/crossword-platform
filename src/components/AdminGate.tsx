import { useState, type ReactNode } from "react";


const STORAGE_KEY = "crossword:admin-unlocked";

const ADMIN_PASSPHRASE = import.meta.env.VITE_ADMIN_PASSPHRASE ?? "changeme";



export default function AdminGate({ children }: { children: ReactNode }) {

    console.log("AdminGate is rendering. Stored unlock value:", localStorage.getItem(STORAGE_KEY));


    const [unlocked, setUnlocked] =
        useState(() => localStorage.getItem(STORAGE_KEY) === "true");


    const [input, setInput] = useState("");

    const [error, setError] = useState(false);



    function handleSubmit() {

        if(input === ADMIN_PASSPHRASE){

            localStorage.setItem(STORAGE_KEY, "true");

            setUnlocked(true);

            setError(false);

        } else {

            setError(true);

        }

    }



    if(unlocked){

        return <>{children}</>;

    }



    return (

        <div className="p-10 max-w-sm">

            <h1 className="text-2xl font-bold">Admin Access</h1>

            <p className="text-sm text-gray-500 mt-2">
                This area is for puzzle creators only.
            </p>


            <input

                type="password"

                value={input}

                onChange={e => setInput(e.target.value)}

                onKeyDown={e => e.key === "Enter" && handleSubmit()}

                className="border p-2 rounded w-full mt-4"

                placeholder="Passphrase"

            />


            <button

                onClick={handleSubmit}

                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"

            >

                Enter

            </button>


            {
                error &&
                (
                    <p className="text-red-600 text-sm mt-2">
                        Incorrect passphrase.
                    </p>
                )
            }

        </div>

    );

}