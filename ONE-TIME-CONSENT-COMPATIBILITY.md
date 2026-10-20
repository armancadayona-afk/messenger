# One-time approval compatibility fix

Only `public/worker.html` was modified from the uploaded `WorkTimer-One-Time-Approval-Reference-Flow.zip`.

- Preserve the first-setup Approve & Continue acknowledgment.
- Restore consent from either the authenticated account ID or the worker-state ID (used by earlier builds).
- Migrate the legacy `worktimer-camera-approval:<id>` = `approved` decision if it was previously saved.
- Do not automatically authorize new workers, and do not treat Android camera permission as monitoring consent.
- Keep camera initialization failure separate from access to the dashboard.
- Server, WebRTC, chat, task, timer, and Admin files are unmodified.

Validation: JavaScript syntax and consent-state tests passed. No Android device or live broadcasting test performed.
