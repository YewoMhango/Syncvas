import { BottomCanvas, CanvasContainer, ColorInput, ControlsContainer, FontSizeDisplay, FontSizeInput, ToolSelector, TopCanvas, } from "./js/domComponents.js";
import { DrawingLine, DrawingArrow, DrawingCircle, DrawingRectangle, DrawingFreehand, DrawingText, } from "./js/shapes.js";
import create from "./js/create.js";
export default class Syncvas {
    constructor(targetContainer, sendMessageCallback, width = 896, height = 504) {
        this.drawingsHistory = [];
        this.sendMessageCallback = (shape) => {
            this.drawingsHistory.push(shape);
            sendMessageCallback(shape.serialize());
        };
        this.domElements = this.initComponents(width, height, sendMessageCallback);
        targetContainer.appendChild(this.domElements.container);
    }
    initComponents(width, height, callback) {
        const bottomCanvas = BottomCanvas(width, height);
        const toolSelector = ToolSelector();
        const topCanvas = TopCanvas(width, height, this, toolSelector);
        const canvasContainer = CanvasContainer(bottomCanvas, topCanvas);
        const colorInput = ColorInput();
        const fontSizeDisplay = FontSizeDisplay();
        const fontSizeInput = FontSizeInput(() => {
            fontSizeDisplay.innerHTML = Number(fontSizeInput.value) + "px";
        });
        const controlsContainer = ControlsContainer(toolSelector, () => this.clearCanvas(), () => this.undo(), callback, colorInput, fontSizeDisplay, fontSizeInput);
        controlsContainer.style.width = width + 4 + "px";
        const container = create("div", { className: "SyncvasDom" }, [
            canvasContainer,
            controlsContainer,
        ]);
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
    draw(message) {
        let parsedMessage = JSON.parse(message);
        let event;
        switch (parsedMessage.type) {
            case "DrawingLine":
                event = new DrawingLine(parsedMessage.data);
                break;
            case "DrawingArrow":
                event = new DrawingArrow(parsedMessage.data);
                break;
            case "DrawingCircle":
                event = new DrawingCircle(parsedMessage.data);
                break;
            case "DrawingRectangle":
                event = new DrawingRectangle(parsedMessage.data);
                break;
            case "DrawingFreehand":
                event = new DrawingFreehand(parsedMessage.data);
                break;
            case "DrawingText":
                event = new DrawingText(parsedMessage.data);
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
            event.drawSelfOn(this.domElements.bottomCanvas.getContext("2d"));
        }
        this.drawingsHistory.push(event);
    }
    clearCanvas() {
        const bottomCanvas = this.domElements.bottomCanvas;
        let ctx = bottomCanvas.getContext("2d");
        ctx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);
        this.drawingsHistory = [];
    }
    undo() {
        this.drawingsHistory.pop();
        let ctx = this.domElements.bottomCanvas.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let shape of this.drawingsHistory) {
            shape.drawSelfOn(ctx);
        }
    }
    updateWithAccumulatedState(canvasDrawings) {
        for (let shape of canvasDrawings) {
            this.draw(shape);
        }
    }
}
//# sourceMappingURL=Syncvas.js.map