import { BottomCanvas, CanvasContainer, ColorInput, ControlsContainer, FontSizeDisplay, FontSizeInput, TopCanvas, } from "./js/domComponents.js";
import { LineDrawing, ArrowDrawing, CircleDrawing, RectangleDrawing, FreehandDrawing, TextDrawing, } from "./js/shapes.js";
import create from "./js/create.js";
/**
 * This is a Canvas Drawing library meant to allow drawing between
 * multiple users on different devices to be synchronized
 */
export default class Syncvas {
    /**
     * @param targetContainer The element which will contain the root DOM element
     * @param sendMessageCallback The callback which will be called to send drawing events to other devices
     * @param width width of the canvas
     * @param height height of the canvas
     */
    constructor(targetContainer, sendMessageCallback, width = 896, height = 504) {
        this.drawingsHistory = [];
        this.selectedTool = "freehand";
        this.sendMessageCallback = (shape) => {
            this.drawingsHistory.push(shape);
            sendMessageCallback(shape.serialize());
        };
        this.domElements = this.initComponents(width, height, sendMessageCallback);
        targetContainer.appendChild(this.domElements.container);
    }
    /**
     * Initializes most of the DOM elements used by the app
     */
    initComponents(width, height, callback) {
        const bottomCanvas = BottomCanvas(width, height);
        const topCanvas = TopCanvas(width, height, this);
        const canvasContainer = CanvasContainer(bottomCanvas, topCanvas);
        const colorInput = ColorInput();
        const fontSizeDisplay = FontSizeDisplay();
        const fontSizeInput = FontSizeInput(() => {
            fontSizeDisplay.innerHTML = Number(fontSizeInput.value) + "px";
        });
        const controlsContainer = ControlsContainer(() => this.clearCanvas(), () => this.undo(), callback, (tool) => {
            this.selectedTool = tool;
            console.log(this);
        }, colorInput, fontSizeDisplay, fontSizeInput);
        controlsContainer.style.width = width + 4 + "px";
        const container = create("div", { className: "SyncvasDom" }, [
            canvasContainer,
            controlsContainer,
        ]);
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
    draw(message) {
        let parsedMessage = JSON.parse(message);
        let event;
        switch (parsedMessage.type) {
            case "LineDrawing":
                event = new LineDrawing(parsedMessage.data);
                break;
            case "ArrowDrawing":
                event = new ArrowDrawing(parsedMessage.data);
                break;
            case "CircleDrawing":
                event = new CircleDrawing(parsedMessage.data);
                break;
            case "RectangleDrawing":
                event = new RectangleDrawing(parsedMessage.data);
                break;
            case "FreehandDrawing":
                event = new FreehandDrawing(parsedMessage.data);
                break;
            case "TextDrawing":
                event = new TextDrawing(parsedMessage.data);
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
    /**
     * Clear the canvas, when another user has cleared it.
     * This also clears and resets all the past history
     */
    clearCanvas() {
        const bottomCanvas = this.domElements.bottomCanvas;
        let ctx = bottomCanvas.getContext("2d");
        ctx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);
        this.drawingsHistory = [];
    }
    /**
     * This undos the last drawing operation
     */
    undo() {
        this.drawingsHistory.pop();
        let ctx = this.domElements.bottomCanvas.getContext("2d");
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
    updateWithAccumulatedState(canvasDrawings) {
        for (let shape of canvasDrawings) {
            this.draw(shape);
        }
    }
}
//# sourceMappingURL=Syncvas.js.map