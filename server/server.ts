import WebSocket from "ws";
import express from "express";
import path from "path";

const app = express();

app.use("/", express.static(path.resolve(__dirname, "../client")));

const myServer = app.listen(9876, () =>
    console.log("Server started on http://localhost:9876")
); // regular http server using node express which serves your webpage

const wsServer = new WebSocket.Server({
    noServer: true,
}); // a websocket server

let accumulatedState: any[] = [];

wsServer.on("connection", function (ws) {
    if (accumulatedState.length > 0) {
        ws.send(
            JSON.stringify({
                type: "accumulatedState",
                data: accumulatedState,
            })
        );
    }

    // what should a websocket do on connection
    ws.on("message", function (__msg) {
        const msg = __msg.toString();

        let parsedMsg = JSON.parse(msg);
        console.log(parsedMsg.data.type);

        if (parsedMsg.type == "drawingEvent") {
            const innerParsedMsg = JSON.parse(parsedMsg.data);
            console.log(innerParsedMsg);

            if (innerParsedMsg.type == "undo") {
                accumulatedState.pop();
            } else if (innerParsedMsg.type == "clearCanvas") {
                accumulatedState = [];
            } else {
                accumulatedState.push(parsedMsg.data);
            }
            console.log("\nAccumulated state:", accumulatedState);
        }

        // what to do on message event
        console.log(`\nMessage received:`, msg);

        wsServer.clients.forEach(function (client) {
            if (client.readyState === WebSocket.OPEN && ws !== client) {
                // check if client is ready
                client.send(msg);
            }
        });
    });
});

myServer.on("upgrade", async function upgrade(request, socket, head) {
    //handling upgrade(http to websocket) event

    //emit connection when request accepted
    wsServer.handleUpgrade(request, socket, head, function done(ws) {
        wsServer.emit("connection", ws, request);
    });
});
