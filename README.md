# Hangable
 
A collaborative courtyard sketch sheet that enables humans and AI agents to work together on landscape planning using WebMCP.
 
## Live Demo
 
🔗 **[https://johnnywang8802.github.io/hangable/](https://johnnywang8802.github.io/hangable/)**

**Repository**: https://github.com/JohnnyWang8802/hangable

## What is Hangable?

Hangable is a one-page web application where you can sketch courtyard and landscape plans. You draw with your mouse, and an AI agent (like ChatGPT) can call WebMCP tools on the same sheet to add contour lines, water features, plantings, and paths. Together, you create a hangable analog-looking plan.

## Features

- **Human Drawing**: Click and drag to sketch freehand on a cream-colored canvas
- **Agent Tools**: AI agents can programmatically add landscape elements via WebMCP
- **Collaborative**: Human and agent work on the same shared document state
- **Export**: Download your finished plan as a PNG image

## WebMCP Tools

Hangable registers six WebMCP tools that agents can discover and call:

1. **`lay_contour`** - Draw a contour line (polyline or bounding box) to define elevation changes or plot boundaries
2. **`lay_water`** - Add a water feature path (stream, pond edge) as a flowing blue line
3. **`lay_planting`** - Place a planting marker (tree, shrub, flower bed, grass) at specific coordinates
4. **`lay_path`** - Draw a walking path or paved area as a gray line
5. **`clear_sheet`** - Clear the entire sheet, removing all elements
6. **`export_sheet`** - Trigger a PNG download of the current sheet

All tools share the same canvas state, so human drawings and agent-placed elements appear together in real-time.

## How to Run Locally

 ```bash
# Clone the repository
git clone <your-repo-url>
cd hangable

# Install dependencies
npm install

# Start the development server
 npm run dev
 ```
 
Open [http://localhost:3000](http://localhost:3000) in your browser.
 
## Testing with WebMCP
 
### Option 1: ChatGPT In-App Browser
 
1. Open ChatGPT (requires Plus or Pro subscription with browsing enabled)
2. Ask ChatGPT to open the deployed URL: "Open https://johnnywang8802.github.io/hangable/"
3. Give instructions like: "Lay a contour around the edges" or "Add a water feature flowing from top to bottom"
4. ChatGPT will discover and call the registered tools automatically
 
### Option 2: Chrome with WebMCP Flag
 
1. Use Chrome 149 or later
2. Enable WebMCP: Navigate to `chrome://flags/#enable-webmcp-testing` and set it to **Enabled**
3. Restart Chrome
4. Open the Hangable app
5. Open DevTools → Application panel → WebMCP section to see registered tools
6. You can manually test tool execution from DevTools or integrate with a local AI agent
 
### Verification
 
Open the browser console and look for:
```
Registered tool: lay_contour
Registered tool: lay_water
Registered tool: lay_planting
Registered tool: lay_path
Registered tool: clear_sheet
Registered tool: export_sheet
WebMCP tools registered successfully
```
 
If you see "WebMCP not available", ensure the flag is enabled and you're using Chrome 149+.
 
## How WebMCP Works in Hangable

WebMCP (Web Model Context Protocol) allows web applications to expose JavaScript functions as structured tools for AI agents. Here's how Hangable implements it:

1. **Tool Registration**: On page load, the app calls `document.modelContext.registerTool()` for each landscape tool
2. **Schema Definition**: Each tool has a JSON Schema describing its inputs (e.g., points array, coordinates, planting type)
3. **Execution Context**: When an agent calls a tool, the `execute` callback runs in the browser's JavaScript context
4. **Shared State**: Tools use React state (`setElements`) to add elements to the same canvas array that human drawing uses
5. **Real-Time Updates**: The canvas re-renders whenever state changes, showing both human and agent contributions

All tool logic runs client-side. No backend is required. The agent and the user share the same document state.

## Prior vs New Work

**New Work (created during hackathon):**
- All Hangable application code (canvas drawing, WebMCP tool registration, UI)
- WebMCP tool implementations for landscape planning
- README, SUBMISSION.md, and deployment configuration

**Prior Work:**
- Next.js framework (open-source, MIT)
- Tailwind CSS (open-source, MIT)
- WebMCP specification (W3C Community Group draft standard)

All Hangable-specific code is original and written for this submission.

## Tech Stack

- **Next.js 16** (React 19, App Router, TypeScript)
- **Tailwind CSS** for styling
- **HTML Canvas 2D** for drawing
- **WebMCP** for agent tool registration
- **Cloudflare Pages** for deployment

## License

MIT License - see [LICENSE](./LICENSE)

## Submission

This project was created for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/).

- **Submission Date**: September 2026
- **Challenge Focus**: Demonstrating non-trivial WebMCP usage for human-AI collaboration
- **Author**: Johnny Wang

---

**Note**: China residents are ineligible for prizes, but this is a complete portfolio submission demonstrating WebMCP capabilities.
