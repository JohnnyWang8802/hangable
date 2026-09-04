# Deployment Guide for Hangable

This guide explains how to deploy Hangable to various platforms.

## Prerequisites

- A Git repository hosted on GitHub, GitLab, or Bitbucket
- The project must be pushed to the remote repository

## Option 1: Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub/GitLab/Bitbucket account
3. Click "New Project"
4. Import your Hangable repository
5. Vercel will automatically detect Next.js settings
6. Click "Deploy"
7. Wait for deployment to complete
8. Your app will be live at `https://your-project.vercel.app`

## Option 2: Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to "Pages"
3. Click "Create a project"
4. Connect your Git provider
5. Select your Hangable repository
6. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
7. Click "Save and Deploy"
8. Your app will be live at `https://your-project.pages.dev`

## Option 3: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign in and click "Add new site"
3. Choose "Import an existing project"
4. Connect your Git repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click "Deploy"
7. Your app will be live at `https://your-project.netlify.app`

## Environment Variables

Hangable doesn't require any environment variables or secrets. It's a fully client-side application.

## WebMCP Testing

After deployment:

1. **ChatGPT**: Open the deployed URL in ChatGPT's in-app browser
2. **Chrome**: Enable `chrome://flags/#enable-webmcp-testing` and visit your deployed URL

## Custom Domain (Optional)

All platforms above support custom domains:

- Vercel: Project Settings → Domains
- Cloudflare Pages: Project → Custom domains
- Netlify: Domain settings → Add custom domain

## Troubleshooting

### Build fails with type errors

Run `npm run build` locally to catch TypeScript errors before deploying.

### WebMCP tools not registering

Ensure:
- The site is served over HTTPS (all deployment platforms provide this automatically)
- You're using Chrome 149+ with the WebMCP flag enabled OR ChatGPT's in-app browser
- Check browser console for registration messages

### Canvas not displaying

Clear cache and hard reload (Ctrl+Shift+R / Cmd+Shift+R).

## Post-Deployment

1. Test the deployed URL in your browser
2. Verify WebMCP tools are registered (check console)
3. Update README.md with your actual deployed URL
4. Submit to Devpost with the live URL

---

**Quick Deploy Button (Vercel)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/hangable)

**Quick Deploy Button (Netlify)**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/hangable)
