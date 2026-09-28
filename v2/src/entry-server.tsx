// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { site } from "~/content";
import { CONSENT_DEFAULT_SNIPPET } from "~/lib/consent";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  description: site.description,
  email: `mailto:${site.email}`,
  url: site.canonical,
  image: `${site.canonical}/static/images/me.webp`,
  address: { "@type": "PostalAddress", addressCountry: "RS" },
  sameAs: site.social.filter((link) => link.href.startsWith("https://")).map((link) => link.href),
});

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang={site.locale}>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="author" content={site.author} />
          <meta name="description" content={site.description} />
          <title>{site.title}</title>
          <link rel="canonical" href={site.canonical} />

          <meta property="og:type" content="website" />
          <meta property="og:title" content={site.title} />
          <meta property="og:description" content={site.description} />
          <meta property="og:url" content={site.canonical} />
          <meta property="og:locale" content="en_US" />
          <meta property="og:site_name" content={site.name} />
          <meta property="og:image" content={`${site.canonical}/static/images/og.jpg`} />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={site.name} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={site.title} />
          <meta name="twitter:description" content={site.description} />
          <meta name="twitter:image" content={`${site.canonical}/static/images/og.jpg`} />
          <meta name="theme-color" content="#000000" />

          {/* No favicon.svg: the only one in the repo is the previous kilim
              logo, and an SVG cannot be generated from the raster wave master. */}
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />

          {/* The LCP element and the only font actually rendered on first paint. */}
          <link
            rel="preload"
            as="image"
            href="/static/images/me.webp"
            type="image/webp"
            fetchpriority="high"
          />
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            href="/static/fonts/faculty-glyphic-latin-400-normal.woff2"
            crossorigin="anonymous"
          />

          {/* Consent Mode v2 defaults MUST execute before gtag.js loads. */}
          <script innerHTML={CONSENT_DEFAULT_SNIPPET} />
          {GA_MEASUREMENT_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              />
              <script
                innerHTML={`gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}');`}
              />
            </>
          )}

          <script type="application/ld+json" innerHTML={personJsonLd} />

          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
