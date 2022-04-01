export class Shape {
}
export class ShapeWithTwoVertices extends Shape {
    constructor({ points, color }) {
        super();
        this.from = points[0];
        this.to = points[1];
        this.color = color;
    }
    drawSelfOn(ctx) {
        ctx.lineWidth = 3;
        Object.getPrototypeOf(this).constructor.draw(ctx, [this.from, this.to], this.color);
    }
    serialize() {
        let thisClassAsStr = Object.getPrototypeOf(this).constructor.toString();
        thisClassAsStr = thisClassAsStr.slice(thisClassAsStr.indexOf(" ") + 1);
        let [className] = thisClassAsStr.match(/^[a-zA-Z0-9]+/);
        return JSON.stringify({
            type: className,
            data: { points: [this.from, this.to], color: this.color },
        });
    }
    static startDrawingOnCanvas(start, ctx, color) {
        ctx.lineWidth = 3;
        return ({ x, y }, resultingPoints) => {
            resultingPoints[1] = { x, y };
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this.draw(ctx, resultingPoints, color);
            return resultingPoints;
        };
    }
    static draw(ctx, points, color) { }
}
export class DrawingLine extends ShapeWithTwoVertices {
    static draw(ctx, points, color) {
        let start = points[0];
        let end = points[1];
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
}
export class DrawingArrow extends ShapeWithTwoVertices {
    static draw(ctx, points, color) {
        let start = points[0];
        let { x, y } = points[1];
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        let theta = Math.atan((start.y - y) / (start.x - x)) +
            (start.x - x < 0 ? Math.PI : 0);
        let theta2 = theta - Math.PI / 6;
        let theta3 = theta + Math.PI / 6;
        const sideLength = 15;
        let x2 = x + sideLength * Math.cos(theta2);
        let y2 = y + sideLength * Math.sin(theta2);
        let x3 = x + sideLength * Math.cos(theta3);
        let y3 = y + sideLength * Math.sin(theta3);
        ctx.beginPath();
        ctx.moveTo(x3, y3);
        ctx.lineTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fill();
    }
}
export class DrawingCircle extends ShapeWithTwoVertices {
    static draw(ctx, points, color) {
        let start = points[0];
        let end = points[1];
        let radiusX = Math.abs((start.x - end.x) / 2);
        let radiusY = Math.abs((start.y - end.y) / 2);
        let x = (start.x < end.x ? start.x : end.x) + radiusX;
        let y = (start.y < end.y ? start.y : end.y) + radiusY;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 7);
        ctx.stroke();
    }
}
export class DrawingRectangle extends ShapeWithTwoVertices {
    static draw(ctx, points, color) {
        let start = points[0];
        let end = points[1];
        ctx.strokeStyle = color;
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    }
}
export class DrawingFreehand extends Shape {
    constructor({ points, color }) {
        super();
        this.points = points;
        this.color = color;
    }
    drawSelfOn(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
    static startDrawingOnCanvas(start, ctx, color) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        return (pos, resultingPoints) => {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            resultingPoints.push(Object.assign({}, pos));
            return resultingPoints;
        };
    }
    serialize() {
        return JSON.stringify({ type: "DrawingFreehand", data: this });
    }
}
export class DrawingText extends Shape {
    constructor({ text, pos, maxWidth, fontSize, color }) {
        super();
        this.text = text;
        this.pos = pos;
        this.maxWidth = maxWidth;
        this.fontSize = fontSize;
        this.color = color;
    }
    drawSelfOn(ctx) {
        ctx.fillStyle = this.color;
        ctx.font = this.fontSize + 'px "Open Sans"';
        let lines = splitStringIntoLines(this.text, this.maxWidth, this.fontSize);
        lines.forEach((value, index) => {
            ctx.fillText(value, this.pos.x, this.pos.y +
                this.fontSize * 1.375 * index +
                this.fontSize +
                (1.5 * this.fontSize) / 24);
        });
    }
    serialize() {
        return JSON.stringify({ type: "DrawingText", data: this });
    }
}
function splitStringIntoLines(str, maxWidth, fontSize) {
    let array = [];
    let lastSpaceIndex;
    let newString = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] == "\n") {
            array.push(newString.slice(0));
            newString = "";
            lastSpaceIndex = -1;
        }
        else if (str[i] == " " || str[i].charCodeAt(0) == 160) {
            if (exceedsMaxWidth(newString, maxWidth, fontSize)) {
                splitLongLine();
            }
            else {
                newString += " ";
                lastSpaceIndex = newString.length - 1;
            }
        }
        else {
            newString += str[i];
        }
    }
    if (exceedsMaxWidth(newString, maxWidth, fontSize)) {
        splitLongLine();
    }
    array.push(newString);
    return array;
    function splitLongLine() {
        if (lastSpaceIndex != -1) {
            array.push(newString.slice(0, lastSpaceIndex));
            newString = newString.slice(lastSpaceIndex + 1) + " ";
            lastSpaceIndex = -1;
        }
        else {
            splitSpacelessString(newString, maxWidth, fontSize).forEach((value, index, arr) => {
                if (index == arr.length - 1) {
                    newString = value;
                }
                else {
                    array.push(value);
                }
            });
        }
    }
}
function splitSpacelessString(str, maxWidth, fontSize) {
    let array = [];
    let newString = "";
    for (let char of str) {
        newString += char;
        if (exceedsMaxWidth(newString, maxWidth, fontSize)) {
            array.push(newString.slice(0, newString.length - 1));
            newString = char;
        }
    }
    array.push(newString);
    return array;
}
function exceedsMaxWidth(str, maxWidth, fontSize) {
    // prettier-ignore
    const characterWidths = {
        relativeSizes: {
            g: 1.2, C: 1.2, H: 1.2, i: 0.2, l: 0.2, I: 0.2,
            j: 0.5, m: 1.8, w: 1.8, r: 0.7, A: 1.4, G: 1.4,
            V: 1.4, D: 1.3, N: 1.3, T: 1.3, U: 1.3, X: 1.3,
            Y: 1.3, J: 0.6, M: 1.7, O: 1.5, Q: 1.5, W: 2.0,
            defaultWidth: 1,
        },
        pixelWidthsAt24px: {
            a: 10,
            gap: 2,
            space: 8,
        },
    };
    let totalWidth = 0;
    const defaultWidth = characterWidths.relativeSizes.defaultWidth;
    const { space, a, gap } = characterWidths.pixelWidthsAt24px;
    for (let character of str) {
        let charWidth;
        if (character == " ") {
            charWidth = space;
        }
        else {
            let width = characterWidths.relativeSizes[character] ||
                defaultWidth;
            charWidth = width * a + gap;
        }
        charWidth = (charWidth * fontSize) / 24;
        totalWidth += charWidth;
        if (totalWidth > maxWidth) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=shapes.js.map