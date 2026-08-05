import React from "react";
import {createRoot} from "react-dom/client";
import {AdvancedStudio5App} from "./AdvancedStudio5App";
import "./advanced-studio5.css";

createRoot(document.getElementById("advanced-studio5-root")!).render(
  <React.StrictMode>
    <AdvancedStudio5App />
  </React.StrictMode>,
);
