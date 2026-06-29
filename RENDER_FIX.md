# Render Deploy

AllCoast is now a forecasting-only web app. Use a normal npm deploy on Render.

## Render settings

- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/status`

The included `render.yaml` already has these settings. If you created the Render service manually, the dashboard settings can override the file, so check the service settings too.

## Node version

This package pins the deployment runtime to Node 20 and npm 10:

- `package.json` engines: `node: 20.x`, `npm: 10.x`
- `.node-version`: `20.19.5`

After uploading this version, use **Manual Deploy -> Clear build cache & deploy**.

## If it still fails

Paste the newest Render error starting at the first red line after `npm install && npm run build`. That will show whether the issue is install, build, or startup.
