import {
    Drawable,
    FreehandDrawing,
    CircleDrawing,
    LineDrawing,
    ArrowDrawing,
    RectangleDrawing,
    TextDrawing,
    MyMap,
} from "./shapes.js";
import { SyncvasDomElements } from "../Syncvas.js";

/**
 * Draws on the canvas whenever the user's pointer touches the canvas
 *
 * ---
 * @param e mousedown or touchstart event
 * @param domElements The DOM elements for the main Syncvas object
 * @param sendMessage Sends a drawing event back to other users
 * @param selectedTool The name of the currently selected tool
 */
export function onCanvasPointerDown(
    e: MouseEvent | TouchEvent,
    domElements: SyncvasDomElements,
    sendMessage: (shape: Drawable) => void,
    selectedTool: string
) {
    const drawTools: MyMap<
        | typeof FreehandDrawing
        | typeof CircleDrawing
        | typeof LineDrawing
        | typeof ArrowDrawing
        | typeof RectangleDrawing
    > = {
        freehand: FreehandDrawing,
        circle: CircleDrawing,
        line: LineDrawing,
        arrow: ArrowDrawing,
        rectangle: RectangleDrawing,
    };

    const selected = drawTools[selectedTool];

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
                | typeof FreehandDrawing
                | typeof CircleDrawing
                | typeof LineDrawing
                | typeof ArrowDrawing
                | typeof RectangleDrawing)({ points: resultingPoints, color });

            const bottomCtx = bottomCanvas.getContext(
                "2d"
            ) as CanvasRenderingContext2D;
            bottomCtx.lineWidth = 3;
            shape.drawSelfOn(bottomCtx);
            sendMessage(shape);

            ctx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);
        };

        topCanvas.addEventListener(pointerMove, onMove);
        topCanvas.addEventListener(pointerEnd, onEnd);
    }
}

/**
 * Allows input of text on the canvas when the user clicks on it
 * with the text tool selected
 *
 * ---
 * @param e Mouse or touch click event
 * @param domElements
 * @param sendMessage
 */
export function onCanvasClickedForText(
    e: MouseEvent,
    domElements: SyncvasDomElements,
    sendMessage: (shape: Drawable) => void
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
        const textDrawing = new TextDrawing({
            text: textInput.value,
            pos: coordinates,
            maxWidth: textInput.getBoundingClientRect().width,
            fontSize,
            color,
        });
        textDrawing.drawSelfOn(
            bottomCanvas.getContext("2d") as CanvasRenderingContext2D
        );
        sendMessage(textDrawing);

        textInput.remove();
    }

    console.log("Clicked on: x:" + e.clientX + " y:" + e.clientY);
}

/**
 * Determines the x and y values relative to the coordinates used on
 * the canvas, based on where the user clicked on the screen. When
 * the canvas is scaled up or down in size due to CSS rules, the width
 * and height values will differ from the canvas property values
 *
 * ---
 * @param pointerEvent A Mouse or Touch event object
 * @param canvas Clicked canvas element
 * @returns
 */
export function pointerPosition(
    pointerEvent: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement
) {
    let pos: HasClientXAndY;

    // At first, the condition was `if(_pos instanceof TouchEvent)` but
    // it seems the type is not defined in the browser's global scope,
    // so that gives you an error
    if ((pointerEvent as any).touches) {
        pos = (pointerEvent as TouchEvent).touches[0] as HasClientXAndY;
    } else {
        pos = pointerEvent as HasClientXAndY;
    }

    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / canvas.width;

    return {
        x: Math.floor((pos.clientX - rect.left) / scale),
        y: Math.floor((pos.clientY - rect.top) / scale),
    };
}

interface HasClientXAndY {
    clientX: number;
    clientY: number;
}
