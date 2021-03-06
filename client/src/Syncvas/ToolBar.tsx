import React from "react";
import { Tool } from "./Syncvas";

export function ToolBar({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  currentFontSize,
  setCurrentFontSize,
  undo,
  clearCanvas,
}: {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  currentFontSize: number;
  setCurrentFontSize: (fontSize: number) => void;
  clearCanvas: () => void;
  undo: () => void;
}) {
  return (
    <div>
      <div className="toolbar">
        <FreehandTool
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <ArrowTool currentTool={currentTool} setCurrentTool={setCurrentTool} />
        <RectangleTool
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
        />
        <CircleTool currentTool={currentTool} setCurrentTool={setCurrentTool} />
        <LineTool currentTool={currentTool} setCurrentTool={setCurrentTool} />
        <TextTool currentTool={currentTool} setCurrentTool={setCurrentTool} />
        <UndoButton undo={undo} />
        <ClearCanvasButton clearCanvas={clearCanvas} />
      </div>

      <div className="lower-bar">
        <span className="color">
          Color:{" "}
          <input
            type="color"
            id="color"
            value={currentColor}
            onChange={(event) => setCurrentColor(event.target.value)}
          />
        </span>
        <span className="font-size">
          Font size: {currentFontSize}px{" "}
          <input
            type="range"
            id="size"
            value={currentFontSize}
            onChange={(event) => setCurrentFontSize(Number(event.target.value))}
            min="12"
            max="144"
          />
        </span>
      </div>
    </div>
  );
}

/* Button Components ================================================== */

function ClearCanvasButton({ clearCanvas }: { clearCanvas: () => void }) {
  return (
    <button className="clear" onClick={clearCanvas}>
      <svg
        width="42.238"
        height="42.238"
        version="1.1"
        viewBox="0 0 11.176 11.176"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m1.6016 0.94238a0.6599 0.6599 0 0 0-0.46603 0.19322 0.6599 0.6599 0 0 0 0 0.93362l7.971 7.971a0.6599 0.6599 0 0 0 0.93362 0 0.6599 0.6599 0 0 0 0-0.93362l-7.971-7.971a0.6599 0.6599 0 0 0-0.46765-0.19322z"
          style={{ fill: "red" }}
        />
        <path
          d="m9.5743 0.94238a0.6599 0.6599 0 0 0-0.46765 0.19322l-7.971 7.971a0.6599 0.6599 0 0 0 0 0.93362 0.6599 0.6599 0 0 0 0.93362 0l7.971-7.971a0.6599 0.6599 0 0 0 0-0.93362 0.6599 0.6599 0 0 0-0.46603-0.19322z"
          style={{ fill: "red" }}
        />
      </svg>
    </button>
  );
}

function UndoButton({ undo }: { undo: () => void }) {
  return (
    <button className="undo" onClick={undo}>
      <svg
        width="40.886"
        height="32.463"
        version="1.1"
        viewBox="0 0 10.818 8.5892"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path d="m2.1621 0.021484a0.66145 0.66145 0 0 0-0.81055 0.4668l-1.3516 5.0449 5.043 1.3516a0.66145 0.66145 0 0 0 0.81055-0.46875 0.66145 0.66145 0 0 0-0.46875-0.81055l-3.7637-1.0078 1.0078-3.7656a0.66145 0.66145 0 0 0-0.4668-0.81055z" />
          <path d="m5.5586 1.7793a0.66145 0.66145 0 0 0-0.50195 0.064453l-4.5781 2.6426a0.66145 0.66145 0 0 0-0.24219 0.9043 0.66145 0.66145 0 0 0 0.9043 0.24219l4.5781-2.6426a0.66145 0.66145 0 0 0 0.24219-0.9043 0.66145 0.66145 0 0 0-0.40234-0.30664z" />
          <path d="m6.502 1.3633c-0.49507 0.060719-0.98583 0.22022-1.4434 0.48438a0.66145 0.66145 0 0 0-0.24219 0.90234 0.66145 0.66145 0 0 0 0.9043 0.24219c1.2109-0.69913 2.7403-0.28906 3.4395 0.92188 0.69913 1.2109 0.28906 2.7403-0.92188 3.4395a0.66145 0.66145 0 0 0-0.24219 0.9043 0.66145 0.66145 0 0 0 0.9043 0.24219c1.8301-1.0566 2.4609-3.4179 1.4043-5.248-0.79247-1.3726-2.3175-2.0708-3.8027-1.8887z" />
        </g>
      </svg>
    </button>
  );
}

function TextTool({
  currentTool,
  setCurrentTool,
}: {
  currentTool: string;
  setCurrentTool: (tool: Tool) => void;
}) {
  return (
    <button
      className="text"
      data-selected={currentTool === "text" ? "true" : "false"}
      onClick={() => setCurrentTool("text")}
    >
      <svg
        width="37.283"
        height="41.285"
        version="1.1"
        viewBox="0 0 9.8644 10.923"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="matrix(.76938 0 0 .76938 -114.45 -169.84)" aria-label="T">
          <path d="m160.1 225.83-0.3361-3.4282h-9.209l-0.31929 3.4282 1.3276 0.11763 0.3361-2.2182h2.5039v8.268h-1.8317v1.3276h5.2431v-1.3276h-1.8821v-8.268h2.4871l0.33609 2.2182z" />
        </g>
      </svg>
    </button>
  );
}

