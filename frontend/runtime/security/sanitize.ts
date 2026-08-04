import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

function getPurifier() {
  if (typeof window !== "undefined") {
    return createDOMPurify(window as unknown as Window & typeof globalThis);
  }
  const fakeWindow = new JSDOM("").window;
  return createDOMPurify(fakeWindow as unknown as Window & typeof globalThis);
}

const DOMPurify = getPurifier();

export interface SanitizeResult {
  cleaned: string;
  wasModified: boolean;
}

export function sanitizeGeneratedMarkup(rawHtml: string): SanitizeResult {
  const cleaned = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });

  return {
    cleaned,
    wasModified: cleaned !== rawHtml,
  };
}