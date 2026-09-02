# Picfix Product & Architectural Decisions Required

**Document Owner:** Engineering & Product Leadership  
**Target Date:** Q3 / Q4 2026 Roadmap Alignment  
**Application:** Picfix Online Image Studio ([https://picfix.duckdns.org](https://picfix.duckdns.org))  

The frontend UI/UX and production-readiness pass is now complete. The following 10 strategic architectural and product decisions require formal sign-off from the product owner and stakeholders before backend feature rollout.

---

### Decision 1: Authentication & User Session Architecture
* **Context**: The frontend currently includes a polished interactive Auth Modal (Sign In / Sign Up / Google OAuth). The backend has a lightweight Express session structure but no user database.
* **Options**:
  1. **Supabase Auth / Firebase Auth**: Managed auth with social providers, row-level security, and zero auth infrastructure maintenance.
  2. **NextAuth.js (Auth.js) with PostgreSQL / Prisma**: Full self-hosted control within the Next.js runtime, storing sessions in PostgreSQL.
  3. **Custom JWT with Redis session revocation**: Extends the existing Express backend and Redis stack.
* **Recommendation**: **Supabase Auth** or **NextAuth with PostgreSQL**. It minimizes backend maintenance while providing instant Google OAuth, magic link, and passwordless authentication.
* **Status**: `PENDING DECISION`

---

### Decision 2: Monetization Model & Payment Processing Rail
* **Context**: We have designed the `/pricing` page with Free ($0), Pro ($9/mo), and Enterprise tiers.
* **Options**:
  1. **Stripe Billing / Stripe Checkout**: Industry standard for recurring SaaS subscriptions, customer portal, and invoice generation.
  2. **LemonSqueezy / Paddle**: Merchant of Record (MoR) that handles global tax calculation, VAT, and compliance automatically.
  3. **Usage-based credit packs**: Users purchase credits (e.g. 100 AI edits for $5) instead of or alongside recurring subscriptions.
* **Recommendation**: **LemonSqueezy** if operating as an international solo entity or early startup to avoid global sales tax compliance liabilities; **Stripe** if a registered US/EU company entity exists.
* **Status**: `PENDING DECISION`

---

### Decision 3: Image Storage & Edit History Retention
* **Context**: Currently, Picfix operates on strict ephemeral processing (images live in temporary RAM buffers or container `/tmp` and are purged after download).
* **Options**:
  1. **Zero Cloud Storage (Pure Ephemeral)**: Maximum user privacy, zero cloud storage costs, but users cannot access previous edits across devices.
  2. **Client-Side IndexedDB**: Edits are stored entirely inside the user's browser storage (up to ~50MB per device). Zero server cost, zero privacy liability.
  3. **Cloudflare R2 / AWS S3 with Lifecycle TTL (e.g., 24h retention)**: Authenticated users can access history for 24-72 hours before automatic deletion.
* **Recommendation**: Hybrid model: **IndexedDB for anonymous users** (client-side only), and **Cloudflare R2 with 24-hour signed TTL links for Pro accounts**.
* **Status**: `PENDING DECISION`

---

### Decision 4: AI Model Hosting & Inference Infrastructure
* **Context**: The `ai-enhance-image` tool is currently showing an `AiPending` notice while the backend BullMQ pipeline handles standard Sharp/libvips processing.
* **Options**:
  1. **Dedicated Self-Hosted GPU Server (RunPod / Vast.ai / AWS EC2 G4dn)**: Fixed cost ($150-$300/mo), low per-inference latency, requires model deployment maintenance (Triton / TorchServe / ONNX Runtime).
  2. **Serverless AI Inference API (Replicate / Fal.ai / Together AI)**: Pay-per-second inference (~$0.005 per upscale), zero GPU maintenance, automatic auto-scaling.
  3. **WebGPU Client-Side Inference (Transformers.js / ONNX Web)**: Runs directly on the user's phone or computer GPU via WebAssembly. Zero server cost, but slower on low-end mobile devices.
* **Recommendation**: Use **Fal.ai or Replicate** for initial Pro rollout to validate demand with zero fixed infrastructure overhead, transitioning to dedicated RunPod/Docker instances as volume exceeds 1,000 requests/day.
* **Status**: `PENDING DECISION`

---

### Decision 5: Free Tier Guardrails & Abuse Prevention
* **Context**: Current free limits are 15 MB per file upload with standard rate-limiting.
* **Options**:
  1. **IP-based sliding window**: 20 requests per minute per IP via Redis (already implemented in backend P0).
  2. **Fingerprint / Cloudflare Turnstile CAPTCHA**: Enforce invisible bot challenge on image upload to stop programmatic web scraping.
  3. **Daily Quota**: 50 edits per IP per day for standard tools; 3 AI edits per day.
* **Recommendation**: Keep standard editing unlimited with **Cloudflare Turnstile** invisible bot protection on upload, and cap AI requests to 3 free trials per day.
* **Status**: `PENDING DECISION`

---

### Decision 6: Mobile Experience Strategy (PWA vs Native Apps)
* **Context**: The web application is now 100% responsive down to 320px screens with touch-friendly 44px tap targets and mobile drawers.
* **Options**:
  1. **Progressive Web App (PWA)**: Add `manifest.json` and service worker so mobile users can "Add to Home Screen" with full offline capability and no app store 30% fees.
  2. **Capacitor / React Native Wrapper**: Wrap the Next.js app to publish onto Google Play Store and Apple App Store.
  3. **Native iOS / Android Swift/Kotlin Apps**: Dedicated native codebases.
* **Recommendation**: **Progressive Web App (PWA) First**. It requires minimal engineering, works immediately on iOS and Android, and eliminates app store review friction and commissions.
* **Status**: `PENDING DECISION`

---

### Decision 7: Internationalization (i18n) & Target Markets
* **Context**: Picfix tools include country-specific presets (e.g. Indian PAN Card photo, US Passport photo, Schengen Visa). Currently, all text is in English.
* **Options**:
  1. **English Only**: Simple, lowest maintenance overhead.
  2. **High-Impact Multilingual Expansion (Spanish, Hindi, French, Portuguese, German)**: Localized routes (e.g., `/es/compress-image`, `/hi/passport-size-photo`) driven by `next-intl`.
* **Recommendation**: Implement **`next-intl`** with Spanish and Hindi in Phase 2, as image resizing and government ID photo tools experience immense organic search volume in India and Latin America.
* **Status**: `PENDING DECISION`

---

### Decision 8: Batch Processing Architecture & Concurrency
* **Context**: Currently, each tool handles a single primary image. Photographers and e-commerce sellers frequently request batch compression and conversion (e.g. 50 photos at once).
* **Options**:
  1. **Client-Side Concurrency**: Browser processes files sequentially using `Promise.all` with a concurrency limit of 3, downloading individual files or building a client-side ZIP via JSZip.
  2. **Server-Side BullMQ Batch Jobs**: Backend zip bundle worker downloads, processes, and returns a single zip archive link.
* **Recommendation**: **Client-side batching via JSZip** for Free tier (saving backend RAM/disk), and **Server-side BullMQ zip worker** for Pro tier.
* **Status**: `PENDING DECISION`

---

### Decision 9: Third-Party Ecosystem Integrations
* **Context**: Users currently upload files from their local device filesystem.
* **Options**:
  1. **Cloud File Pickers**: Direct import from Google Drive, Dropbox, and OneDrive.
  2. **Shopify & E-Commerce Plugin**: Picfix app in Shopify App Store for automatic product photo optimization.
  3. **Browser Extension**: Right-click any image on the web to "Edit in Picfix".
* **Recommendation**: Prioritize **Google Drive & Dropbox import** first via their client-side JavaScript picker SDKs (zero server storage footprint).
* **Status**: `PENDING DECISION`

---

### Decision 10: Telemetry, Analytics & User Privacy
* **Context**: Modern image tools must balance user privacy compliance with product analytics.
* **Options**:
  1. **Plausible Analytics / Umami**: Lightweight, cookieless, GDPR-compliant privacy-first analytics.
  2. **PostHog**: Product analytics, feature flags, session recording, and conversion funnel tracking.
  3. **Google Analytics 4 (GA4)**: Traditional web analytics.
* **Recommendation**: **Plausible or Umami** for public web traffic, and **PostHog** (with image canvas element masking enabled) for product conversion funnels.
* **Status**: `PENDING DECISION`
