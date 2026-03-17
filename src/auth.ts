import axios from 'axios';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing API credentials in environment variables.');
  }

  const { data } = await axios.post<{ access_token: string; expires_at: number }>(
    'https://www.strava.com/oauth/token',
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    },
  );

  cachedToken = data.access_token;
  tokenExpiry = data.expires_at * 1000 - 60_000;

  console.log(`[Auth] Got new access token, expires at ${new Date(tokenExpiry).toISOString()}`);
  return cachedToken;
}
