import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MainPage from "./MainPage";
import SensorPage from "./SensorPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="navbar">
        <Link to="/">🌾 ফসল সুপারিশ</Link>
        <Link to="/sensor">📡 সেন্সর ডাটা</Link>
      </div>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/sensor" element={<SensorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
