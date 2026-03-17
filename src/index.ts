import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { runMigrations } from './db';
import { startCron } from './cron';
import routes from './routes';

const app = new Hono();

app.use('*', cors());

// API routes take priority over static files
app.route('/api', routes);

// Serve frontend for all other paths
app.use('/*', serveStatic({ root: './public' }));

app.onError((err, c) => {
  console.error('[Unhandled]', err);
  return c.json({ error: 'Internal server error' }, 500);
});

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  await runMigrations();
  await startCron();

  serve({ fetch: app.fetch, port: PORT }, () => {
    console.log(`[App] Running challenge running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[Startup] Fatal error:', err);
  process.exit(1);
});
