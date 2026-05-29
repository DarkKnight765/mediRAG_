import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./styles/animations.css";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
