import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { inArray, gt, gte, lt, and, max, sql } from 'drizzle-orm';
import { activities } from './schema';

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

export const db = drizzle(pool, { schema: { activities } });

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('[DB] Migrations applied');
}

export async function getSeenHashes(hashes: string[]): Promise<Set<string>> {
  if (hashes.length === 0) return new Set();
  const rows = await db
    .select({ hash: activities.hash })
    .from(activities)
    .where(inArray(activities.hash, hashes));
  return new Set(rows.map((r) => r.hash));
}

export async function recordActivitiesBatch(
  records: Array<{ hash: string; athleteName: string; km: number }>,
): Promise<void> {
  if (records.length === 0) return;
  await db
    .insert(activities)
    .values(records.map((r) => ({ hash: r.hash, athleteName: r.athleteName, km: String(r.km) })))
    .onConflictDoNothing();
}

import { CHALLENGE_START, CHALLENGE_END } from './constants';

export async function getStats() {
  const where = and(
    gte(activities.firstSeen, CHALLENGE_START),
    lt(activities.firstSeen, CHALLENGE_END),
    gt(activities.km, '0'),
  );

  const [statsRows, lastRows] = await Promise.all([
    db
      .select({
        athleteName: activities.athleteName,
        totalKm: sql<number>`SUM(${activities.km})::float`.as('total_km'),
        activityCount: sql<string>`COUNT(*)`.as('activity_count'),
      })
      .from(activities)
      .where(where)
      .groupBy(activities.athleteName)
      .orderBy(sql`total_km DESC`),
    db
      .select({ lastUpdated: max(activities.firstSeen) })
      .from(activities)
      .where(where),
  ]);

  const grandTotalKm = statsRows.reduce((sum, r) => sum + r.totalKm, 0);

  return {
    grandTotalKm: Math.round(grandTotalKm * 100) / 100,
    lastUpdated: lastRows[0]?.lastUpdated ?? null,
    athletes: statsRows.map((r) => ({
      name: r.athleteName,
      totalKm: Math.round(r.totalKm * 100) / 100,
      activities: Number(r.activityCount),
    })),
  };
}
