import React from "react";
import { Point } from "./Syncvas";

const STROKE_WIDTH = 3;

/**
 * An abstract base class representing any drawing element used in the app
 */
export abstract class DrawingElement {
  abstract id: number;
  abstract color: string;
  /**
   * Returns the drawing as a React SVG element
   */
  abstract asSvg(): JSX.Element;
  /**
   * Serializes the drawing element as a string for easier sending
   */
  abstract serialize(): string;
}

/**
 * A superclass for any drawing element which can be
 * properly represented by only two vertices (corners)
 */
abstract class DrawingElementWithTwoVertices extends DrawingElement {
  points: [Point, Point];
  color: string;
  id: number;

  constructor(points: [Point, Point], color: string, id: number) {
    super();
    this.points = points;
    this.color = color;
    this.id = id;
  }
}

/**
 * A drawing element which allows a user to draw a
 * free-form line (or a scribble)
 */
export class Freehand extends DrawingElement {
  points: Point[];
  color: string;
  id: number;

  constructor(points: Array<Point>, color: string, id: number) {
    super();
    this.points = points;
    this.color = color;
    this.id = id;
  }

  asSvg(): JSX.Element {
    /**
     * The (x,y) values on `d` attribute of the `path` SVG element
     * represent the distance from the previous point in the path,
     * rather than the distance from the origin. So, we have to do
     * the neccessary conversion by subtracting each (x,y) value
     * in `this.points` from the previous one
     */
    let pathString =
      "m" +
      this.points
        .map((value, index, array) =>
          index > 0
            ? {
                x: value.x - array[index - 1].x,
                y: value.y - array[index - 1].y,
              }
            : value
        )
        .reduce((prev, curr) => prev + `${curr.x} ${curr.y} `, "");

    return (
      <path
        d={pathString}
        stroke={this.color}
        strokeWidth={STROKE_WIDTH}
        fill="none"
        key={this.id}
      />
    );
  }

  serialize() {
    return JSON.stringify({ type: "Freehand", data: this });
  }
}

/**
 * A circle drawing
 */
export class Circle extends DrawingElementWithTwoVertices {
  asSvg(): JSX.Element {
    let [start, end] = this.points;

    let rx = Math.abs(start.x - end.x) / 2;
    let ry = Math.abs(start.y - end.y) / 2;
    let cx = Math.min(start.x, end.x) + rx;
    let cy = Math.min(start.y, end.y) + ry;

    return (
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={this.color}
        strokeWidth={STROKE_WIDTH}
        key={this.id}
      />
    );
  }

  serialize() {
    return JSON.stringify({
      type: "Circle",
      data: this,
    });
  }
}

/**
 * A rectangle drawing
 */
export class Rectangle extends DrawingElementWithTwoVertices {
  asSvg(): JSX.Element {
    let [start, end] = this.points;

    return (
      <rect
        x={Math.min(start.x, end.x)}
        y={Math.min(start.y, end.y)}
        width={Math.abs(start.x - end.x)}
        height={Math.abs(start.y - end.y)}
        fill="none"
        stroke={this.color}
        strokeWidth={STROKE_WIDTH}
        key={this.id}
      />
    );
  }

  serialize() {
    return JSON.stringify({
      type: "Rectangle",
      data: this,
    });
  }
}

/**
 * An arrow drawing
 */
export class Arrow extends DrawingElementWithTwoVertices {
  asSvg(): JSX.Element {
    let [start, end] = this.points;

    let pathString = `m${start.x} ${start.y} ${end.x - start.x} ${
      end.y - start.y
    }`;

    let angle =
      (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI + 90;

    return (
      <g key={this.id}>
        <path d={pathString} stroke={this.color} strokeWidth={STROKE_WIDTH} />
        <path
          transform={`translate(${end.x}, ${end.y}) rotate(${angle}) scale(.4)`}
          d="m0-34.641-28.265 59.101 28.265-11.385 28.265 11.385z"
          fill={this.color}
        />
      </g>
    );
  }

  serialize() {
    return JSON.stringify({
      type: "Arrow",
      data: this,
    });
  }
}

/**
 * A straight line drawing
 */
export class Line extends DrawingElementWithTwoVertices {
  asSvg(): JSX.Element {
    let [start, end] = this.points;

    return (
      <path
        d={`m${start.x} ${start.y} ${end.x - start.x} ${end.y - start.y}`}
        stroke={this.color}
        strokeWidth={STROKE_WIDTH}
        key={this.id}
      />
    );
  }

  serialize() {
    return JSON.stringify({
      type: "Line",
      data: this,
    });
  }
}

/**
 * A text drawing
 */
export class TextElement extends DrawingElement {
  id: number;
  color: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;

  constructor(
    text: string,
    x: number,
    y: number,
    color: string,
    fontSize: number,
    id: number
  ) {
    super();
    this.color = color;
    this.text = text;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.id = id;
  }

  asSvg(): JSX.Element {
    return (
      <text
        x={this.x}
        y={this.y + this.fontSize}
        fill={this.color}
        fontFamily="Open Sans Semibold"
        fontWeight={500}
        fontSize={this.fontSize}
        xmlSpace="preserve"
        key={this.id}
      >
        {this.text}
      </text>
    );
  }

  serialize() {
    return JSON.stringify({ type: "Text", data: this });
  }
}
