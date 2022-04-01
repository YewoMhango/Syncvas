import { onCanvasClickedForText, onCanvasPointerDown } from "./canvasTools.js";
import create from "./create.js";
import Syncvas from "../Syncvas.js";

export function ControlsContainer(
    toolSelector: HTMLSelectElement,
    clearCanvasFn: () => void,
    undoFn: () => void,
    sendMessageCallback: (message: string) => any,
    colorInput: HTMLInputElement,
    fontSizeDisplay: HTMLSpanElement,
    fontSizeInput: HTMLInputElement
) {
    return create("div", { className: "controlsContainer" }, [
        create("span", null, [
            create("span", { innerHTML: "✒️ Tool:&nbsp;" }),
            toolSelector,
        ]),
        create(
            "button",
            {
                onclick: () => {
                    clearCanvasFn();
                    sendMessageCallback(new ClearCanvas().serialize());
                },
            },
            ["❌ Clear canvas"]
        ),
        create(
            "button",
            {
                onclick: () => {
                    undoFn();
                    sendMessageCallback(new DrawingUndo().serialize());
                },
            },
            ["⬅ Undo"]
        ),
        create("span", null, [
            create("span", { innerHTML: "🎨 Color:&nbsp;" }),
            colorInput,
        ]),
        create("span", null, [
            create("span", { innerHTML: "Font size:&nbsp;" }),
            fontSizeDisplay,
            fontSizeInput,
        ]),
    ]) as HTMLDivElement;
}

export function TopCanvas(
    width: number,
    height: number,
    syncvasObject: Syncvas,
    toolSelector: HTMLSelectElement
) {
    return create("canvas", {
        className: "topCanvas",
        width,
        height,
        onclick: (e: MouseEvent) => {
            if (toolSelector.value == "text") {
                onCanvasClickedForText(
                    e,
                    syncvasObject.domElements,
                    syncvasObject.sendMessageCallback
                );
            }
        },
        onmousedown: (e: MouseEvent) => {
            onCanvasPointerDown(
                e,
                syncvasObject.domElements,
                syncvasObject.sendMessageCallback
            );
        },
        ontouchstart: (e: TouchEvent) => {
            onCanvasPointerDown(
                e,
                syncvasObject.domElements,
                syncvasObject.sendMessageCallback
            );
        },
    }) as HTMLCanvasElement;
}

export function FontSizeInput(changeListener: () => void) {
    return create("input", {
        type: "range",
        id: "fontSizeInput",
        value: 24,
        min: 12,
        max: 72,
        onchange: changeListener,
        onmousemove: changeListener,
    }) as HTMLInputElement;
}

export function FontSizeDisplay() {
    return create("span", {
        id: "fontSizeDisplay",
        innerText: "24px",
    });
}

export function ColorInput() {
    return create("input", {
        type: "color",
        id: "canvasColor",
        name: "canvasColor",
    }) as HTMLInputElement;
}

export function ToolSelector() {
    return create(
        "select",
        { name: "tools", id: "tools" },
        ["freehand", "line", "arrow", "circle", "rectangle", "text"].map(
            (value) => create("option", { value, innerText: value })
        )
    ) as HTMLSelectElement;
}

export function CanvasContainer(
    bottomCanvas: HTMLCanvasElement,
    topCanvas: HTMLCanvasElement
) {
    return create("div", { className: "canvasContainer" }, [
        bottomCanvas,
        topCanvas,
    ]) as HTMLDivElement;
}

export function BottomCanvas(width: number, height: number) {
    return create("canvas", {
        className: "bottomCanvas",
        width,
        height,
    }) as HTMLCanvasElement;
}

class DrawingUndo {
    serialize() {
        return JSON.stringify({ type: "undo" });
    }
}

class ClearCanvas {
    serialize() {
        return JSON.stringify({ type: "clearCanvas" });
    }
}
