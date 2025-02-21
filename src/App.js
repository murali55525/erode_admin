import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import AddProduct from "./add"; // Ensure your component is exported as AddProduct in add.js

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Add Product</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<AddProduct />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
