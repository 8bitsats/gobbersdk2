// Buffer is required by the Solana web3.js
import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";

window.Buffer = Buffer;

// Polyfill for TextEncoder in older browsers
if (typeof window.TextEncoder === "undefined") {
  window.TextEncoder = TextEncoder;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
