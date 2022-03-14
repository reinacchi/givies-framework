import { registerFont, createCanvas } from "canvas";
import _ from "lodash";

registerFont("./Comismsh.ttf", { family: "comismsh" });

interface AdvancedCaptcha {
    buffer: Buffer;
    text: string;
}

interface CaptchaOptions {
    fontFamily?: string;
    fontSize?: number;
    wordSpace?: number;
    borderWidth?: number;
    lineWidth?: number;
    chars?: string;
    colorHex?: string;
    bgColor?: string;
    maxLines?: number;
    minLines?: number;
}

/**
 * Represents a Captcha class constructor
 */
export class Captcha {
    height: number;

    length: number;

    opt: CaptchaOptions;

    width: number;

    /**
     * Represents a Captcha class constructor
     * @param width The width of the captcha
     * @param height The height of the captcha
     * @param length The length character of the captcha
     * @param options Options to extend the Captcha option
     */
    constructor(width: number, height: number, length: number, options?: CaptchaOptions) {
        this.length = length;
        this.width = width;
        this.height = height;

        const opt: CaptchaOptions = Object.assign({
            fontFamily: "comismsh",
            lineWidth: 2,
            chars: "0123456789abcdefghjknpqrstuvxyzABCDEFGHJKLNPQRSTUVXYZ",
            colorHex: "23456789",
            bgColor: "#7289DA",
            maxLines: 4,
            minLines: 2
        }, options);

        opt.fontSize = opt.fontSize || Math.floor(height * 0.8);
        opt.wordSpace = opt.wordSpace || opt.fontSize / 2.2;
        opt.borderWidth = opt.borderWidth || (width - opt.wordSpace * length) / 2;

        this.opt = opt;
    }

    private _randomChars(): string {
        return _.sampleSize(this.opt.chars, this.length).join("");
    }

    private _randomColor() {
        return "#" + _.sampleSize(this.opt.colorHex, 3).join("");
    }

    /**
     * Create a Captcha
     * @returns {AdvancedCaptcha}
     */
    createCaptcha(): AdvancedCaptcha {
        const { canvas, ctx } = this.initCanvas();
        this.drawLine(ctx);
        const text = this.drawText(ctx);
        const buffer = canvas.toBuffer();
        return { buffer: buffer, text: text };
    }

    /**
     * Draw a line for the Captcha
     * @param ctx The canvas context
     */
    drawLine(ctx: any) {
        ctx.lineWidth = this.opt.lineWidth;
        ctx.globalAlpha = 0.3;

        for (let i = 0; i < this.length; i++) {
            ctx.strokeStyle = this._randomColor();
            ctx.beginPath();
            ctx.moveTo(0, _.random(0, this.height));
            ctx.lineTo(this.width, _.random(0, this.height));
            ctx.stroke();
        }

    }

    /**
     * Draw a text for the Captcha
     * @param ctx The canvas context
     * @returns
     */
    drawText(ctx: any) {
        const text = this._randomChars();
        ctx.globalAlpha = 1;

        for (let i = 0; i < this.length; i++) {
            ctx.font = `${this.opt.fontSize}px ${this.opt.fontFamily}`;
            ctx.fillStyle = "#23272A";
            const x = this.opt.borderWidth + (i + Math.random() / 2 - 0.25) * this.opt.wordSpace;
            const y = this.height * 0.8;
            ctx.fillText(text[i], x, y);
        }

        return text;
    }

    /**
     * Initialize Canvas
     */
    initCanvas() {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = this.opt.bgColor;
        ctx.fillRect(0, 0, this.width, this.height);

        return { canvas, ctx };
    }
}