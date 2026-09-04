# Hangable Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Window                        │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │           Next.js App (Client-Side)               │  │
│  │                                                   │  │
│  │  ┌─────────────┐         ┌──────────────┐       │  │
│  │  │   Mouse     │────────▶│    React     │       │  │
│  │  │   Events    │         │    State     │       │  │
│  │  └─────────────┘         │  (elements)  │       │  │
│  │                          └──────┬───────┘       │  │
│  │  ┌─────────────┐               │               │  │
│  │  │   WebMCP    │───────────────┘               │  │
│  │  │   Tools     │                               │  │
│  │  │  (6 tools)  │                               │  │
│  │  └─────────────┘         ┌──────────────┐       │  │
│  │                          │    Canvas    │       │  │
│  │                          │   Renderer   │       │  │
│  │                          └──────────────┘       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │       document.modelContext (WebMCP API)          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Human Drawing Flow

```
Mouse Down ──▶ setState(drawing=true)
   │
   ▼
Mouse Move ──▶ Append point to currentPath ──▶ Re-render canvas
   │
   ▼
Mouse Up ──▶ Add currentPath to elements ──▶ Clear currentPath ──▶ Re-render
```

### Agent Tool Flow

```
ChatGPT calls lay_contour(points)
   │
   ▼
document.modelContext.executeTool()
   │
   ▼
Tool's execute() callback
   │
   ▼
setElements(prev => [...prev, new element])
   │
   ▼
useEffect triggers canvas re-render
   │
   ▼
User sees new element on canvas
```

## Component Structure

```
app/
├── layout.tsx              # Root layout, metadata
└── page.tsx                # Main component
    ├── Canvas rendering    # useEffect → ctx.stroke()
    ├── Mouse handlers      # onMouseDown/Move/Up
    ├── WebMCP registration # useEffect → registerTool()
    └── UI buttons          # Export, Clear
```

## State Management

```typescript
// React state
const [elements, setElements] = useState<DrawingElement[]>([]);
const [currentPath, setCurrentPath] = useState<Point[]>([]);
const [isDrawing, setIsDrawing] = useState(false);

// DrawingElement structure
interface DrawingElement {
  type: 'contour' | 'water' | 'planting' | 'path' | 'user-drawing';
  points: Point[];
  color?: string;
  label?: string;
}
```

## WebMCP Tool Registration

```typescript
useEffect(() => {
  const modelContext = document.modelContext || navigator.modelContext;
  
  const controllers: AbortController[] = [];
  
  // Register each tool
  const registerToolSafe = async (toolDef) => {
    const controller = new AbortController();
    controllers.push(controller);
    await modelContext.registerTool(toolDef, { signal: controller.signal });
  };
  
  // 6 tool registrations...
  
  // Cleanup on unmount
  return () => controllers.forEach(c => c.abort());
}, []);
```

## Canvas Rendering

```typescript
useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = '#FFFEF5';
  ctx.fillRect(0, 0, width, height);
  
  // Render all elements
  elements.forEach(element => {
    ctx.strokeStyle = element.color || '#333';
    ctx.beginPath();
    ctx.moveTo(element.points[0].x, element.points[0].y);
    element.points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    
    // Render label if present
    if (element.label) {
      ctx.fillText(element.label, x, y);
    }
  });
  
  // Render current path (while drawing)
  // ...
}, [elements, currentPath]);
```

## Tool Schema Example

```typescript
{
  name: 'lay_water',
  description: 'Draw a water feature path on the sheet.',
  inputSchema: {
    type: 'object',
    properties: {
      points: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            x: { type: 'number', description: 'X (0-800)' },
            y: { type: 'number', description: 'Y (0-600)' }
          },
          required: ['x', 'y']
        }
      }
    },
    required: ['points']
  },
  execute: async (input) => {
    setElements(prev => [...prev, {
      type: 'water',
      points: input.points,
      color: '#4169E1',
      label: 'water'
    }]);
    return { content: [{ type: 'text', text: 'Done' }] };
  }
}
```

## Export Flow

```
User clicks "Take the sheet" button
   │
   ▼
handleExport()
   │
   ▼
canvas.toBlob((blob) => ...)
   │
   ▼
URL.createObjectURL(blob)
   │
   ▼
Create <a> element with download attribute
   │
   ▼
Trigger click() programmatically
   │
   ▼
Browser downloads PNG
   │
   ▼
URL.revokeObjectURL(url) # Cleanup
```

## Performance Considerations

1. **Canvas Re-render**: Triggered only on state changes (elements, currentPath)
2. **Drawing Smoothness**: Mouse events append to array, no throttling needed for drawing quality
3. **Memory**: Canvas is 800x600px, ~1.4MB uncompressed bitmap
4. **Tool Execution**: Synchronous state updates, <1ms latency
5. **Export**: Client-side canvas.toBlob(), no network calls

## Security

- No server-side components
- No user authentication
- No data persistence
- No API keys or secrets
- All code runs in browser sandbox
- WebMCP tools only access local state

## Browser Compatibility

- **Chrome 149+**: Full WebMCP support with flag
- **ChatGPT Browser**: Full WebMCP support
- **Other Browsers**: Drawing works, WebMCP needs polyfill

## Deployment

- Static export (Next.js static build)
- No server-side rendering needed
- No environment variables required
- CDN-friendly (all assets static)
- HTTPS automatic on all platforms

## Scalability

- Single-user application (no concurrent collaboration)
- State limited by browser memory (~1000 elements typical)
- Canvas size fixed (800x600px)
- No backend to scale
- No database to maintain

## Future Architecture

For multi-user collaboration:

```
┌─────────────┐      WebRTC      ┌─────────────┐
│  Browser A  │◀────────────────▶│  Browser B  │
└─────────────┘                  └─────────────┘
      │                                │
      │         Sync State             │
      └────────────────────────────────┘
```

For persistence:

```
Browser ──▶ localStorage ──▶ Export JSON
   │
   └──▶ IndexedDB ──▶ Auto-save
```

---

**Design Principles**

1. **Simplicity**: No unnecessary abstractions
2. **Performance**: Direct canvas manipulation
3. **Reliability**: Synchronous state updates
4. **Transparency**: All operations visible in React DevTools
5. **Extensibility**: Easy to add new tools
