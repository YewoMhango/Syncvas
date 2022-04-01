import {
    BottomCanvas,
    CanvasContainer,
    ColorInput,
    ControlsContainer,
    FontSizeDisplay,
    FontSizeInput,
    ToolSelector,
    TopCanvas,
} from "./js/domComponents.js";

import {
    Shape,
    DrawingLine,
    DrawingArrow,
    DrawingCircle,
    DrawingRectangle,
    DrawingFreehand,
    DrawingText,
    SimpleDrawingData,
    DrawingTextData,
} from "./js/shapes.js";

import create from "./js/create.js";

export default class Syncvas {
    domElements: SyncvasDomElements;
    drawingsHistory: Array<Shape>;
    sendMessageCallback: (shape: Shape) => any;

    constructor(
        targetContainer: HTMLElement,
        sendMessageCallback: (message: string) => any,
        width: number = 896,
        height: number = 504
    ) {
        this.drawingsHistory = [];

        this.sendMessageCallback = (shape) => {
            this.drawingsHistory.push(shape);
            sendMessageCallback(shape.serialize());
        };

        this.domElements = this.initComponents(width, height, sendMessageCallback);
        targetContainer.appendChild(this.domElements.container);
    }

    private initComponents(
        width: number,
        height: number,
        callback: (message: string) => any
    ): SyncvasDomElements {
        const bottomCanvas = BottomCanvas(width, height);
        const toolSelector = ToolSelector();
        const topCanvas = TopCanvas(width, height, this, toolSelector);
        const canvasContainer = CanvasContainer(bottomCanvas, topCanvas);
        const colorInput = ColorInput();
        const fontSizeDisplay = FontSizeDisplay();
        const fontSizeInput = FontSizeInput(() => {
            fontSizeDisplay.innerHTML = Number(fontSizeInput.value) + "px";
        });
        const controlsContainer = ControlsContainer(
            toolSelector,
            () => this.clearCanvas(),
            () => this.undo(),
            callback,
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
            toolSelector,
            colorInput,
            fontSizeDisplay,
            fontSizeInput,
            controlsContainer,
            container,
        };
    }

    draw(message: string) {
        interface DrawingEvent {
            type: string;
            data?: SimpleDrawingData | DrawingTextData;
        }
        let parsedMessage = JSON.parse(message) as DrawingEvent;

        let event: Shape;

        switch (parsedMessage.type) {
            case "DrawingLine":
                event = new DrawingLine(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "DrawingArrow":
                event = new DrawingArrow(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "DrawingCircle":
                event = new DrawingCircle(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "DrawingRectangle":
                event = new DrawingRectangle(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "DrawingFreehand":
                event = new DrawingFreehand(
                    parsedMessage.data as SimpleDrawingData
                );
                break;
            case "DrawingText":
                event = new DrawingText(parsedMessage.data as DrawingTextData);
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

    clearCanvas() {
        const bottomCanvas = this.domElements.bottomCanvas;

        let ctx = bottomCanvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);

        this.drawingsHistory = [];
    }

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
    toolSelector: HTMLSelectElement;
    colorInput: HTMLInputElement;
    fontSizeDisplay: HTMLSpanElement;
    fontSizeInput: HTMLInputElement;
    controlsContainer: HTMLDivElement;
    container: HTMLDivElement;
}
