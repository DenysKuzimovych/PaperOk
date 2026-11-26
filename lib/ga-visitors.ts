import crypto from "crypto";

/**
 * Server-side GA4 Data API access via service account (no extra deps).
 *
 * Required env vars:
 * - GA_SERVICE_ACCOUNT_EMAIL  — e.g. paperok-dashboard@<project>.iam.gserviceaccount.com
 * - GA_SERVICE_ACCOUNT_KEY    — the private key (PEM). Newlines may be escaped as \n.
 * - GA_PROPERTY_ID            — numeric GA4 property id (e.g. 551470153)
 *
 * The service account email must be added as a Viewer to the GA4 property
 * (Admin → Property access management).
 */

export interface VisitorStats {
  visitors7: number;
  visitors30: number;
  sessions30: number;
}

function base64url(input: Buffer | string): string {
  return (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(
  email: string,
  privateKey: string,
): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claims}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = base64url(signer.sign(privateKey));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token || null;
}

/**
 * Fetch visitor stats from GA4. Returns null when not configured or on any
 * error — the dashboard should degrade gracefully.
 */
export async function getVisitorStats(): Promise<VisitorStats | null> {
  const email = process.env.GA_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GA_SERVICE_ACCOUNT_KEY;
  const propertyId = process.env.GA_PROPERTY_ID?.trim();
  if (!email || !rawKey || !propertyId) return null;

  try {
    const privateKey = rawKey.replace(/\\n/g, "\n");
    const token = await getAccessToken(email, privateKey);
    if (!token) return null;

    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today", name: "d7" },
            { startDate: "30daysAgo", endDate: "today", name: "d30" },
          ],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as {
      rows?: {
        dimensionValues?: { value?: string }[];
        metricValues?: { value?: string }[];
      }[];
    };

    let visitors7 = 0;
    let visitors30 = 0;
    let sessions30 = 0;
    for (const row of data.rows || []) {
      const range = row.dimensionValues?.[0]?.value;
      const users = Number(row.metricValues?.[0]?.value || 0);
      const sessions = Number(row.metricValues?.[1]?.value || 0);
      if (range === "d7") {
        visitors7 = users;
      } else if (range === "d30") {
        visitors30 = users;
        sessions30 = sessions;
      }
    }
    return { visitors7, visitors30, sessions30 };
  } catch {
    return null;
  }
}
