import { Hono } from 'hono';
import { getStats } from './db';

const routes = new Hono();

routes.get('/stats', async (c) => {
  const stats = await getStats();
  return c.json({ since: '2026-04-01', ...stats });
});

export default routes;
