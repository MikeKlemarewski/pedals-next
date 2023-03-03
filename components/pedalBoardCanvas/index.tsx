import React, { useCallback, useEffect, useRef, useState } from 'react';

const PedalBoardCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    x: 0,
    y: 0,
  })

  const draw = useCallback(() => {
    const context = canvasRef.current?.getContext('2d');

    if (!context) return;

    context.clearRect(
      0,
      0,
      context.canvas.width,
      context.canvas.height
    );

    context.fillStyle = 'blue';
    context.fillRect(10, 10, 100, 400);
  }, [])

  const handleWindowResize = useCallback(() => {
    setCanvasDimensions({
      x: window.innerWidth - 100,
      y: window.innerHeight - 100,
    });

    window.requestAnimationFrame(draw);
  }, [setCanvasDimensions, draw])

  useEffect(() => {
    draw();
    setCanvasDimensions({
      x: window.innerWidth - 100,
      y: window.innerHeight - 100,
    });

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        margin: 'auto',
        border: '1px solid black'
      }}
      width={canvasDimensions.x}
      height={canvasDimensions.y}
    />
  )
}

export default PedalBoardCanvas;
