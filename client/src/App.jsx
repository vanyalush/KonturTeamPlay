import './App.css'
import {BrowserRouter} from "react-router-dom"
import Header from "./components/Header.jsx";
import AppRouter from "./components/AppRouter.jsx";

function App() {

  return (
      <BrowserRouter>
          <Header />
          <AppRouter/>
      </BrowserRouter>
  )
}

export default App
