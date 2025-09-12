import React, { useRef, useEffect, useState } from 'react';

// props: width, height, stompClient (optional), projectId
export default function WhiteboardCanvas({ width = 1200, height = 600, onLocalStroke = null, remoteStroke = null }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#111827');
  const [thickness, setThickness] = useState(2);
  const currentStroke = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }, []);

  const toCanvasPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startStroke = (p) => {
    currentStroke.current = [p];
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
  };

  const appendStroke = (p) => {
    currentStroke.current.push(p);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const endStroke = async () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
    // emit stroke via callback (publish handled by caller/hook)
    if (typeof onLocalStroke === 'function') {
      try {
        onLocalStroke({ type: 'whiteboard.stroke', stroke: { color, thickness, points: currentStroke.current } });
      } catch (err) {
        console.error('onLocalStroke callback failed', err);
      }
    }
    currentStroke.current = [];
  };

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    canvas.setPointerCapture(e.pointerId);
    const p = toCanvasPoint(e);
    startStroke(p);
    setIsDrawing(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const p = toCanvasPoint(e);
    appendStroke(p);
  };

  const handlePointerUp = (e) => {
    try { canvasRef.current.releasePointerCapture(e.pointerId); } catch (err) {}
    endStroke();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // draw remote stroke when remoteStroke prop changes
  useEffect(() => {
    if (!remoteStroke || !remoteStroke.stroke) return;
    try {
      const { color: c, thickness: t, points } = remoteStroke.stroke;
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.strokeStyle = c;
      ctx.lineWidth = t;
      points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.closePath();
    } catch (err) {
      console.error('Failed to render remote stroke', err);
    }
  }, [remoteStroke]);

  return (
    <div className="whiteboard-canvas-wrapper">
      <div className="whiteboard-tools-top">
        <label className="text-xs">Color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <label className="text-xs">Thickness <input type="range" min="1" max="12" value={thickness} onChange={(e) => setThickness(Number(e.target.value))} /></label>
        <button className="btn-ghost" onClick={clear}>Clear</button>
      </div>
      <div className="whiteboard-canvas-area">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="whiteboard-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  );
}
