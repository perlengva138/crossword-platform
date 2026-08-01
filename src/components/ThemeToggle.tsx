import { useState } from "react";


export default function ThemeToggle() {

  const [dark, setDark] = useState(false);


  function toggleTheme() {

    const newMode = !dark;

    setDark(newMode);

    document.documentElement.classList.toggle(
      "dark",
      newMode
    );

  }


  return (

    <button

      onClick={toggleTheme}

      className="
      rounded-lg
      px-4
      py-2
      bg-black
      text-white
      dark:bg-white
      dark:text-black
      "

    >

      {
        dark
        ? "☀️ Light"
        : "🌙 Dark"
      }

    </button>

  );

}