import Pedal from 'components/pedal/base';

const caseHeight = 15;
const caseWidth = 50;

const contactHeight = caseHeight / 2;
const contactWidth = caseWidth * ( 2 / 3 );

export type cableSide = 'left' | 'right';

class PatchCable {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  sideToMove: cableSide | null;
  inputPedal: Pedal | null;
  outputPedal: Pedal | null;

  constructor(x: number, y: number) {
    this.x1 = x;
    this.y1 = y;

    this.x2 = x + 400;
    this.y2 = y + 200;

    this.sideToMove = null;
    this.inputPedal = null;
    this.outputPedal = null;
  }

  getLeftCaseX() {
    return this.x1 + contactWidth;
  }

  getRightCaseX() {
    return this.x2 + caseWidth;
  }

  getLeftCaseY() {
    return this.y1 + (contactHeight / 2);
  }

  getRightCaseY() {
    return this.y2 + contactHeight;
  }

  getInputPedal() {
    return this.inputPedal;
  }

  getOutputPedal() {
    return this.outputPedal;
  }

  isMovingLeftSide() {
    return this.sideToMove === 'left';
  }

  isMovingRightSide() {
    return this.sideToMove === 'right';
  }

  move(x: number, y: number) {
    if (!this.sideToMove) {
      return;
    }

    if (this.sideToMove === 'left') {
      this.moveLeftSide(x, y);
    } else {
      this.moveRightSide(x, y);
    }
  }

  moveLeftSide(x: number, y: number) {
    this.x1 += x;
    this.y1 += y;
  }

  moveRightSide(x: number, y: number) {
    this.x2 += x;
    this.y2 += y;
  }

  plugLeftSideIntoPedal(pedal: Pedal) {
    const pedalDeltaX = this.getLeftCaseX() - pedal.getRightEdgeX();

    this.inputPedal = pedal;
    this.move(-pedalDeltaX, 0);

    pedal.plugInOutputCable(this);
  }

  plugRightSideIntoPedal(pedal: Pedal) {
    const pedalDeltaX = this.getRightCaseX() - pedal.getLeftEdgeX();

    this.outputPedal = pedal;
    this.move(-pedalDeltaX, 0);

    pedal.plugInInputCable(this);
  }

  unplugLeftSide() {
    if (this.inputPedal) {
      this.inputPedal.unplugOutputCable();
    }

    this.inputPedal = null;
  }

  unplugRightSide() {
    if (this.outputPedal) {
      this.outputPedal.unplugInputCable();
    }

    this.outputPedal = null;
  }

  isInsideLeft(x: number, y: number) {
    return (
      x >= this.x1 &&
      x <= (this.x1 + caseWidth + contactWidth) &&
      y >= this.y1 - (contactHeight / 2) &&
      y <= (this.y1 - (contactHeight / 2) + caseHeight)
    );
  }

  isInsideRight(x: number, y: number) {
    return (
      x >= this.x2 &&
      x <= (this.x2 + caseWidth + contactWidth) &&
      y >= this.y2 - (contactHeight / 2) &&
      y <= (this.y2 - (contactHeight / 2) + caseHeight)
    );
  }

  isInside(x: number, y: number) {
    return this.isInsideLeft(x, y) || this.isInsideRight(x, y);
  }

  setMoving(x: number, y: number) {
    if (this.isInsideLeft(x, y)) {
      this.sideToMove = 'left';
    } else if (this.isInsideRight(x, y)) {
      this.sideToMove = 'right';
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const previousFillStyle = ctx.fillStyle;

    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(this.x1, this.y1, contactWidth, contactHeight);
    ctx.fillRect(
      this.x1 + contactWidth,
      this.y1 - (contactHeight / 2),
      caseWidth,
      caseHeight
     );


    ctx.fillRect(this.x2, this.y2, caseWidth, caseHeight);
    ctx.fillRect(
      this.x2 + caseWidth,
      this.y2 + (contactHeight / 2),
      contactWidth,
      contactHeight
    );

    const CableStartX = this.x1 + contactWidth + caseWidth;
    const CableStartY = this.y1 + ( 0.5 * contactHeight );
    const CableEndX = this.x2;
    const CableEndY = this.y2 + ( 0.5 * caseHeight );

    const cp1X = CableStartX + ( (CableEndX - CableStartX) * (1 / 3) );
    const cp1Y = CableStartY;
    const cp2X = CableStartX + ( (CableEndX - CableStartX) * (2 / 3) );
    const cp2Y = CableEndY;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(CableStartX, CableStartY);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, CableEndX , CableEndY);
    ctx.stroke();

    ctx.fillStyle = previousFillStyle;
  }
}

export default PatchCable;
