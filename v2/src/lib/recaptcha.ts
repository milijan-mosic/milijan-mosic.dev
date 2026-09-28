const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const SCRIPT_ID = "recaptcha-v3";

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let loader: Promise<Grecaptcha | null> | null = null;

/**
 * api.js is ~150 KB and would dominate TBT if it loaded with the page, so it is
 * fetched on first interaction with the form instead. By the time anyone has
 * typed a name and a message the token is ready; an auditing bot never triggers it.
 */
export function loadRecaptcha(): Promise<Grecaptcha | null> {
  if (loader) return loader;

  if (!SITE_KEY) {
    loader = Promise.resolve(null);
    return loader;
  }

  loader = new Promise<Grecaptcha | null>((resolve) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      resolve(window.grecaptcha ?? null);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.grecaptcha ?? null);
    // A blocked or failed load must not prevent submitting the form.
    script.onerror = () => {
      console.warn("reCAPTCHA api.js failed to load (blocked by CSP or an extension?)");
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return loader;
}

export async function getRecaptchaToken(action: string): Promise<string> {
  const grecaptcha = await loadRecaptcha();
  if (!SITE_KEY) {
    console.warn("reCAPTCHA: VITE_RECAPTCHA_SITE_KEY was not set when this bundle was built");
    return "";
  }
  if (!grecaptcha) return "";

  try {
    return await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(SITE_KEY, { action }).then(resolve, reject);
      });
    });
  } catch (error) {
    // Typically "Invalid site key or not loaded in api.js" — a v2 key used with
    // v3's render=, or this domain missing from the key's allowed domains.
    console.warn("reCAPTCHA execute failed:", error);
    return "";
  }
}
