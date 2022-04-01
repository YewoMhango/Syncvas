import { onCanvasClickedForText, onCanvasPointerDown } from "./canvasTools.js";
import create from "./create.js";
export function ControlsContainer(toolSelector, clearCanvasFn, undoFn, sendMessageCallback, colorInput, fontSizeDisplay, fontSizeInput) {
    return create("div", { className: "controlsContainer" }, [
        create("span", null, [
            create("span", { innerHTML: "✒️ Tool:&nbsp;" }),
            toolSelector,
        ]),
        create("button", {
            onclick: () => {
                clearCanvasFn();
                sendMessageCallback(new ClearCanvas().serialize());
            },
        }, ["❌ Clear canvas"]),
        create("button", {
            onclick: () => {
                undoFn();
                sendMessageCallback(new DrawingUndo().serialize());
            },
        }, ["⬅ Undo"]),
        create("span", null, [
            create("span", { innerHTML: "🎨 Color:&nbsp;" }),
            colorInput,
        ]),
        create("span", null, [
            create("span", { innerHTML: "Font size:&nbsp;" }),
            fontSizeDisplay,
            fontSizeInput,
        ]),
    ]);
}
export function TopCanvas(width, height, syncvasObject, toolSelector) {
    return create("canvas", {
        className: "topCanvas",
        width,
        height,
        onclick: (e) => {
            if (toolSelector.value == "text") {
                onCanvasClickedForText(e, syncvasObject.domElements, syncvasObject.sendMessageCallback);
            }
        },
        onmousedown: (e) => {
            onCanvasPointerDown(e, syncvasObject.domElements, syncvasObject.sendMessageCallback);
        },
        ontouchstart: (e) => {
            onCanvasPointerDown(e, syncvasObject.domElements, syncvasObject.sendMessageCallback);
        },
    });
}
export function FontSizeInput(changeListener) {
    return create("input", {
        type: "range",
        id: "fontSizeInput",
        value: 24,
        min: 12,
        max: 72,
        onchange: changeListener,
        onmousemove: changeListener,
    });
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
    });
}
export function ToolSelector() {
    return create("select", { name: "tools", id: "tools" }, ["freehand", "line", "arrow", "circle", "rectangle", "text"].map((value) => create("option", { value, innerText: value })));
}
export function CanvasContainer(bottomCanvas, topCanvas) {
    return create("div", { className: "canvasContainer" }, [
        bottomCanvas,
        topCanvas,
    ]);
}
export function BottomCanvas(width, height) {
    return create("canvas", {
        className: "bottomCanvas",
        width,
        height,
    });
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
//# sourceMappingURL=domComponents.js.map