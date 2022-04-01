import { DrawingFreehand, DrawingCircle, DrawingLine, DrawingArrow, DrawingRectangle, DrawingText, } from "./shapes.js";
export function onCanvasPointerDown(e, domElements, callback) {
    const drawTools = {
        freehand: DrawingFreehand,
        circle: DrawingCircle,
        line: DrawingLine,
        arrow: DrawingArrow,
        rectangle: DrawingRectangle,
    };
    const selected = drawTools[domElements.toolSelector.value];
    if (selected) {
        e.preventDefault();
        const topCanvas = domElements.topCanvas;
        const bottomCanvas = domElements.bottomCanvas;
        const color = domElements.colorInput.value;
        const coordinates = pointerPosition(e, topCanvas);
        const ctx = topCanvas.getContext("2d");
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        const drawFunction = selected.startDrawingOnCanvas(coordinates, ctx, color);
        let resultingPoints = [Object.assign({}, coordinates)];
        // At first, the condition was `e instanceof TouchEvent` but
        // it seems the type is not defined in the browser's global scope,
        // so that gives you an error
        const [pointerMove, pointerEnd] = e.touches
            ? ["touchmove", "touchend"]
            : ["mousemove", "mouseup"];
        const onMove = (e) => {
            const coordinates = pointerPosition(e, topCanvas);
            resultingPoints = drawFunction(coordinates, resultingPoints);
        };
        const onEnd = (e) => {
            topCanvas.removeEventListener(pointerMove, onMove);
            topCanvas.removeEventListener(pointerEnd, onEnd);
            const shape = new selected({ points: resultingPoints, color });
            const bottomCtx = bottomCanvas.getContext("2d");
            bottomCtx.lineWidth = 3;
            shape.drawSelfOn(bottomCtx);
            callback(shape);
            ctx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);
        };
        topCanvas.addEventListener(pointerMove, onMove);
        topCanvas.addEventListener(pointerEnd, onEnd);
    }
}
export function onCanvasClickedForText(e, domElements, callback) {
    const topCanvas = domElements.topCanvas;
    const bottomCanvas = domElements.bottomCanvas;
    const coordinates = pointerPosition(e, topCanvas);
    const color = domElements.colorInput.value;
    const fontSize = Number(domElements.fontSizeInput.value);
    const canvasContainer = domElements.canvasContainer;
    const textInput = document.createElement("textarea");
    textInput.className = "canvasTextInput";
    canvasContainer.append(textInput);
    textInput.style.left = `${coordinates.x - 3}px`;
    textInput.style.top = `${coordinates.y - 3}px`;
    textInput.style.color = color;
    textInput.style.fontSize = fontSize + "px";
    textInput.focus();
    textInput.onblur = onDoneTyping;
    function onDoneTyping() {
        const textDrawing = new DrawingText({
            text: textInput.value,
            pos: coordinates,
            maxWidth: textInput.getBoundingClientRect().width,
            fontSize,
            color,
        });
        textDrawing.drawSelfOn(bottomCanvas.getContext("2d"));
        callback(textDrawing);
        textInput.remove();
    }
    console.log("Clicked on: x:" + e.clientX + " y:" + e.clientY);
}
export function pointerPosition(_pos, domNode) {
    let pos;
    // At first, the condition was `if(_pos instanceof TouchEvent)` but
    // it seems the type is not defined in the browser's global scope,
    // so that gives you an error
    if (_pos.touches) {
        pos = _pos.touches[0];
    }
    else {
        pos = _pos;
    }
    const rect = domNode.getBoundingClientRect();
    const scale = rect.width / domNode.width;
    return {
        x: Math.floor((pos.clientX - rect.left) / scale),
        y: Math.floor((pos.clientY - rect.top) / scale),
    };
}
//# sourceMappingURL=canvasTools.js.map