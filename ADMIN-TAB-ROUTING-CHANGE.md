# Admin true-page navigation update

Base: WorkTimer-Admin-True-Separate-Pages.zip

Changes (only Admin navigation/theme integration):
- `public/admin.html`: moved `#activity` out of `#monitor` so Shift History is not nested in Live Monitor; removed redundant sidebar click listener.
- `public/admin-pages.js`: replaced tab handling with a single-route content outlet and mutually exclusive real DOM mounting. Inactive page elements are detached in a document fragment, **not hidden with CSS**. Existing elements are reused, without duplicating WebRTC connections, task modules, or chat handlers.
- `public/hello-kitty-update.css`: minor route layout polish. Existing color palette preserved.

Navigation: Overview / Devices & Workers / Live Monitor / Shift History / Tasks / Earnings & Payments / Team Chat.

No changes to server.js, worker.html, multi-monitor.js, or team.js. No Task/Timer backend changes.

Verification: JavaScript syntax (`node --check`) and archive integrity. The attempt to test headless Chromium did not return a page, so functional browser and live-device verification remain required. Deploy as a staging copy before replacing production.
