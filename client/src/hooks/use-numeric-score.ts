import { useEffect, useRef } from "react";

interface DrawOptions {
  text: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function useNumericScore({ text, canvasRef }: DrawOptions) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas Configuration
    const PADDING = 40;
    const LINE_HEIGHT = 80;
    const FONT_SIZE = 24;
    const NUMBER_SPACING = 30; // Horizontal space per character
    const CANVAS_WIDTH = 800; // Fixed width for A4-ish feel
    
    // Calculate required height based on content
    const chars = text.split("");
    let currentX = PADDING;
    let currentY = PADDING + FONT_SIZE;
    
    // Simulate a pass to determine height
    // We treat newlines as line breaks, and auto-wrap if too long
    let totalLines = 1;
    
    // Setup Context for measuring
    ctx.font = `bold ${FONT_SIZE}px "JetBrains Mono", monospace`;
    
    const lines = text.split('\n');
    let calculatedHeight = PADDING * 2; // Top/Bottom padding

    lines.forEach((line) => {
      // Very simple estimation: just count lines based on explicit newlines for now
      // A more robust version would measure text width and wrap
      calculatedHeight += LINE_HEIGHT;
    });
    
    // Ensure minimum height
    if (calculatedHeight < 600) calculatedHeight = 600;

    // Set canvas dimensions (high DPI support could go here)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = calculatedHeight * dpr;
    
    // Style for CSS display
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${calculatedHeight}px`;

    // Scale context
    ctx.scale(dpr, dpr);

    // --- DRAWING ---

    // 1. Background (White Paper)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, calculatedHeight);

    // 2. Setup Font Styles
    ctx.font = `500 ${FONT_SIZE}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "middle";
    
    let drawY = PADDING + LINE_HEIGHT / 2;

    lines.forEach((lineStr) => {
      // Draw Staff Line
      ctx.beginPath();
      ctx.strokeStyle = "#e2e8f0"; // slate-200
      ctx.lineWidth = 2;
      ctx.moveTo(PADDING, drawY);
      ctx.lineTo(CANVAS_WIDTH - PADDING, drawY);
      ctx.stroke();

      // Draw Characters
      let drawX = PADDING + 10;
      
      const chars = lineStr.split('');
      chars.forEach(char => {
        // Skip some whitespace if needed, or render it as spacing
        if (char === ' ') {
          drawX += NUMBER_SPACING;
          return;
        }

        if (char === '|') {
          // Bar line
          ctx.beginPath();
          ctx.strokeStyle = "#94a3b8"; // slate-400
          ctx.lineWidth = 2;
          ctx.moveTo(drawX + NUMBER_SPACING/2, drawY - 20);
          ctx.lineTo(drawX + NUMBER_SPACING/2, drawY + 20);
          ctx.stroke();
          drawX += NUMBER_SPACING + 10; // Extra space around bars
        } else {
          // Numbers or other chars
          ctx.fillStyle = "#0f172a"; // slate-900
          ctx.textAlign = "center";
          
          // Draw the character
          ctx.fillText(char, drawX + NUMBER_SPACING/2, drawY);
          
          // If it's a number, maybe add a subtle dot below if it's a low note?
          // (Just simulating standard Jianpu notation aesthetics simply)
          
          drawX += NUMBER_SPACING;
        }
      });

      // Move to next line
      drawY += LINE_HEIGHT;
    });

  }, [text, canvasRef]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "numeric-score.png";
    link.href = dataUrl;
    link.click();
  };

  return { downloadPng };
}
