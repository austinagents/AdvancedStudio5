import React from "react";
import {createRoot} from "react-dom/client";
import {AdvancedStudio2App} from "./AdvancedStudio2App";
import "./advanced-studio2.css";

createRoot(document.getElementById("advanced-studio2-root")!).render(
  <React.StrictMode>
    <AdvancedStudio2App />
  </React.StrictMode>,
);
