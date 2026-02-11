import PatchCable, { cableSide } from 'components/patchCable';
import Pedal from 'components/pedal/base';
import useWindowDimensions from 'hooks/useWindowDimensions';
import React, { useCallback, useEffect, useRef } from 'react';

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

    cables.forEach(cable => {
      cable.draw(context);
    });

    pedals.forEach(pedal => {
      pedal.draw(context);
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
      } else {
        patchCable.plugRightSideIntoPedal(pedal);
      }

      draw();
    }
  }, [draw, getPedalToPlugInto]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!currentMovingRect.current) {
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'grabbing';
    }

    currentMovingRect.current.move(e.movementX, e.movementY);
    draw();
  }, [draw]);

  const onMouseUp = useCallback((e: MouseEvent) => {
    document.removeEventListener('mousemove', onMouseMove);

    if (!currentMovingRect.current) return;

    if (currentMovingRect.current instanceof PatchCable) {
      plugPatchCableIntoNearestPedal(currentMovingRect.current);
    }

    currentMovingRect.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'grab';
    }

    draw();
  }, [draw, onMouseMove, plugPatchCableIntoNearestPedal]);

  const onCanvasMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Don't change cursor while dragging
    if (currentMovingRect.current) return;

    const isOverStompButton = pedals.some(pedal => pedal.isStompButtonHit(e.offsetX, e.offsetY));
    if (isOverStompButton) {
      canvas.style.cursor = 'pointer';
      return;
    }

    const isOverPedal = pedals.some(pedal => pedal.isInside(e.offsetX, e.offsetY));
    const isOverCable = cables.some(cable => cable.isInside(e.offsetX, e.offsetY));
    if (isOverPedal || isOverCable) {
      canvas.style.cursor = 'grab';
      return;
    }

    canvas.style.cursor = 'default';
  }, [pedals, cables]);

  const onMouseDown = useCallback((e: MouseEvent) => {
    // Check if a stomp button was clicked
    const stompedPedal = pedals.find(pedal => pedal.isStompButtonHit(e.offsetX, e.offsetY));
    if (stompedPedal) {
      stompedPedal.toggleBypass();
      draw();
      return;
    }

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
  }, [onMouseMove, onMouseUp, cables, pedals, draw]);

  useEffect(() => {
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    }
  }, [onMouseDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', onCanvasMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', onCanvasMouseMove);
    }
  }, [onCanvasMouseMove]);

  useEffect(() => {
    draw();
  }, [draw, cables, pedals, windowDimensions])

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px dashed black',
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 24px)',
        margin: '8px',
      }}
      width={canvasRef.current?.offsetWidth}
      height={canvasRef.current?.offsetHeight}
    />
  )
}

export default PedalBoardCanvas;
