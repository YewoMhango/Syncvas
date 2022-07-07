import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Syncvas } from "./Syncvas/Syncvas";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

//Websocket variables
const url = "ws://localhost:9876/myWebsocket";
const wsServer = new WebSocket(url);

root.render(
  <React.StrictMode>
    <Syncvas webSocket={wsServer} />
  </React.StrictMode>
);
