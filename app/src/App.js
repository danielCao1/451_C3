import "./App.css";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Home />
    </BrowserRouter>
  );
};

export default App;
