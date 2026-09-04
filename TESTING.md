# Testing Hangable

This document provides instructions for testing Hangable's WebMCP functionality.

## Quick Start

1. **Open the app**: http://localhost:43123 (for local) or the deployed URL
2. **Enable WebMCP** (Chrome only):
   - Navigate to `chrome://flags/#enable-webmcp-testing`
   - Set to "Enabled"
   - Restart Chrome
3. **Open DevTools** → **Application** panel → **WebMCP** section
4. You should see 6 registered tools

## Testing Tools Manually (Chrome DevTools)

### 1. lay_contour

Input:
```json
{
  "points": [
    {"x": 100, "y": 100},
    {"x": 700, "y": 100},
    {"x": 700, "y": 500},
    {"x": 100, "y": 500},
    {"x": 100, "y": 100}
  ]
}
```

Expected: Brown contour line around the canvas perimeter

### 2. lay_water

Input:
```json
{
  "points": [
    {"x": 200, "y": 50},
    {"x": 300, "y": 150},
    {"x": 400, "y": 250},
    {"x": 500, "y": 350}
  ]
}
```

Expected: Blue flowing water line from top-left to bottom-right

### 3. lay_planting

Input:
```json
{
  "x": 400,
  "y": 300,
  "kind": "tree"
}
```

Expected: Green circle with label "tree" at center

### 4. lay_path

Input:
```json
{
  "points": [
    {"x": 100, "y": 550},
    {"x": 300, "y": 550},
    {"x": 500, "y": 550},
    {"x": 700, "y": 550}
  ]
}
```

Expected: Gray horizontal path near bottom

### 5. clear_sheet

Input:
```json
{}
```

Expected: Canvas clears to blank cream background

### 6. export_sheet

Input:
```json
{}
```

Expected: PNG download triggers automatically

## Testing with ChatGPT

1. Open ChatGPT (Plus or Pro with browsing)
2. Say: "Open [deployed URL]"
3. Once loaded, say: "What tools do you have access to?"
4. ChatGPT should list the 6 WebMCP tools
5. Test commands:
   - "Lay a contour around the edges"
   - "Add a water feature flowing diagonally"
   - "Place three trees in a triangle formation"
   - "Draw a path connecting the bottom left to bottom right"
   - "Export the sheet"

## Expected Behaviors

- **Human drawing**: Click and drag creates black freehand lines
- **Agent drawing**: Tools add colored elements (brown=contour, blue=water, green=planting, gray=path)
- **Shared state**: Human and agent elements appear on the same canvas
- **Labels**: Agent elements show text labels
- **Export**: Both UI button and agent tool trigger PNG download

## Common Issues

### "WebMCP not available" in console

- Check Chrome version (need 149+)
- Verify flag is enabled at `chrome://flags/#enable-webmcp-testing`
- Ensure page is HTTPS (deployment) or localhost (dev)

### Tools not appearing in DevTools

- Refresh the page
- Check console for registration errors
- Verify you're in the Application → WebMCP panel, not Console

### ChatGPT says "I don't have access to tools"

- ChatGPT must open the page in its in-app browser, not just visit as text
- Say "Open [URL]" not "Go to [URL]"
- Ensure the URL is publicly accessible (not localhost)

## Verification Checklist

- [ ] Console shows "WebMCP tools registered successfully"
- [ ] Console shows 6 "Registered tool: [name]" messages
- [ ] DevTools → Application → WebMCP shows 6 tools
- [ ] Human drawing works (click and drag)
- [ ] Manual tool execution from DevTools works
- [ ] Export button downloads PNG
- [ ] ChatGPT can discover and call tools
- [ ] Human and agent contributions both visible on canvas

## Debug Mode

Add `?debug=1` to the URL to enable additional console logging (future enhancement).

## Performance Notes

- Canvas is 800x600px, runs at 60fps
- Tools execute synchronously (no network calls)
- State updates trigger React re-render
- Export uses Canvas.toBlob (fast, no server upload)

---

For deployment testing, see [DEPLOYMENT.md](./DEPLOYMENT.md)
