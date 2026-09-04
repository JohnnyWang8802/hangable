# Hangable - WebMCP Challenge Submission

## Inspiration

Landscape planning and courtyard design are inherently collaborative processes. Traditionally, designers sketch by hand while consulting with clients, but the feedback loop is slow. With WebMCP, we can create a shared canvas where a human sketches ideas and an AI agent contributes structured elements in real-time—all in the same browser tab, with no backend required.

## What it does

Hangable is a one-page courtyard sketch sheet. A person draws freehand with the mouse. An AI agent (like ChatGPT or Claude) calls WebMCP tools to add contour lines, water features, plantings, and paths on the same sheet. Together, they produce a hangable analog-looking landscape plan.

**Key Features:**
- Human freehand drawing with mouse
- AI agent tools: `lay_contour`, `lay_water`, `lay_planting`, `lay_path`, `clear_sheet`, `export_sheet`
- Shared document state between human and agent
- Export to PNG for printing or sharing

## Why WebMCP is a Strong Fit

WebMCP is ideal for collaborative, stateful, visual applications where human and agent contributions need to coexist in the same interface:

1. **Shared Context**: Traditional LLM tools operate in a black box. With WebMCP, the agent sees and modifies the same canvas state the user sees. No synchronization issues.

2. **Stateful Tools**: Landscape planning isn't a single query-response. It's iterative: "add a contour," then "now add a water feature near the top," then "place three trees along the path." WebMCP tools mutate shared state, so each agent call builds on the last.

3. **Visual Feedback**: Unlike text-based tools, Hangable's tools have immediate visual output. The user sees exactly what the agent added, and can manually adjust or ask for changes.

4. **No Backend Required**: WebMCP tools execute in the browser's JavaScript context. No API calls, no server-side rendering, no CORS. The entire collaboration happens client-side, reducing latency and complexity.

## Better UX Through WebMCP

**Before WebMCP:**
- User describes what they want in natural language
- Agent tries to generate an image or suggest manual steps
- No way to incrementally refine the same artifact
- No shared state between conversation and canvas

**With WebMCP:**
- User and agent work on the same live canvas
- Agent calls structured tools with precise parameters (coordinates, colors, labels)
- User can manually adjust agent-placed elements by drawing over them
- Export the final product as a PNG, ready to hang

**Concrete Example:**

User: "Add a water feature flowing from top-left to bottom-right"

Agent calls `lay_water` with:
```json
{
  "points": [
    {"x": 100, "y": 50},
    {"x": 200, "y": 150},
    {"x": 300, "y": 250},
    {"x": 400, "y": 350},
    {"x": 500, "y": 450}
  ]
}
```

Instantly, a blue flowing line appears on the canvas. User sees it, says "make it curve more," agent adjusts the points in a second call. This tight loop is only possible with WebMCP.

## What People and Agents Can Do Together

1. **Human sets the overall vision**: Draws rough boundaries, horizon line, focal points
2. **Agent adds structured elements**: Places contour lines at regular intervals, adds paths that respect the boundary, places plantings symmetrically
3. **Human refines**: Draws additional foliage, shading, or annotations over the agent's precise geometry
4. **Agent cleans up**: Calls `export_sheet` to download the final PNG

**This workflow was hard before WebMCP because:**
- Agents couldn't directly manipulate browser-side canvas state
- No standard way to expose "draw a line at these coordinates" as a tool
- Agents would hallucinate coordinates or produce disconnected assets
- No shared document state meant the agent couldn't see what the user had drawn

**WebMCP solves this by:**
- Giving agents a structured API to the same canvas the user draws on
- Enforcing schemas so coordinates are valid (0-800 for x, 0-600 for y)
- Making tools stateful: each call updates the same canvas, so context persists
- Allowing manual testing via DevTools so developers can debug before deploying to agents

## How WebMCP Was Implemented

### 1. Tool Registration

On page load, Hangable calls `document.modelContext.registerTool()` six times, once for each tool. Each tool includes:

- **`name`**: Snake-case identifier (e.g., `lay_contour`)
- **`description`**: Natural language explanation for the agent
- **`inputSchema`**: JSON Schema defining parameters (e.g., array of `{x, y}` points)
- **`execute`**: Async callback that mutates React state to add elements to the canvas

