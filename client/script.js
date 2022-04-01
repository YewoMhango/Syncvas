import Syncvas from "./Syncvas/Syncvas.js";

//Websocket variables
const url = "ws://localhost:9876/myWebsocket";
const mywsServer = new WebSocket(url);

let canvas = new Syncvas(
    document.querySelector("#canvas-container"),
    (message) => {
        mywsServer.send(
            JSON.stringify({ type: "drawingEvent", data: message })
        );
    }
);

//enabling send message when connection is open
mywsServer.onopen = function () {
    // sendBtn.disabled = false;
};

//handling message event
mywsServer.onmessage = function (event) {
    const { data } = event;

    const parsedMsg = JSON.parse(data);

    console.log(parsedMsg);

    if (parsedMsg.type == "drawingEvent") {
        canvas.draw(parsedMsg.data);
    } else if (parsedMsg.type == "accumulatedState") {
        for (let element of parsedMsg.data) {
            canvas.draw(element);
        }
    }
};
