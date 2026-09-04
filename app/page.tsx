'use client';
 
import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  type: 'contour' | 'water' | 'planting' | 'path' | 'user-drawing';
  points: Point[];
  color?: string;
  label?: string;
}

 export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [prompt, setPrompt] = useState('');

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFEF5';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    elements.forEach((element) => {
      if (element.points.length < 2) return;

      ctx.strokeStyle = element.color || '#333';
      ctx.lineWidth = element.type === 'user-drawing' ? 1.5 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      for (let i = 1; i < element.points.length; i++) {
        ctx.lineTo(element.points[i].x, element.points[i].y);
      }
      ctx.stroke();

      if (element.label && element.points.length > 0) {
        const midPoint = element.points[Math.floor(element.points.length / 2)];
        ctx.fillStyle = element.color || '#333';
        ctx.font = '12px sans-serif';
        ctx.fillText(element.label, midPoint.x + 5, midPoint.y - 5);
      }
    });

    if (currentPath.length > 0) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  }, [elements, currentPath]);

  useEffect(() => {
    const modelContext = (document as any).modelContext || (navigator as any).modelContext;
    
    if (!modelContext || typeof modelContext.registerTool !== 'function') {
      console.log('WebMCP not available. Enable chrome://flags/#enable-webmcp-testing');
      return;
    }

    const controllers: AbortController[] = [];

    const registerToolSafe = async (toolDef: any) => {
      try {
        const controller = new AbortController();
        controllers.push(controller);
        await modelContext.registerTool(toolDef, { signal: controller.signal });
        console.log(`Registered tool: ${toolDef.name}`);
      } catch (err) {
        console.error(`Failed to register tool ${toolDef.name}:`, err);
      }
    };

    registerToolSafe({
      name: 'lay_contour',
      description: 'Draw a contour line on the courtyard sheet. Accepts an array of points forming a polyline or a bounding box (4 corners). Use this to define elevation changes or plot boundaries.',
      inputSchema: {
        type: 'object',
        properties: {
          points: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                x: { type: 'number', description: 'X coordinate (0-800)' },
                y: { type: 'number', description: 'Y coordinate (0-600)' }
              },
              required: ['x', 'y']
            },
            description: 'Array of points forming the contour line'
          }
        },
        required: ['points']
      },
      execute: async (input: any) => {
        const points = input.points || [];
        if (points.length < 2) {
          return { content: [{ type: 'text', text: 'Need at least 2 points for a contour line' }] };
        }
        setElements(prev => [...prev, {
          type: 'contour',
          points,
          color: '#8B4513',
          label: 'contour'
        }]);
        return { content: [{ type: 'text', text: `Laid contour with ${points.length} points` }] };
      }
    });

    registerToolSafe({
      name: 'lay_water',
      description: 'Draw a water feature path (stream, pond edge) on the sheet. Creates a flowing blue line representing water.',
      inputSchema: {
        type: 'object',
        properties: {
          points: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                x: { type: 'number', description: 'X coordinate (0-800)' },
                y: { type: 'number', description: 'Y coordinate (0-600)' }
              },
              required: ['x', 'y']
            },
            description: 'Array of points forming the water path'
          }
        },
        required: ['points']
      },
      execute: async (input: any) => {
        const points = input.points || [];
        if (points.length < 2) {
          return { content: [{ type: 'text', text: 'Need at least 2 points for a water feature' }] };
        }
        setElements(prev => [...prev, {
          type: 'water',
          points,
          color: '#4169E1',
          label: 'water'
        }]);
        return { content: [{ type: 'text', text: `Laid water feature with ${points.length} points` }] };
      }
    });

    registerToolSafe({
      name: 'lay_planting',
      description: 'Place a planting marker on the sheet at specific coordinates. Represents trees, shrubs, or garden areas.',
      inputSchema: {
        type: 'object',
        properties: {
          x: { type: 'number', description: 'X coordinate (0-800)' },
          y: { type: 'number', description: 'Y coordinate (0-600)' },
          kind: { 
            type: 'string', 
            description: 'Type of planting (e.g., tree, shrub, flower bed)',
            enum: ['tree', 'shrub', 'flower bed', 'grass']
          }
        },
        required: ['x', 'y']
      },
      execute: async (input: any) => {
        const x = input.x;
        const y = input.y;
        const kind = input.kind || 'planting';
        const size = 15;
        const circlePoints: Point[] = [];
        for (let angle = 0; angle <= 360; angle += 20) {
          const rad = (angle * Math.PI) / 180;
          circlePoints.push({
            x: x + size * Math.cos(rad),
            y: y + size * Math.sin(rad)
          });
        }
        setElements(prev => [...prev, {
          type: 'planting',
          points: circlePoints,
          color: '#228B22',
          label: kind
        }]);
        return { content: [{ type: 'text', text: `Placed ${kind} at (${x}, ${y})` }] };
      }
    });

    registerToolSafe({
      name: 'lay_path',
      description: 'Draw a walking path or paved area on the sheet. Creates a gray line representing pathways.',
      inputSchema: {
        type: 'object',
        properties: {
          points: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                x: { type: 'number', description: 'X coordinate (0-800)' },
                y: { type: 'number', description: 'Y coordinate (0-600)' }
              },
              required: ['x', 'y']
            },
            description: 'Array of points forming the path'
          }
        },
        required: ['points']
      },
      execute: async (input: any) => {
        const points = input.points || [];
        if (points.length < 2) {
          return { content: [{ type: 'text', text: 'Need at least 2 points for a path' }] };
        }
        setElements(prev => [...prev, {
          type: 'path',
          points,
          color: '#808080',
          label: 'path'
        }]);
        return { content: [{ type: 'text', text: `Laid path with ${points.length} points` }] };
      }
    });

    registerToolSafe({
      name: 'clear_sheet',
      description: 'Clear the entire courtyard sheet, removing all drawn elements (both user drawings and agent-placed items).',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      execute: async () => {
        setElements([]);
        return { content: [{ type: 'text', text: 'Sheet cleared' }] };
      }
    });

    registerToolSafe({
      name: 'export_sheet',
      description: 'Export the current courtyard sheet as a PNG image. This triggers a download for the user.',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      execute: async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return { content: [{ type: 'text', text: 'Canvas not available' }] };
        }
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `hangable-${Date.now()}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });
          return { content: [{ type: 'text', text: 'Sheet exported as PNG' }] };
        } catch (err) {
          return { content: [{ type: 'text', text: `Export failed: ${err}` }] };
        }
      }
    });

    console.log('WebMCP tools registered successfully');

    return () => {
      controllers.forEach(c => c.abort());
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath(prev => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length > 1) {
      setElements(prev => [...prev, { type: 'user-drawing', points: currentPath }]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hangable-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleClear = () => {
    setElements([]);
  };

   return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hangable</h1>
        <p className="text-gray-600">A collaborative courtyard sketch sheet</p>
      </div>

      <div className="relative mb-4" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="border-2 border-gray-300 cursor-crosshair shadow-lg"
          style={{ background: '#FFFEF5' }}
         />
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleExport}
          className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          Take the sheet (PNG)
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
        >
          Clear sheet
        </button>
      </div>

      <div className="max-w-2xl text-center text-sm text-gray-500">
        <p className="mb-2">Draw with your mouse. Ask an AI agent to help you plan.</p>
        <p className="italic">Example: &quot;Lay a contour around the edges&quot; or &quot;Add a water feature in the center&quot;</p>
      </div>

      <div className="mt-8 text-xs text-gray-400">
        <p>WebMCP tools: lay_contour, lay_water, lay_planting, lay_path, clear_sheet, export_sheet</p>
      </div>
     </div>
   );
 }