Example:

```typescript
await modelContext.registerTool({
  name: 'lay_water',
  description: 'Draw a water feature path (stream, pond edge) on the sheet.',
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
    return { content: [{ type: 'text', text: 'Laid water feature' }] };
  }
});
```

### 2. Shared State

Human drawing and agent tools both update the same React state array (`elements`). The canvas re-renders on every state change, showing all elements together.

### 3. Canvas Rendering

A `useEffect` hook watches `elements` and redraws the canvas on every update. Each element has a `type` (contour, water, planting, path, user-drawing), which determines color and label.

### 4. Tool Lifecycle

Tools are registered with an `AbortController` signal. When the component unmounts (user navigates away), all tools are unregistered via `controller.abort()`.

### 5. Testing

Developers can:
- Enable `chrome://flags/#enable-webmcp-testing`
- Open DevTools → Application → WebMCP
- See all six registered tools
- Manually execute tools with custom JSON input
- Verify the canvas updates correctly

### 6. Agent Integration

Once deployed, users open the app in ChatGPT's in-app browser or any WebMCP-capable agent. The agent discovers tools via `document.modelContext.getTools()` and calls them via `document.modelContext.executeTool()`.

## Technical Challenges

1. **Canvas Coordinate System**: WebMCP tools use absolute coordinates, but mouse events return client-relative coords. Solved by computing `rect.left` and `rect.top` offsets.

2. **Tool Lifecycle in React**: React's strict mode mounts components twice in dev, which would double-register tools. Solved by using `AbortController` and cleanup in `useEffect`.

3. **Export Stability**: Exporting mid-draw would capture the incomplete path. Solved by separating `currentPath` state (temporary) from `elements` state (persisted).

4. **Cross-Origin Testing**: ChatGPT's in-app browser requires HTTPS and valid TLS. Solved by deploying to Cloudflare Pages with automatic HTTPS.

## Accomplishments

- ✅ Six non-trivial WebMCP tools registered and working
- ✅ Human and agent can collaborate on the same canvas
- ✅ Real-time visual feedback for tool execution
- ✅ Export to PNG works from both UI button and agent tool
- ✅ Clean, minimal UI with no distractions
- ✅ Fully client-side, no backend required
- ✅ Works in ChatGPT's in-app browser
- ✅ Works in Chrome 149+ with flag enabled

## What We Learned

1. **WebMCP is perfect for visual, stateful tools**: Text-based tools return JSON. WebMCP tools can mutate UI state, making them ideal for collaborative drawing.

2. **Schema design matters**: Agents are better at calling tools when schemas are explicit (e.g., `enum: ['tree', 'shrub']` instead of freeform string).

3. **Tools should be composable**: Instead of one giant "draw_courtyard" tool, six small tools let agents and users build complex plans incrementally.

4. **Testing is easier than expected**: Chrome DevTools' WebMCP panel makes it trivial to test tools before deploying to agents.

5. **No backend simplifies deployment**: Hangable is a static site. No API keys, no database, no CORS. Just HTML/CSS/JS.

## What's Next for Hangable

- **Undo/Redo**: Add history stack for both human and agent actions
- **Layers**: Separate layers for contour, water, planting, path so they can be toggled
- **Templates**: Pre-built courtyard layouts agents can instantiate and customize
- **Measurement Tools**: Add rulers, distance calculation, area calculation
- **Collaboration**: Real-time multi-user editing with WebRTC and shared WebMCP state
- **Mobile Support**: Touch-based drawing for tablets

## Built With

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- HTML Canvas 2D API
- WebMCP (document.modelContext API)
- Cloudflare Pages

## Try It

🔗 **[https://hangable.pages.dev](https://hangable.pages.dev)**

1. Open in ChatGPT or Chrome 149+ with `chrome://flags/#enable-webmcp-testing`
2. Draw some rough shapes with your mouse
3. Ask the agent: "Add a water feature in the center and place three trees along the top"
4. Watch the agent's tools appear on your canvas in real-time
5. Click "Take the sheet" to export as PNG

---

**Submission for OpenAI WebMCP Challenge (September 2026)**

**Author**: Johnny Wang  
**Repository**: https://github.com/your-username/hangable  
**License**: MIT
