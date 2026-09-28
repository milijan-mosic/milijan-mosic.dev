import { createSignal } from "solid-js";
import { isServer } from "solid-js/web";

export type ConsentStatus = "granted" | "denied";

export interface ConsentRecord {
  status: ConsentStatus;
  /** Bump when the cookie policy changes so previous choices are re-prompted. */
  version: number;
  at: string;
}

export const CONSENT_STORAGE_KEY = "cookie-consent";
export const CONSENT_VERSION = 1;

const consentSignals = (status: ConsentStatus) =>
  `{ad_storage:'${status}',ad_user_data:'${status}',ad_personalization:'${status}',analytics_storage:'${status}',functionality_storage:'${status}',personalization_storage:'${status}'}`;

/**
 * Inlined verbatim into <head> ahead of gtag.js. Consent Mode requires the
 * defaults to be queued before the tag loads, otherwise the first hit escapes
 * before the user has chosen anything. A stored grant is replayed here too:
 * waiting for hydration would miss `wait_for_update` and send a returning
 * visitor's first page_view cookieless.
 */
export const CONSENT_DEFAULT_SNIPPET = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',Object.assign(${consentSignals("denied")},{security_storage:'granted',wait_for_update:500}));try{var c=JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}'));if(c&&c.version===${CONSENT_VERSION}&&c.status==='granted')gtag('consent','update',${consentSignals("granted")});}catch(e){}`;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(..._args: unknown[]): void {
  if (isServer) return;
  // gtag.js may not have loaded yet (or may be blocked); dataLayer still queues.
  window.dataLayer = window.dataLayer ?? [];
  // Must be the Arguments object: gtag.js silently ignores a plain array.
  window.dataLayer.push(arguments);
}

function read(): ConsentRecord | null {
  if (isServer) return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const record = parsed as Partial<ConsentRecord>;
    if (record.status !== "granted" && record.status !== "denied") return null;
    if (record.version !== CONSENT_VERSION) return null;

    return { status: record.status, version: record.version, at: record.at ?? "" };
  } catch {
    // Private mode, disabled storage or corrupted JSON — treat as undecided.
    return null;
  }
}

function write(status: ConsentStatus): void {
  if (isServer) return;

  const record: ConsentRecord = {
    status,
    version: CONSENT_VERSION,
    at: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // A failed write only means the choice won't persist; honour it this session.
  }
}

function pushUpdate(status: ConsentStatus): void {
  gtag("consent", "update", {
    ad_storage: status,
    ad_user_data: status,
    ad_personalization: status,
    analytics_storage: status,
    functionality_storage: status,
    personalization_storage: status,
  });
}

/**
 * Revoking consent doesn't delete what GA already set. GA writes to the
 * registrable domain (`.milijan-mosic.dev`), so expire it there and on the host.
 */
function clearAnalyticsCookies(): void {
  if (isServer) return;

  const host = window.location.hostname;
  const domains = ["", host, `.${host.split(".").slice(-2).join(".")}`];

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim() ?? "";
    if (name !== "_ga" && !name.startsWith("_ga_")) continue;

    for (const domain of domains) {
      const domainAttr = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${domainAttr}`;
    }
  }
}

const [decision, setDecision] = createSignal<ConsentStatus | null>(null);
const [isOpen, setIsOpen] = createSignal(false);

export const consentDecision = decision;
export const isBannerOpen = isOpen;

/**
 * Decides whether the banner is needed. A stored grant was already replayed
 * into gtag by CONSENT_DEFAULT_SNIPPET, before the tag loaded.
 */
export function initConsent(): void {
  const stored = read();

  if (!stored) {
    setIsOpen(true);
    return;
  }

  setDecision(stored.status);
}

export function accept(): void {
  write("granted");
  setDecision("granted");
  setIsOpen(false);
  pushUpdate("granted");
}

export function reject(): void {
  write("denied");
  setDecision("denied");
  setIsOpen(false);
  pushUpdate("denied");
  clearAnalyticsCookies();
}

export function reopen(): void {
  setIsOpen(true);
}
