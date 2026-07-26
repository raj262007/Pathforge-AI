// Central place for the backend API base URL.
// Set NEXT_PUBLIC_API_URL in your .env.local (and in your hosting provider's
// environment variables for production) to point at the deployed backend.
// Falls back to localhost for local development only.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
