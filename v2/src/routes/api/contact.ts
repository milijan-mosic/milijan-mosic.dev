import type { APIEvent } from "@solidjs/start/server";
import { Resend } from "resend";
import { contactSchema } from "~/lib/contact-schema";
import type { ContactResponse } from "~/lib/contact";

const RATE_LIMIT_WINDOW_MS = 60_000;
// Generous enough that someone correcting a typo is never blocked, tight
// enough that the endpoint is not worth scripting against.
const RATE_LIMIT_MAX_REQUESTS = 10;
const RECAPTCHA_MIN_SCORE = 0.5;
const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/**
 * Stands in for the httprate middleware the Go app used. One small container
 * serves this route, so process-local state is sufficient; it resets on deploy,
 * which is an acceptable trade for having no dependency to run.
 */
const requestLog = new Map<string, number[]>();

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(clientKey) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  recent.push(now);
  requestLog.set(clientKey, recent);

  // Opportunistic sweep so a long-running process cannot grow the map forever.
  if (requestLog.size > 1000) {
    for (const [key, timestamps] of requestLog) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        requestLog.delete(key);
      }
    }
  }

  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function clientIp(event: APIEvent): string {
  const forwarded = event.request.headers.get("x-forwarded-for");
  // Caddy appends the peer address; the first entry is the original client.
  const first = forwarded?.split(",")[0]?.trim();
  return first || event.clientAddress || "unknown";
}

function json(status: number, body: ContactResponse): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyRecaptcha(token: string, ip: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  // Unset only in local development, where verification is skipped.
  if (!secret) return true;

  if (!token) {
    console.warn(
      "reCAPTCHA rejected: empty token (was VITE_RECAPTCHA_SITE_KEY set at build time?)",
    );
    return false;
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });

    const result = (await response.json()) as {
      success?: boolean;
      score?: number;
      hostname?: string;
      "error-codes"?: string[];
    };

    // v3 always returns a score; absence means an unexpected payload shape.
    const passed =
      result.success === true &&
      typeof result.score === "number" &&
      result.score >= RECAPTCHA_MIN_SCORE;

    if (!passed) {
      console.warn("reCAPTCHA rejected:", {
        success: result.success,
        score: result.score,
        hostname: result.hostname,
        errors: result["error-codes"],
      });
    }
    return passed;
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return false;
  }
}

export async function POST(event: APIEvent): Promise<Response> {
  const ip = clientIp(event);

  if (isRateLimited(ip)) {
    return json(429, { status: "rate_limited", message: "Too many requests. Try again shortly." });
  }

  let body: unknown;
  try {
    body = await event.request.json();
  } catch {
    return json(400, { status: "invalid_json", message: "Could not parse request body" });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return json(400, {
      status: "invalid_request",
      message: issue?.message ?? "Invalid request",
    });
  }

  const { name, email, message, token, website } = parsed.data;

  // Honeypot hit: answer as though it succeeded so the bot learns nothing.
  if (website) {
    return json(200, { status: "success", message: "Message sent successfully" });
  }

  if (!(await verifyRecaptcha(token, ip))) {
    return json(400, { status: "invalid_captcha", message: "Could not verify the request" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured; dropping contact request.");
    return json(500, { status: "error", message: "Message could not be sent" });
  }

  const resend = new Resend(apiKey);
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  const to = process.env.CONTACT_TO_EMAIL;

  if (!to) {
    console.error("CONTACT_TO_EMAIL is not configured; dropping contact request.");
    return json(500, { status: "error", message: "Message could not be sent" });
  }

  const { data, error } = await resend.emails.send({
    from: `${sanitizeDisplayName(name)} <${from}>`,
    to: [to],
    replyTo: email,
    subject: "Request from the client",
    html: `<p>My email: ${escapeHtml(email)}</p> <p>${escapeHtml(message)}</p>`,
  });

  if (error) {
    console.error("Sending email failed:", error);
    return json(502, { status: "error", message: "Message could not be sent" });
  }

  console.log("Email sent successfully, ID:", data?.id);
  return json(200, { status: "success", message: "Message sent successfully" });
}

/**
 * The name lands in the From header, where angle brackets, quotes or a newline
 * would let a submitter inject extra headers or a second address. Keep only
 * characters a real name needs.
 */
function sanitizeDisplayName(value: string): string {
  const cleaned = value
    .replace(/[^\p{L}\p{N} .,'’-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 78) || "Website visitor";
}

/** The Go version interpolated user input straight into the HTML body. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
