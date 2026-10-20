# Worker approval flow update

Base: uploaded WorkTimer-Original-Unchanged(1) (1).zip

Changed only public/worker.html.

- Worker login still redirects to worker.html.
- Before displaying the dashboard, worker.html now shows a camera/microphone setup page with Approve & Continue.
- The button calls the original ensureBaseCapture() API and proceeds only if the browser grants camera/microphone access.
- The timer's old Start -> Approve -> start state has been removed. Start Timer calls completeStart() immediately.
- Screen-sharing approval is presented separately when the Admin requests screen capture; it no longer hijacks the timer button.
- Server, login endpoint, chat, signaling, timer API and other files are unchanged.

Notes:
- The setup appears after each Worker page load/login. The user requested it immediately after login; there is no persistent new consent database in this change.
- This uploaded ORIGINAL project still has a Stop Timer function. That feature was intentionally not rewritten as part of this limited approval-control change.
- Existing server behavior still makes camera signaling dependent on running a shift; this was not altered to avoid introducing unrelated regressions.
- No live Android/WebRTC integration test was run.
