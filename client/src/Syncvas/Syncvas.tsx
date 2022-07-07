import React, { useState } from "react";
import "./css/Syncvas.css";
import {
  Arrow,
  Circle,
  DrawingElement,
  Freehand,
  Line,
  Rectangle,
  TextElement,
} from "./DrawingElements";
import { DrawingSurfaces } from "./DrawingSurfaces";
import { ToolBar } from "./ToolBar";

/**
 * A syncronous canvas drawing object. You just need to provide it
 * with a `WebSocket` object which it will have to use for sending
 * drawing events back and forth between devices
 *
 * ---
 * @param props The react props, including the `WebSocket` to be used for sending drawing events back and forth
 * @returns The root element of the Synchronous Canvas
 */
export function Syncvas({ webSocket }: { webSocket: WebSocket }) {
  let [currentTool, setCurrentTool] = useState<Tool>("freehand");
  let [currentColor, setCurrentColor] = useState("black");
  let [currentFontSize, setCurrentFontSize] = useState(32);
  let [drawingElements, setDrawingElements] = useState<Array<DrawingElement>>(
    []
  );

  let sendMessage = (event: DrawingElement | UndoEvent | ClearCanvasEvent) => {
    webSocket.send(
      JSON.stringify({ type: "drawingEvent", data: event.serialize() })
    );
  };

  let addDrawingElement = (element: DrawingElement) => {
    setDrawingElements([...drawingElements, element]);
  };

  let undo = () => {
    if (drawingElements.length > 0) {
      setDrawingElements(drawingElements.slice(0, drawingElements.length - 1));
    }
  };

  let clearCanvas = () => {
    setDrawingElements([]);
  };

  setSocketMessageHandler(
    webSocket,
    undo,
    clearCanvas,
    addDrawingElement,
    setDrawingElements,
    drawingElements
  );

  return (
    <div className="svg-canvas">
      <DrawingSurfaces
        currentTool={currentTool}
        currentColor={currentColor}
        fontSize={currentFontSize}
        addDrawingElement={(element) => {
          sendMessage(element);
          addDrawingElement(element);
        }}
        drawingElements={drawingElements}
      />
      <ToolBar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        currentFontSize={currentFontSize}
        setCurrentFontSize={setCurrentFontSize}
        undo={() => {
          sendMessage(new UndoEvent());
          undo();
        }}
        clearCanvas={() => {
          sendMessage(new ClearCanvasEvent());
          clearCanvas();
        }}
      />
    </div>
  );
}

function setSocketMessageHandler(
  webSocket: WebSocket,
  undo: () => void,
  clearCanvas: () => void,
  addDrawingElement: (element: DrawingElement) => void,
  setDrawingElements: React.Dispatch<React.SetStateAction<DrawingElement[]>>,
  drawingElements: DrawingElement[]
) {
  webSocket.onmessage = function (event) {
    const { data } = event;

    const parsedMsg = JSON.parse(data);

    console.log(parsedMsg);

    let handleEvent = (
      event: DrawingElement | UndoEvent | ClearCanvasEvent | null
    ) => {
      if (event) {
        if (event instanceof UndoEvent) {
          undo();
        } else if (event instanceof ClearCanvasEvent) {
          clearCanvas();
        } else {
          addDrawingElement(event);
        }
      }
    };

    if (parsedMsg.type === "drawingEvent") {
      handleEvent(messageToDrawingEvent(parsedMsg.data));
    } else if (parsedMsg.type === "accumulatedState") {
      setDrawingElements([
        ...drawingElements,
        ...((parsedMsg.data as Array<string>)
          .map(messageToDrawingEvent)
          .filter((val) => val != null) as Array<DrawingElement>),
      ]);
    }
  };
}

function messageToDrawingEvent(
  message: string
): DrawingElement | UndoEvent | ClearCanvasEvent | null {
  let parsedMessage: { type: string; data: any } = JSON.parse(message);

  switch (parsedMessage.type) {
    case "Line":
      return new Line(
        parsedMessage.data.points,
        parsedMessage.data.color,
        parsedMessage.data.id
      );
    case "Arrow":
      return new Arrow(
        parsedMessage.data.points,
        parsedMessage.data.color,
        parsedMessage.data.id
      );
    case "Circle":
      return new Circle(
        parsedMessage.data.points,
        parsedMessage.data.color,
        parsedMessage.data.id
      );
    case "Rectangle":
      return new Rectangle(
        parsedMessage.data.points,
        parsedMessage.data.color,
        parsedMessage.data.id
      );
    case "Freehand":
      return new Freehand(
        parsedMessage.data.points,
        parsedMessage.data.color,
        parsedMessage.data.id
      );
    case "Text":
      return new TextElement(
        parsedMessage.data.text,
        parsedMessage.data.x,
        parsedMessage.data.y,
        parsedMessage.data.color,
        parsedMessage.data.fontSize,
        parsedMessage.data.id
      );
    case "undo":
      return new UndoEvent();
    case "clearCanvas":
      return new ClearCanvasEvent();
    default:
      return null;
  }
}

export type TwoVertexTool = "circle" | "rectangle" | "arrow" | "line";

export type Point = { x: number; y: number };

export type Tool = TwoVertexTool | "freehand" | "text";

class UndoEvent {
  serialize() {
    return JSON.stringify({ type: "undo" });
  }
}

class ClearCanvasEvent {
  serialize() {
    return JSON.stringify({ type: "clearCanvas" });
  }
}
