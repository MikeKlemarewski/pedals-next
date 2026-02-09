import PatchCable from "components/patchCable";

export const PEDAL_HEIGHT = 200;
export const PEDAL_WIDTH = 100;

interface constructorArgs {
  x: number;
  y: number;
  color?: string;
  label?: string;
  audioCtx: AudioContext;
  audioNode?: AudioNode;
}

export default class BasePedal {
  x: number;
  y: number;
  color: string;
  label: string;
  inputCable: PatchCable | null;
  outputCable: PatchCable | null;
  audioNode: AudioNode;
  bypassed: boolean;

  constructor({
    x,
    y,
    color = '#888888',
    label = '',
    audioCtx,
    audioNode,
  } : constructorArgs) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.label = label;

    this.inputCable = null;
    this.outputCable = null;
    this.bypassed = false;

    this.audioNode = audioNode || this.setupAudioNode(audioCtx);
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
    return this.x + PEDAL_WIDTH;
  }

  getTopEdgeY() {
    return this.y;
  }

  getBottomEdgeY() {
    return this.y + PEDAL_HEIGHT;
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
    if (x < this.x || x > (this.x + PEDAL_WIDTH)) {
      return false;
    }

    if (y < this.y || y > (this.y + PEDAL_HEIGHT)) {
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

  getStompButtonRect() {
    const btnWidth = 60;
    const btnHeight = 40;
    return {
      x: this.x + (PEDAL_WIDTH - btnWidth) / 2,
      y: this.y + PEDAL_HEIGHT - 60,
      width: btnWidth,
      height: btnHeight,
    };
  }

  isStompButtonHit(px: number, py: number) {
    const btn = this.getStompButtonRect();
    return px >= btn.x && px <= btn.x + btn.width &&
           py >= btn.y && py <= btn.y + btn.height;
  }

  toggleBypass() {
    this.bypassed = !this.bypassed;
  }

  draw(ctx : CanvasRenderingContext2D) {
    ctx.save();

    // Shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // Rounded rectangle body
    const r = 10;
    const x = this.x;
    const y = this.y;
    const w = PEDAL_WIDTH;
    const h = PEDAL_HEIGHT;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.fill();

    // Subtle border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // LED indicator at top center
    const ledRadius = 5;
    const ledX = x + w / 2;
    const ledY = y + 15;
    if (!this.bypassed) {
      // Outer glow pass
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();
      ctx.arc(ledX, ledY, ledRadius + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fill();

      // Inner bright LED
      ctx.shadowBlur = 6;
    }
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.bypassed ? '#440000' : '#FF2200';
    ctx.fill();
    // Hot center highlight
    if (!this.bypassed) {
      ctx.beginPath();
      ctx.arc(ledX, ledY, ledRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FF8866';
      ctx.fill();
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label text below LED
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, x + w / 2, y + h * 0.22 + 10);

    // Stomp button (silver rectangle)
    const btn = this.getStompButtonRect();
    ctx.fillStyle = '#C0C0C0';
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 3);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
