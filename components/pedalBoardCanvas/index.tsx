import PatchCable, { cableSide } from 'components/patchCable';
import Pedal from 'components/pedal/base';
import useWindowDimensions from 'hooks/useWindowDimensions';
import React, { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  cables: PatchCable[];
  pedals: Pedal[];
}

const PedalBoardCanvas = ({
  cables,
  pedals
} : Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentMovingRect = useRef<Pedal | PatchCable | null>(null);

  const windowDimensions = useWindowDimensions();

  const draw = useCallback(() => {
    const context = canvasRef.current?.getContext('2d');

    if (!context) return;

    context.clearRect(
      0,
      0,
      context.canvas.width,
      context.canvas.height
    );

    pedals.forEach(pedal => {
      pedal.draw(context);
    });

    cables.forEach(cable => {
      cable.draw(context);
    });
  }, [cables, pedals])

  const getPedalToPlugInto = useCallback((x: number, y: number, side: cableSide) => {
    return pedals.find(pedal => {
      const pedalEdgeX = side === 'left' ? pedal.getRightEdgeX() : pedal.getLeftEdgeX();
      const pedalDeltaX = x - pedalEdgeX;
      const isCloseEnough = Math.abs(pedalDeltaX) < 30;

      if (!isCloseEnough) {
        return false;
      }

      const pedalTopEdge = pedal.getTopEdgeY();
      const pedalBottomEdge = pedal.getBottomEdgeY();
      const isVerticallyWithinPedal = (y > pedalTopEdge) && (y < pedalBottomEdge);

      return isVerticallyWithinPedal;
    });
  }, [pedals]);

  const plugPatchCableIntoNearestPedal = useCallback((patchCable: PatchCable) => {
    const direction = patchCable.isMovingLeftSide() ? 'left' : 'right';
    const patchCableX = patchCable.isMovingLeftSide() ? patchCable.getLeftCaseX() : patchCable.getRightCaseX();
    const patchCableY = patchCable.isMovingLeftSide() ? patchCable.getLeftCaseY() : patchCable.getRightCaseY();

    if (direction === 'left') {
      patchCable.unplugLeftSide();
    } else {
      patchCable.unplugRightSide();
    }

    const pedal = getPedalToPlugInto(patchCableX, patchCableY, direction);
    if (pedal) {
      if (direction === 'left') {
        patchCable.plugLeftSideIntoPedal(pedal);
        pedal.plugInOutputCable(patchCable);
      } else {
        patchCable.plugRightSideIntoPedal(pedal);
        pedal.plugInInputCable(patchCable);
      }

      draw();
    }
  }, [draw, getPedalToPlugInto]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!currentMovingRect.current) {
      return;
    }

    currentMovingRect.current.move(e.movementX, e.movementY);
    draw();
  }, [draw]);

  const onMouseUp = useCallback((e: MouseEvent) => {
    document.removeEventListener('mousemove', onMouseMove);

    if (!(currentMovingRect.current instanceof PatchCable)) {
      return;
    }

    plugPatchCableIntoNearestPedal(currentMovingRect.current);
    draw();
  }, [draw, onMouseMove, plugPatchCableIntoNearestPedal]);

  const onMouseDown = useCallback((e: MouseEvent) => {
    const pedalToMove = pedals.find(pedal => pedal.isInside(e.offsetX, e.offsetY));
    const cableToMove = cables.find(cable => cable.isInside(e.offsetX, e.offsetY));

    if (pedalToMove) {
      currentMovingRect.current = pedalToMove;
    }

    if (cableToMove) {
      cableToMove.setMoving(e.offsetX, e.offsetY);
      currentMovingRect.current = cableToMove;
    }

    if (pedalToMove || cableToMove) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  }, [onMouseMove, onMouseUp, cables, pedals]);

  useEffect(() => {
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    }
  }, [onMouseDown]);

  useEffect(() => {
    draw();
  }, [draw, cables, pedals, windowDimensions])

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px dashed black',
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 16px)',
        margin: '8px',
      }}
      width={canvasRef.current?.offsetWidth}
      height={canvasRef.current?.offsetHeight}
    />
  )
}

export default PedalBoardCanvas;
