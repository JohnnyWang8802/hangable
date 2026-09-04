# Quick Start Guide

## For Users

### 1. Open Hangable

Visit the deployed URL or run locally:

```bash
npm install
npm run dev
```

Open http://localhost:43123

### 2. Draw Something

- Click and drag on the canvas to draw
- Your drawings appear as black lines on cream paper

### 3. Ask an AI Agent for Help

**Option A: ChatGPT**

1. Open ChatGPT (Plus or Pro subscription)
2. Say: "Open [deployed URL]"
3. Once loaded, try these prompts:
   - "Lay a contour around the edges"
   - "Add a water feature flowing from top-left to bottom-right"
   - "Place three trees in a triangle formation at coordinates (200,200), (400,200), and (300,350)"
   - "Draw a path from bottom-left to bottom-right"
   - "Export the sheet"

**Option B: Chrome DevTools (Manual Testing)**

1. Enable `chrome://flags/#enable-webmcp-testing` in Chrome 149+
2. Restart Chrome
3. Open Hangable
4. Open DevTools → Application → WebMCP
5. See 6 registered tools
6. Click any tool to execute it manually

### 4. Export Your Plan

- Click "Take the sheet (PNG)" button
- Or ask ChatGPT: "Export the sheet"
- PNG downloads automatically

## For Developers

### Local Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd hangable

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific instructions.

### Test WebMCP

See [TESTING.md](./TESTING.md) for detailed testing instructions.

## Example Session

**User**: *Draws a rough circle in the center*

**ChatGPT**: "I can help! Let me lay a proper contour for you."

*Agent calls `lay_contour` with a perfect circle*

**User**: "Great! Add a water feature on the left side"

**ChatGPT**: "Adding a water feature..."

*Agent calls `lay_water` with a flowing path*

**User**: "Now place some trees along the top"

**ChatGPT**: "Placing trees..."

*Agent calls `lay_planting` three times with different coordinates*

**User**: *Manually draws some grass texture*

**ChatGPT**: "Looks great! Would you like me to export it?"

**User**: "Yes please"

**ChatGPT**: *Calls `export_sheet`*

*PNG downloads to user's computer*

## What You Can Do

### Human (You)
- Freehand sketching
- Organic shapes and textures
- Creative expression
- Rough layouts

### Agent (AI)
- Precise placement
- Geometric shapes
- Structured elements
- Batch operations

### Together
- Complete landscape plans
- Balanced organic + structured design
- Iterative refinement
- Exportable artifacts

## Tips

1. **Start rough**: Draw the overall layout first
2. **Use agent for precision**: Ask for exact measurements
3. **Iterate**: Refine until you're happy
4. **Export often**: Save progress as you go
5. **Clear when needed**: Reset and start fresh anytime

## Common Commands

- "Lay a contour [description]"
- "Add water [location]"
- "Place [number] trees [location]"
- "Draw a path [description]"
- "Clear the sheet"
- "Export the sheet"

## Troubleshooting

### "WebMCP not available"
- Enable `chrome://flags/#enable-webmcp-testing`
- Restart browser
- Ensure Chrome 149+

### Tools not working in ChatGPT
- Use "Open [URL]" not "Go to [URL]"
- URL must be publicly accessible
- Try refreshing the page in ChatGPT

### Canvas not showing drawings
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Check console for errors
- Verify JavaScript is enabled

## Learn More

- [README.md](./README.md) - Full documentation
- [TESTING.md](./TESTING.md) - Testing guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [SUBMISSION.md](./SUBMISSION.md) - Project rationale

---

**Ready to create? Start drawing!**
