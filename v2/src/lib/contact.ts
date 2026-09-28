/**
 * The zod-free half of the contact contract. ContactMe.tsx imports only from
 * here so the validation library stays out of the client bundle — importing
 * anything from `contact-schema.ts` would pull all of zod in with it.
 */

/** Kept as the literal the Go handler expected, so downstream tooling is unaffected. */
export const FROM_SITE = "Moss";

export interface ContactResponse {
  status: string;
  message: string;
}
