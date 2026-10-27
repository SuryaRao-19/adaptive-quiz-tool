# Quality Baseline & Initial Verification (Phase 0)

## Baseline Test & Build Status
- **Client Build (`npm run build`):** Exit Code 0.
  - Bundled files:
    - `dist/index.html` (1.37 kB)
    - `dist/assets/index-C9oRUJBK.css` (85.81 kB)
    - `dist/assets/vendor-icons-CeOOUek2.js` (34.38 kB)
    - `dist/assets/vendor-motion-DrJPct-2.js` (143.26 kB)
    - `dist/assets/vendor-react-Dsx7L9l4.js` (164.21 kB)
    - `dist/assets/vendor-charts-aoZSGMP8.js` (385.00 kB)
    - `dist/assets/index-Duuw8y-M.js` (403.90 kB)
- **Server Health Check:** Server boots on Port 5000 with Helmet and CORS headers.
- **Node Environment:** v24.14.0 LTS.

## Known Architectural Gaps (Addressed in Phases 1-15)
- [ ] No KaTeX math typesetting (equations displayed as raw text).
- [ ] Adaptive engine lacks Bayesian Knowledge Tracing (BKT) and Spaced Repetition (Leitner).
- [ ] Server does not reject in-memory DB in production mode (`NODE_ENV === 'production'`).
- [ ] Client passes `recentHistory` as query param rather than server querying authoritative historical attempts.
- [ ] Client body controls `isTestMode` for Socratic chat lock rather than server-side state enforcement.
- [ ] No Service Worker / IndexedDB offline sync architecture.
- [ ] No automated test suite configured in `server/package.json`.
