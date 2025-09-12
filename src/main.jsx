import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Routing from "./routes/Routing";
import "./index.css";
import SessionProvider from "./context/SessionProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SessionProvider>
    <BrowserRouter>
      <Routing />
    </BrowserRouter>
  </SessionProvider>
);
