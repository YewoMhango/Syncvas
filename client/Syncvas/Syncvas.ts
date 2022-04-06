import {
    BottomCanvas,
    CanvasContainer,
    ColorInput,
    ControlsContainer,
    FontSizeDisplay,
    FontSizeInput,
    TopCanvas,
} from "./js/domComponents.js";

import {
    Drawable,
    LineDrawing,
    ArrowDrawing,
    CircleDrawing,
    RectangleDrawing,
    FreehandDrawing,
    TextDrawing,
    SimpleDrawingData,
    DrawingTextData,
} from "./js/shapes.js";

import create from "./js/create.js";

/**
 * This is a Canvas Drawing library meant to allow drawing between
 * multiple users on different devices to be synchronized
 */
export default class Syncvas {
    domElements: SyncvasDomElements;
    drawingsHistory: Array<Drawable>;
    sendMessageCallback: (shape: Drawable) => any;
    selectedTool: string;

    /**
     * @param targetContainer The element which will contain the root DOM element
     * @param sendMessageCallback The callback which will be called to send drawing events to other devices
     * @param width width of the canvas
     * @param height height of the canvas
     */
    constructor(
        targetContainer: HTMLElement,
        sendMessageCallback: (message: string) => any,
        width: number = 896,
        height: number = 504
    ) {
        this.drawingsHistory = [];
        this.selectedTool = "freehand";

        this.sendMessageCallback = (shape) => {
            this.drawingsHistory.push(shape);
            sendMessageCallback(shape.serialize());
        };

        this.domElements = this.initComponents(
            width,
            height,
            sendMessageCallback
        );
        targetContainer.appendChild(this.domElements.container);
    }

    /**
     * Initializes most of the DOM elements used by the app
     */
    private initComponents(
        width: number,
        height: number,
        callback: (message: string) => any
    ): SyncvasDomElements {
        const bottomCanvas = BottomCanvas(width, height);
        const topCanvas = TopCanvas(width, height, this);
        const canvasContainer = CanvasContainer(bottomCanvas, topCanvas);
        const colorInput = ColorInput();
        const fontSizeDisplay = FontSizeDisplay();
        const fontSizeInput = FontSizeInput(() => {
            fontSizeDisplay.innerHTML = Number(fontSizeInput.value) + "px";
        });

        const controlsContainer = ControlsContainer(
            () => this.clearCanvas(),
            () => this.undo(),
            callback,
            (tool) => {
                this.selectedTool = tool;
                console.log(this);
            },
            colorInput,
            fontSizeDisplay,
            fontSizeInput
        );

        controlsContainer.style.width = width + 4 + "px";

        const container = create("div", { className: "SyncvasDom" }, [
            canvasContainer,
            controlsContainer,
        ]) as HTMLDivElement;

        return {
            bottomCanvas,
            topCanvas,
            canvasContainer,
            colorInput,
            fontSizeDisplay,
            fontSizeInput,
            controlsContainer,
            container,
        };
    }

    /**
     * Draws an object to the canvas, for syncing with what users on other devices have drawn
     *
     * ---
     * @param message A JSON string representing a drawing event
     */
    draw(message: string) {
        interface DrawingEvent {
            type: string;
            data?: SimpleDrawingData | DrawingTextData;
        }
        let parsedMessage = JSON.parse(message) as DrawingEvent;

        let event: Drawable;

        switch (parsedMessage.type) {
            case "LineDrawing":
                event = new LineDrawing(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "ArrowDrawing":
                event = new ArrowDrawing(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "CircleDrawing":
                event = new CircleDrawing(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "RectangleDrawing":
                event = new RectangleDrawing(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "FreehandDrawing":
                event = new FreehandDrawing(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "TextDrawing":
                event = new TextDrawing(parsedMessage.data as DrawingTextData);
                break;
            case "undo":
                this.undo();
                return;
            case "clearCanvas":
                this.clearCanvas();
                return;
            default:
                return;
        }

        if (event) {
            event.drawSelfOn(
                this.domElements.bottomCanvas.getContext(
                    "2d"
                ) as CanvasRenderingContext2D
            );
        }

        this.drawingsHistory.push(event);
    }

    /**
     * Clear the canvas, when another user has cleared it.
     * This also clears and resets all the past history
     */
    clearCanvas() {
        const bottomCanvas = this.domElements.bottomCanvas;

        let ctx = bottomCanvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);

        this.drawingsHistory = [];
    }

    /**
     * This undos the last drawing operation
     */
    undo() {
        this.drawingsHistory.pop();

        let ctx = this.domElements.bottomCanvas.getContext(
            "2d"
        ) as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let shape of this.drawingsHistory) {
            shape.drawSelfOn(ctx);
        }
    }

    /**
     * This is used when the user has just joined and they're supposed to
     * synchronise with what others have already drawn
     *
     * ---
     * @param canvasDrawings An array of canvas drawing events from the past
     */
    updateWithAccumulatedState(canvasDrawings: Array<string>) {
        for (let shape of canvasDrawings) {
            this.draw(shape);
        }
    }
}

export interface SyncvasDomElements {
    bottomCanvas: HTMLCanvasElement;
    topCanvas: HTMLCanvasElement;
    canvasContainer: HTMLDivElement;
    colorInput: HTMLInputElement;
    fontSizeDisplay: HTMLSpanElement;
    fontSizeInput: HTMLInputElement;
    controlsContainer: HTMLDivElement;
    container: HTMLDivElement;
}
