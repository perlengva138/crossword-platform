import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";


export default function MainLayout() {

  return (

    <div
      className="
      min-h-screen
      bg-white
      text-black
      dark:bg-gray-900
      dark:text-white
      "
    >

      <Navbar />

      <main>
        <Outlet />
      </main>

    </div>

  );

}