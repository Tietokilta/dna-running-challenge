import { Hono } from 'hono';
import { getStats } from './db';
import { CHALLENGE_START, CHALLENGE_END } from './constants';
import { lastFetchAttempt } from './cron';

const routes = new Hono();

routes.get('/stats', async (c) => {
  const stats = await getStats();
  return c.json({
    since: CHALLENGE_START.toISOString(),
    until: CHALLENGE_END.toISOString(),
    lastFetchAttempt: lastFetchAttempt?.toISOString() ?? null,
    ...stats,
  });
});

export default routes;
