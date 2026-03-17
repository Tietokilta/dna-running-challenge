import axios from 'axios';
import crypto from 'crypto';
import { getAccessToken } from './auth';

const API_BASE = 'https://www.strava.com/api/v3';

export interface Activity {
  athlete?: { firstname?: string; lastname?: string };
  distance?: number;
  elapsed_time?: number;
  sport_type?: string;
  type?: string;
}

export function hashActivity(activity: Activity): string {
  const first = activity.athlete?.firstname ?? '';
  const last = activity.athlete?.lastname ?? '';
  const dist = String(Math.round(activity.distance ?? 0));
  const elapsed = String(activity.elapsed_time ?? 0);
  const sport = activity.sport_type ?? activity.type ?? 'unknown';
  const raw = [first, last, dist, elapsed, sport].join('\0');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function fetchClubActivities(clubId: string): Promise<Activity[]> {
  const token = await getAccessToken();
  const { data } = await axios.get<Activity[]>(
    `${API_BASE}/clubs/${clubId}/activities`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 200 },
    },
  );
  console.log(`[Club] Fetched ${data.length} activities`);
  return data;
}
