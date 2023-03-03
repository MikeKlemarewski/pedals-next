import { Cord } from "components/patchCord";

const height = 200;
const width = 100;

export interface Pedal {
  x: number;
  y: number;
  color: string;
  draw(ctx: CanvasRenderingContext2D): void;
  inputCord: Cord | null;
  outputCord: Cord | null;
  audioNode: AudioNode;
  getAudioNode(): AudioNode;
  getRightEdgeX(): number;
  getLeftEdgeX(): number;
  unplugInputCord(): void;
  unplugOutputCord(): void;
}

interface constructorArgs {
  x: number;
  y: number;
  color: string;
  audioCtx: AudioContext;
}

export default class BasePedal implements Pedal {
  x: number;
  y: number;
  color: string;
  inputCord: Cord | null;
  outputCord: Cord | null;
  audioNode: AudioNode;

  constructor({
    x,
    y,
    color = `#${Math.floor(Math.random()*16777215).toString(16)}`,
    audioCtx,
  } : constructorArgs) {
    this.x = x;
    this.y = y;
    this.color = color;

    this.inputCord = null;
    this.outputCord = null;

    this.audioNode = this.setupAudioNode(audioCtx);
  }

  setupAudioNode(audioCtx : AudioContext) {
    return audioCtx.createGain();
  }

  getAudioNode() {
    return this.audioNode;
  }

  getLeftEdgeX() {
    return this.x;
  }

  getRightEdgeX() {
    return this.x + width;
  }

  getTopEdgeY() {
    return this.y;
  }

  getBottomEdgeY() {
    return this.y + height;
  }

  getNextPedal() {
    return this.outputCord ? this.outputCord.getOutputPedal() : null;
  }

  getPreviousPedal() {
    return this.inputCord ? this.inputCord.getInputPedal() : null;
  }

  move(x: number, y: number) {
    this.x += x;
    this.y += y;

    if (this.inputCord) {
      this.inputCord.moveRightSide(x, y);
    }

    if (this.outputCord) {
      this.outputCord.moveLeftSide(x, y);
    }
  }

  isInside(x: number, y: number) {
    if (x < this.x || x > (this.x + width)) {
      return false;
    }

    if (y < this.y || y > (this.y + height)) {
      return false;
    }

    return true;
  }

  plugInInputCord(cord: Cord) {
    this.inputCord = cord;

    const previousPedal = this.getPreviousPedal();
    if (previousPedal) {
      const previousAudioNode = previousPedal.getAudioNode();
      previousAudioNode.connect(this.audioNode);
    }
  }

  plugInOutputCord(cord: Cord) {
    this.outputCord = cord;

    const nextPedal = this.getNextPedal();
    if (nextPedal) {
      this.audioNode.connect(nextPedal.getAudioNode());
    }
  }

  unplugInputCord() {
    const previousPedal = this.getPreviousPedal();
    if (previousPedal) {
      const previousAudioNode = previousPedal.getAudioNode();
      previousAudioNode.disconnect();
    }

    this.inputCord = null;
  }

  unplugOutputCord() {
    const nextPedal = this.getNextPedal();
    if (nextPedal) {
      this.audioNode.disconnect();
    }

    this.outputCord = null;
  }

  draw(ctx : CanvasRenderingContext2D) {
    const previousFillStyle = ctx.fillStyle;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, width, height);
    ctx.fillStyle = previousFillStyle;
  }
}
