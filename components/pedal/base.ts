import PatchCable from "components/patchCable";

const height = 200;
const width = 100;

interface constructorArgs {
  x: number;
  y: number;
  color?: string;
  audioCtx: AudioContext;
}

export default class BasePedal {
  x: number;
  y: number;
  color: string;
  inputCable: PatchCable | null;
  outputCable: PatchCable | null;
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

    this.inputCable = null;
    this.outputCable = null;

    this.audioNode = this.setupAudioNode(audioCtx);
  }

  setupAudioNode(audioCtx : AudioContext) {
    return audioCtx.createGain() as AudioNode;
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
    return this.outputCable ? this.outputCable.getOutputPedal() : null;
  }

  getPreviousPedal() {
    return this.inputCable ? this.inputCable.getInputPedal() : null;
  }

  move(x: number, y: number) {
    this.x += x;
    this.y += y;

    if (this.inputCable) {
      this.inputCable.moveRightSide(x, y);
    }

    if (this.outputCable) {
      this.outputCable.moveLeftSide(x, y);
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

  plugInInputCable(Cable: PatchCable) {
    this.inputCable = Cable;

    const previousPedal = this.getPreviousPedal();
    if (previousPedal) {
      const previousAudioNode = previousPedal.getAudioNode();
      previousAudioNode.connect(this.audioNode);
    }
  }

  plugInOutputCable(Cable: PatchCable) {
    this.outputCable = Cable;

    const nextPedal = this.getNextPedal();
    if (nextPedal) {
      this.audioNode.connect(nextPedal.getAudioNode());
    }
  }

  unplugInputCable() {
    const previousPedal = this.getPreviousPedal();
    if (previousPedal) {
      const previousAudioNode = previousPedal.getAudioNode();
      previousAudioNode.disconnect();
    }

    this.inputCable = null;
  }

  unplugOutputCable() {
    const nextPedal = this.getNextPedal();
    if (nextPedal) {
      this.audioNode.disconnect();
    }

    this.outputCable = null;
  }

  draw(ctx : CanvasRenderingContext2D) {
    const previousFillStyle = ctx.fillStyle;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, width, height);
    ctx.fillStyle = previousFillStyle;
  }
}
