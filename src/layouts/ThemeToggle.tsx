import { useState } from "react";


export default function ThemeToggle() {

  const [dark, setDark] = useState(false);


  function toggle() {

    setDark(!dark);

    document.documentElement.classList.toggle(
      "dark"
    );

  }


  return (

    <button

      onClick={toggle}

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