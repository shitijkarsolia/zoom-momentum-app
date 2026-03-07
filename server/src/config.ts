import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port: parseInt(optional('PORT', '3001'), 10),
  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),

  zoom: {
    clientId: required('ZOOM_CLIENT_ID'),
    clientSecret: required('ZOOM_CLIENT_SECRET'),
    redirectUrl: required('ZOOM_REDIRECT_URL'),
  },

  session: {
    secret: required('SESSION_SECRET'),
  },

  openai: {
    baseUrl: optional('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    apiKey: required('OPENAI_API_KEY'),
  },
} as const;