function LineTool({
  currentTool,
  setCurrentTool,
}: {
  currentTool: string;
  setCurrentTool: (tool: Tool) => void;
}) {
  return (
    <button
      className="line"
      data-selected={currentTool === "line" ? "true" : "false"}
      onClick={() => setCurrentTool("line")}
    >
      <svg
        width="46.888"
        height="46.349"
        version="1.1"
        viewBox="0 0 12.406 12.263"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m10.101 0.9508a1.3422 1.3422 0 0 0-1.3422 1.3422 1.3422 1.3422 0 0 0 0.081215 0.45627l-6.0644 5.9644a1.3422 1.3422 0 0 0-0.47244-0.085583 1.3422 1.3422 0 0 0-1.3422 1.3422 1.3422 1.3422 0 0 0 1.3422 1.3422 1.3422 1.3422 0 0 0 1.3422-1.3422 1.3422 1.3422 0 0 0-0.082522-0.46369l6.0594-5.9599a1.3422 1.3422 0 0 0 0.47854 0.088634 1.3422 1.3422 0 0 0 1.3422-1.3422 1.3422 1.3422 0 0 0-1.3422-1.3422z" />
      </svg>
    </button>
  );
}

function CircleTool({
  currentTool,
  setCurrentTool,
}: {
  currentTool: string;
  setCurrentTool: (tool: Tool) => void;
}) {
  return (
    <button
      className="circle"
      data-selected={currentTool === "circle" ? "true" : "false"}
      onClick={() => setCurrentTool("circle")}
    >
      <svg
        width="53.747"
        height="53.747"
        version="1.1"
        viewBox="0 0 14.221 14.221"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m7.1094 0c-3.9183 0-7.1094 3.1911-7.1094 7.1094 0 3.9183 3.1911 7.1113 7.1094 7.1113 3.9183 0 7.1113-3.1931 7.1113-7.1113 0-3.9183-3.1931-7.1094-7.1113-7.1094zm0 1.4648c3.1268 1e-7 5.6465 2.5177 5.6465 5.6445 0 3.1268-2.5197 5.6465-5.6465 5.6465-3.1268 0-5.6445-2.5197-5.6445-5.6465 1e-7 -3.1268 2.5177-5.6445 5.6445-5.6445z" />
      </svg>
    </button>
  );
}

function RectangleTool({
  currentTool,
  setCurrentTool,
}: {
  currentTool: string;
  setCurrentTool: (tool: Tool) => void;
}) {
  return (
    <button
      className="rectangle"
      data-selected={currentTool === "rectangle" ? "true" : "false"}
      onClick={() => setCurrentTool("rectangle")}
    >
      <svg
        width="53.067"
        height="34.936"
        version="1.1"
        viewBox="0 0 14.041 9.2434"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m0.5957 0a0.59536 0.59536 0 0 0-0.5957 0.5957v8.0527a0.59536 0.59536 0 0 0 0.5957 0.5957h12.85a0.59536 0.59536 0 0 0 0.5957-0.5957v-8.0527a0.59536 0.59536 0 0 0-0.5957-0.5957zm0.5957 1.1914h11.658v6.8613h-11.658z" />
      </svg>
    </button>
  );
}

function ArrowTool({
  currentTool,
  setCurrentTool,
}: {
  currentTool: string;
  setCurrentTool: (tool: Tool) => void;
}) {
  return (
    <button
      className="arrow"
      data-selected={currentTool === "arrow" ? "true" : "false"}
      onClick={() => setCurrentTool("arrow")}
    >
      <svg
        width="53.581"
        height="33.696"
        version="1.1"
        viewBox="0 0 14.177 8.9154"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m1.0723 0.03125a0.66145 0.66145 0 0 0-0.41016 0.29688 0.66145 0.66145 0 0 0 0.21484 0.91016l12.291 7.5781a0.66145 0.66145 0 0 0 0.91016-0.21484 0.66145 0.66145 0 0 0-0.2168-0.91016l-12.289-7.5801a0.66145 0.66145 0 0 0-0.5-0.080078z" />
        <path d="m0 0 3.6328 5.5918a0.66145 0.66145 0 0 0 0.91602 0.19531 0.66145 0.66145 0 0 0 0.19336-0.91602l-2.2852-3.5195 3.6602 0.042969a0.66145 0.66145 0 0 0 0.66992-0.65234 0.66145 0.66145 0 0 0-0.6543-0.66992z" />
      </svg>
    </button>
  );
}

function FreehandTool({
  currentTool,
  setCurrentTool,
}: {
  currentTool: string;
  setCurrentTool: (tool: Tool) => void;
}) {
  return (
    <button
      className="freehand"
      data-selected={currentTool === "freehand" ? "true" : "false"}
      onClick={() => setCurrentTool("freehand")}
    >
      <svg
        width="32.673"
        height="47.83"
        version="1.1"
        viewBox="0 0 8.6447 12.655"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m4.92 0.18-4.7523 8.2312v2.4065l2.0633-1.1913 4.7713-8.2642z" />
        <path d="m5.6426 9.6855c-0.65788 0.073858-1.0606 0.51373-1.4492 0.9375s-0.76655 0.83496-1.3887 0.9707c-1.0787 0.23537-2.4831-0.34933-2.5117-0.36914-0.10658-0.073813-0.2034-0.16863-0.29102-0.2832 0.0093609 0.17895 0.052027 0.40828 0.15039 0.51367 0.34275 0.36722 1.302 1.2759 2.6992 1.0527 0.78865-0.12598 1.2292-0.54076 1.6016-0.91797s0.67236-0.70717 1.2383-0.78125c0.75864-0.09928 1.3705 0.27386 1.8027 0.68359 0.4322 0.40974 0.66992 0.84375 0.66992 0.84375l0.17383 0.31836 0.30859-1.5273-0.037109-0.04687s-1.1953-1.5935-2.9668-1.3945z" />
      </svg>
    </button>
  );
}
