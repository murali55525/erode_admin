import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import AdminProductManagement from "./add";
// Import other pages as needed

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Welcome to FancyStore Admin</h1>} />
        <Route path="/products" element={<AdminProductManagement />} />
        <Route path="/categories" element={<h1>Categories Management</h1>} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;