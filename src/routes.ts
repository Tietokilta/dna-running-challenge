import { Hono } from 'hono';
import { getStats } from './db';
import { runFetch } from './cron';

const routes = new Hono();

routes.get('/stats', async (c) => {
  const stats = await getStats();
  return c.json({ since: '2026-04-01', ...stats });
});

routes.post('/fetch', async (c) => {
  runFetch().catch(console.error);
  return c.json({ message: 'Fetch started.' });
});

export default routes;
