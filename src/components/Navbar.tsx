import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";


export default function Navbar() {

  return (

    <nav
      className="
      flex
      justify-between
      items-center
      p-5
      border-b
      "
    >

      <h1 className="font-bold text-xl">
        Crossword Platform
      </h1>


      <div
        className="
        flex
        gap-5
        items-center
        "
      >

        <Link to="/">
          Home
        </Link>

        <Link to="/admin">
          Admin
        </Link>           
           
        <Link to="/admin/editor">
        Editor
        </Link>

        <Link to="/play">
          Play
        </Link>


        <ThemeToggle />

      </div>


    </nav>

  );

}