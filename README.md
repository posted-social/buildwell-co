# Buildwell & Co — one-page site (Concept A)

Static site. No build step, no JavaScript dependencies. Upload the whole folder to the web root.

```
/
├── index.html                 Page markup, meta tags, LocalBusiness JSON-LD
├── css/
│   ├── fonts.css              @font-face rules for the self-hosted fonts
│   └── styles.css             All page styles
├── fonts/                     DM Serif Display 400 + italic, Figtree 400/500/600/700 (woff2, latin, OFL)
├── images/
│   ├── brand/                 Horizontal logo, round badge, icon (PNG, transparent)
│   ├── projects/              Case-study photos, 1400–1600px wide, SEO-named
│   └── services/              Service card photos
├── favicon-32.png
├── apple-touch-icon.png
└── icon-512.png
```

## Before launch

- **Domain**: `https://www.buildwellandco.com/` is a placeholder in the canonical, Open Graph, and JSON-LD URLs. Replace once the domain is bought.
- **Form**: `#consult-form` posts JSON to `/api/contact`, a Cloudflare Pages Function in `functions/api/contact.js` that sends through Resend. Set three variables in the Pages project (Settings → Variables and Secrets, Production *and* Preview):
  - `RESEND_API_KEY` — your `re_…` key, stored as a **Secret**
  - `CONTACT_TO` — where leads go (comma-separate for more than one)
  - `CONTACT_FROM` — a sender on a domain verified in Resend, e.g. `Buildwell & Co <leads@buildwellandco.com>`. `onboarding@resend.dev` works for testing but only delivers to the Resend account owner's address.
  Redeploy after setting them. Submissions include a honeypot field (`company`) that drops bot posts silently.
- **Photo locations**: file names use `kirkwood-` and `st-louis-` prefixes for local SEO. Confirm with Bo where each project actually was and rename if needed (update the paths in `index.html` to match).
- **Logo quality**: the brand PNGs were cropped from a JPEG of the brand kit. Replace with the vector/PNG exports from the designer when available (same file names, no markup change).
- **Fonts**: served locally for performance. If you'd rather use Google Fonts, delete `fonts/` and `css/fonts.css` and add the Google `<link>` back in the `<head>`.

## Palette

Military green `#3C4331` · Sage `#92927A` · Charcoal `#272526` · Muted `#6B6A62` · Line `#ECEAE4` / `#D6D3CA`
