import React, { useRef, useState } from "react";
import {
  TextElement,
  Arrow,
  Circle,
  Freehand,
  Line,
  Rectangle,
  DrawingElement,
} from "./DrawingElements";
import { Tool, Point, TwoVertexTool } from "./Syncvas";

/**
 * This contains the two SVG elements (one on top of another)
 * which are used for drawing things onto the screen. The top
 * SVG element is the one which interacts directly with the
 * user's pointing device, while the lower canvas contains
 * objects which the user has finished drawing
 *
 * ---
 * @param props The react props
 * @returns The two SVG drawing elements
 */
export function DrawingSurfaces({
  currentTool,
  currentColor,
  addDrawingElement,
  drawingElements,
  fontSize,
}: {
  currentTool: Tool;
  currentColor: string;
  fontSize: number;
  addDrawingElement: (element: DrawingElement) => void;
  drawingElements: Array<DrawingElement>;
}) {
  let [currentlyDrawing, setCurrentlyDrawing] =
    useState<CurrentlyDrawing>(false);

  let topCanvasRef = useRef<SVGSVGElement>(null);

  /**
   * This reacts to when the user places their pointer onto the top
   * SVG element to start drawing
   *
   * ---
   * @param event The pointer event
   */
  const onPointerDown = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    if (currentTool !== "text") {
      event.preventDefault();

      const topCanvas = topCanvasRef.current as SVGSVGElement;
      const coordinates = pointerPosition(event, topCanvas);

      setCurrentlyDrawing({
        type: currentTool,
        points: [coordinates, coordinates],
        color: currentColor,
      });
    }
  };

  /**
   * This reacts to when the user moves the pointer across the top SVG element while drawing
   *
   * ---
   * @param event The pointer event
   */
  const onPointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();

    if (currentlyDrawing) {
      if (currentlyDrawing.type !== "text") {
        event.preventDefault();

        const topCanvas = topCanvasRef.current as SVGSVGElement;
        const coordinates = pointerPosition(event, topCanvas);

        if (currentlyDrawing.type === "freehand") {
          setCurrentlyDrawing({
            type: "freehand",
            points: [...currentlyDrawing.points, coordinates],
            color: currentlyDrawing.color,
          });
        } else {
          setCurrentlyDrawing({
            type: currentlyDrawing.type,
            points: [currentlyDrawing.points[0], coordinates],
            color: currentlyDrawing.color,
          });
        }
      }
    }
  };

  /**
   * This reacts to when the user releases the pointer from the top SVG
   * element when they are done drawing
   */
  const onDrawingDone = () => {
    let drawingElement = getCurrentlyDrawingElement(currentlyDrawing);

    if (drawingElement) {
      addDrawingElement(drawingElement);
    }

    setCurrentlyDrawing(false);
  };

  /**
   * Reacts to when the user clicks on the top SVG element to write text
   *
   * ---
   * @param event The pointer event
   */
  const onClick = (event: React.MouseEvent) => {
    if (currentTool === "text") {
      event.preventDefault();

      const topCanvas = topCanvasRef.current as SVGSVGElement;
      const coordinates = pointerPosition(event, topCanvas);

      setCurrentlyDrawing({
        type: "text",
        color: currentColor,
        fontSize: fontSize,
        text: "",
        x: coordinates.x,
        y: coordinates.y - fontSize / 2,
        scale: getCanvasScaleAndRect(topCanvas).scale,
      });
    }
  };

  /**
   * Used to update the scale of the text to ensure that it's
   * properly sized
   */
  window.onresize = () => {
    if (currentlyDrawing && currentlyDrawing.type === "text") {
      const topCanvas = topCanvasRef.current as SVGSVGElement;

      setCurrentlyDrawing({
        ...currentlyDrawing,
        ...{
          scale: getCanvasScaleAndRect(topCanvas).scale,
        },
      });
    }
  };

  return (
    <div
      className="canvases"
      style={{ cursor: currentTool === "text" ? "text" : undefined }}
    >
      <svg viewBox="0 0 800 650" className="bottom-canvas">
        {drawingElements.map((element) => element.asSvg())}
      </svg>
      <svg
        viewBox="0 0 800 650"
        className="top-canvas"
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        onMouseMove={onPointerMove}
        onTouchMove={onPointerMove}
        onMouseUp={onDrawingDone}
        onTouchEnd={onDrawingDone}
        onClick={onClick}
        ref={topCanvasRef}
      >
        {getCurrentlyDrawingElement(currentlyDrawing)?.asSvg()}
      </svg>
      {currentlyDrawing && currentlyDrawing.type === "text" && (
        <CanvasTextInput
          currentlyDrawing={currentlyDrawing}
          fontSize={fontSize}
          onDrawingDone={onDrawingDone}
          setCurrentlyDrawing={setCurrentlyDrawing}
        />
      )}
    </div>
  );
}

