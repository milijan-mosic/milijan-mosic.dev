import { z } from "zod";
import { FROM_SITE } from "./contact";

/**
 * Server-only: importing this module pulls in zod, so never reference it from a
 * component. The client shares the contract via `./contact` instead.
 *
 * Reproduces the validation in the Go handler (controllers/contact.go:24-39).
 */
export const contactSchema = z.object({
  from_site: z.literal(FROM_SITE),
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(254),
  message: z.string().trim().min(5, "Message must be at least 5 characters long").max(5000),
  /**
   * Presence is enforced by the route rather than here: verification is only
   * required when a secret key is configured, so local dev works without one.
   */
  token: z.string().max(4096).default(""),
  /**
   * Honeypot: a real browser never fills a hidden field, bots fill everything.
   * Accepted by the schema on purpose — the route answers a filled one with a
   * fake success, so rejecting it here would tell a bot the field is a trap.
   */
  website: z.string().max(200).optional().default(""),
});

export type ContactPayload = z.infer<typeof contactSchema>;
