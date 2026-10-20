# Admin tabs: one tab = one function

## Root cause
The earlier `admin-pages.js` moved the selected sections to `#admin-route-content` but left all never-selected sections elsewhere in the main document. The sidebar therefore appeared to scroll through multiple functions.

## Code repairs
- `public/admin-pages.js`: keeps each functional page as its original DOM component and mounts ONLY the selected page. All inactive page nodes are moved into a detached DocumentFragment; no CSS hiding and no duplicate component or Socket.IO connections.
- `public/admin.html`: routes device/history actions to the Shift History page; retains stable references to page elements while detached; updates worker cards and statistics without requiring their page to be visible. Removed legacy chat-scroll behavior.
- `public/team.js`: resolves separated task, earnings, and chat containers even while inactive, preserving their existing API handlers.
- `public/multi-monitor.js`: references its retained three-monitor root for per-worker video and status events while the Live Monitor tab is inactive.

## Routes
Overview; Devices & Workers; Live Monitor; Shift History; Tasks; Earnings & Payments; Team Chat.

## Preserved
Backend server, Task/Timer guard, Worker UI, broadcasting signaling and socket registrations, earnings endpoints, and chat endpoints remain unchanged.

## Validation and limitations
Node syntax checks passed for server.js, team.js, admin-pages.js, multi-monitor.js and inline Admin JavaScript. ZIP integrity verified. Browser navigation integration test was attempted but this environment blocked Chromium navigation; therefore end-to-end browsing and live-device workflows are NOT verified. Please test all seven tabs and Admin controls after staging deployment.
