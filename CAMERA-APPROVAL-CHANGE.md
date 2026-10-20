# One-time Worker Camera Setup

Changed only `public/worker.html`. Successful camera/mic setup and acknowledgment is remembered per worker ID in localStorage on the same device. After approval, subsequent launches enter the Worker dashboard without repeating the approval screen. Existing permission restrictions remain; device/browser storage clearing requires setup again. No server, chat, timer, or WebRTC signaling code changed. Camera failure after prior authorization does not block dashboard access. This was syntax-checked but not tested on an Android device.
