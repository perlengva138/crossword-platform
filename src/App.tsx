import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Player from "./pages/Player";


export default function App(){

return (

<BrowserRouter>

<Routes>

<Route element={<MainLayout/>}>

<Route 
path="/" 
element={<Home/>}
/>

<Route
path="/admin"
element={<Admin/>}
/>

<Route
path="/play"
element={<Player/>}
/>

</Route>

</Routes>

</BrowserRouter>

)

}