import {
    Shape,
    DrawingFreehand,
    DrawingCircle,
    DrawingLine,
    DrawingArrow,
    DrawingRectangle,
    DrawingText,
    MyMap,
} from "./shapes.js";
import { SyncvasDomElements } from "../Syncvas.js";

export function onCanvasPointerDown(
    e: MouseEvent | TouchEvent,
    domElements: SyncvasDomElements,
    callback: (shape: Shape) => void
) {
    const drawTools: MyMap<
        | typeof DrawingFreehand
        | typeof DrawingCircle
        | typeof DrawingLine
        | typeof DrawingArrow
        | typeof DrawingRectangle
    > = {
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

        const ctx = topCanvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        const drawFunction = selected.startDrawingOnCanvas(
            coordinates,
            ctx,
            color
        );
        let resultingPoints = [{ ...coordinates }];

        // At first, the condition was `e instanceof TouchEvent` but
        // it seems the type is not defined in the browser's global scope,
        // so that gives you an error
        const [pointerMove, pointerEnd] = (e as any).touches
            ? ["touchmove", "touchend"]
            : ["mousemove", "mouseup"];

        const onMove = (e: Event) => {
            const coordinates = pointerPosition(
                e as MouseEvent | TouchEvent,
                topCanvas
            );
            resultingPoints = drawFunction(coordinates, resultingPoints);
        };

        const onEnd = (e: Event) => {
            topCanvas.removeEventListener(
                pointerMove as keyof HTMLElementEventMap,
                onMove
            );
            topCanvas.removeEventListener(
                pointerEnd as keyof HTMLElementEventMap,
                onEnd
            );

            const shape = new (selected as
                | typeof DrawingFreehand
                | typeof DrawingCircle
                | typeof DrawingLine
                | typeof DrawingArrow
                | typeof DrawingRectangle)({ points: resultingPoints, color });

            const bottomCtx = bottomCanvas.getContext(
                "2d"
            ) as CanvasRenderingContext2D;
            bottomCtx.lineWidth = 3;
            shape.drawSelfOn(bottomCtx);
            callback(shape);

            ctx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);
        };

        topCanvas.addEventListener(pointerMove, onMove);
        topCanvas.addEventListener(pointerEnd, onEnd);
    }
}

export function onCanvasClickedForText(
    e: MouseEvent,
    domElements: SyncvasDomElements,
    callback: (shape: Shape) => void
) {
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
        textDrawing.drawSelfOn(
            bottomCanvas.getContext("2d") as CanvasRenderingContext2D
        );
        callback(textDrawing);

        textInput.remove();
    }

    console.log("Clicked on: x:" + e.clientX + " y:" + e.clientY);
}

export function pointerPosition(
    _pos: MouseEvent | TouchEvent,
    domNode: HTMLCanvasElement
) {
    let pos: HasClientXAndY;

    // At first, the condition was `if(_pos instanceof TouchEvent)` but
    // it seems the type is not defined in the browser's global scope,
    // so that gives you an error
    if ((_pos as any).touches) {
        pos = (_pos as any).touches[0] as HasClientXAndY;
    } else {
        pos = _pos as HasClientXAndY;
    }

    const rect = domNode.getBoundingClientRect();
    const scale = rect.width / domNode.width;

    return {
        x: Math.floor((pos.clientX - rect.left) / scale),
        y: Math.floor((pos.clientY - rect.top) / scale),
    };
}

interface HasClientXAndY {
    clientX: number;
    clientY: number;
}