/**
 * Used to input text on the drawing canvas
 *
 * ---
 * @param param0 React props
 * @returns A React JSX Input element
 */
function CanvasTextInput({
  currentlyDrawing,
  fontSize,
  onDrawingDone,
  setCurrentlyDrawing,
}: {
  currentlyDrawing: {
    type: "text";
    x: number;
    y: number;
    text: string;
    fontSize: number;
    color: string;
    scale: number;
  };
  fontSize: number;
  onDrawingDone: () => void;
  setCurrentlyDrawing: React.Dispatch<React.SetStateAction<CurrentlyDrawing>>;
}) {
  return (
    <input
      value={currentlyDrawing.text}
      className="canvas-text-input"
      type="text"
      style={{
        top:
          (currentlyDrawing.y - 3) * currentlyDrawing.scale * (fontSize / 32),
        left: currentlyDrawing.x * currentlyDrawing.scale,
        fontSize: currentlyDrawing.fontSize * currentlyDrawing.scale,
        color: currentlyDrawing.color,
      }}
      autoFocus={true}
      onBlur={onDrawingDone}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onDrawingDone();
        }
      }}
      onChange={(event) =>
        setCurrentlyDrawing(
          currentlyDrawing
            ? currentlyDrawing.type === "text"
              ? {
                  ...currentlyDrawing,
                  text: event.target.value,
                }
              : currentlyDrawing
            : currentlyDrawing
        )
      }
    />
  );
}

/**
 * Transforms a description of the drawing object the user
 * was/is currently drawing into an actual `DrawingElement`
 * object
 *
 * ---
 * @param currentlyDrawing A description of the drawing element the user was/is currently drawing
 * @returns A `DrawingElement` object`
 */
function getCurrentlyDrawingElement(
  currentlyDrawing: CurrentlyDrawing
): DrawingElement | null {
  if (currentlyDrawing) {
    switch (currentlyDrawing.type) {
      case "freehand":
        return new Freehand(
          currentlyDrawing.points,
          currentlyDrawing.color,
          Date.now()
        );
      case "line":
        return new Line(
          currentlyDrawing.points,
          currentlyDrawing.color,
          Date.now()
        );
      case "arrow":
        return new Arrow(
          currentlyDrawing.points,
          currentlyDrawing.color,
          Date.now()
        );
      case "circle":
        return new Circle(
          currentlyDrawing.points,
          currentlyDrawing.color,
          Date.now()
        );
      case "rectangle":
        return new Rectangle(
          currentlyDrawing.points,
          currentlyDrawing.color,
          Date.now()
        );
      case "text":
        return new TextElement(
          currentlyDrawing.text,
          currentlyDrawing.x,
          currentlyDrawing.y,
          currentlyDrawing.color,
          currentlyDrawing.fontSize,
          Date.now()
        );
    }
  } else {
    return null;
  }
}

/**
 * Gets the rendered scale of the top SVG element as well
 * as returning the bounding client rectangle
 *
 * ---
 * @param topCanvas The top SVG canvas object object
 * @returns The scale of the top SVG canvas object in relation to its viewbox
 */
function getCanvasScaleAndRect(topCanvas: SVGSVGElement) {
  const rect = topCanvas.getBoundingClientRect();
  const scale = rect.width / topCanvas.width.baseVal.value;
  return { scale, rect };
}

/**
 * Determines the x and y values of where the user clicked on the screen
 * relative to the coordinates used in the SVG element. When the element
 * is scaled up or down in size, the width and height values will differ
 * from the SVG element property values
 *
 * ---
 * @param pointerEvent A Mouse or Touch event object
 * @param domNode Clicked SVG element
 * @returns The position where the user clicked
 */
function pointerPosition(
  pointerEvent: React.MouseEvent | React.TouchEvent,
  domNode: SVGSVGElement
): Point {
  let pos: HasClientXAndY;

  /* 
    At first, the condition was `if(pointerEvent instanceof TouchEvent)`
    but it turns out that TouchEvent is not defined in the 
    browser's global scope, so that gives you an error 
  */
  if ((pointerEvent as any).touches) {
    pos = (pointerEvent as any).touches[0] as HasClientXAndY;
  } else {
    pos = pointerEvent as HasClientXAndY;
  }

  const { scale, rect } = getCanvasScaleAndRect(domNode);

  return {
    x: Math.floor((pos.clientX - rect.left) / scale),
    y: Math.floor((pos.clientY - rect.top) / scale),
  };
}

/**
 * Represents an unfinished drawing (when not equal to false)
 * for when the user is still drawing or typing
 */
export type CurrentlyDrawing =
  | false
  | { type: TwoVertexTool; points: [Point, Point]; color: string }
  | { type: "freehand"; points: [Point, Point, ...Point[]]; color: string }
  | {
      type: "text";
      x: number;
      y: number;
      text: string;
      fontSize: number;
      color: string;
      scale: number;
    };

export interface HasClientXAndY {
  clientX: number;
  clientY: number;
}
