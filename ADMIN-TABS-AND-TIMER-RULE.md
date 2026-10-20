# Admin tabs and task timer rule

Source: WorkTimer-Hello-Kitty-Three-Monitor-Expansion.zip

Changes:
- Admin sidebar has dedicated Overview, Devices & Workers, Live Monitor, Shift History, Tasks, Earnings & Payments, and Team Chat routes.
- Task, Earnings, and Chat cards are moved into separate page containers by the existing team renderer (not CSS hidden or duplicated).
- Event handlers query detached admin route containers, so rerenders and Socket.IO updates do not depend on the active page.
- The Worker Start Timer route (`POST /api/worker/start`) rejects a request unless that worker has an accepted task in `in_progress` status. The Worker also checks its current task before requesting a timer start.
- Existing camera signaling and login approval were not changed.

Testing: Node syntax checks of server, admin-pages, team.js, and extracted Worker inline JavaScript passed. This does not demonstrate live browser/device behavior; test all routes, task acceptance, timer start, camera feeds, and chat after deploying to a staging environment.

Important existing limitation: This version still uses the original shift Start/Stop implementation, rather than a persistent task-only Pause/Resume timer. The requested no-task start restriction is added, but a full timer redesign is not included.
