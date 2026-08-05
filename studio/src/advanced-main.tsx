import React from "react";
import {createRoot} from "react-dom/client";
import {AdvancedStudioApp} from "./AdvancedStudioApp";
import "./advanced-studio.css";

createRoot(document.getElementById("advanced-studio-root")!).render(
  <React.StrictMode>
    <AdvancedStudioApp />
  </React.StrictMode>,
);
