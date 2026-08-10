import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import AdminGate from "./components/AdminGate";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Player from "./pages/Player";
import Editor from "./pages/Editor";


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
element={<AdminGate><Admin/></AdminGate>}
/>

<Route
path="/play"
element={<Player/>}
/>

<Route
path="/admin/editor"
element={<AdminGate><Editor/></AdminGate>}
/>

</Route>

</Routes>

</BrowserRouter>

)

}