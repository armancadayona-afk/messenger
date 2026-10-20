# One-time authorization change

Base: WorkTimer-Remember-Camera-Approval-Fix.zip
Reference: iamtime-main (10).zip

Only public/worker.html was changed.

- The worker explicitly acknowledges remote monitoring on the existing Approve & Continue step.
- As in the reference, this decision is saved as `worktimer:remote-monitoring-opt-in:<worker id>` = `yes` before attempting capture.
- Subsequent page launches on the same origin/browser/account skip the approval step.
- Existing `worktimer-camera-approval:<worker id>` = `approved` consent is migrated to the new key.
- Failed camera capture no longer traps the worker outside the dashboard. Camera access remains subject to device permissions.
- No changes to server, team.js, admin, Socket.IO, or WebRTC implementation.
- Site-data clearing, different browsers/origins, or permission revocation may require setup again.
- No device-level or end-to-end test was performed.
