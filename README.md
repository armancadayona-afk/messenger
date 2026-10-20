# PROJECT: IAMTIME — THREE ANDROID WORKER APPLICATIONS

## 1. MAIN OBJECTIVE

Convert the attached `iamtime-hello-kitty-admin-worker.zip` project into three fully functional, independent Android worker APKs.

This must be a complete Android Studio project written in Kotlin, compatible with Android 14 and Android 15, including the Honor X9b.

Do not simply wrap the website inside a WebView. Build a hybrid Android application combining the existing HTML/CSS dashboard with native Android background services, WebRTC, Camera2/CameraX, notifications, and floating window functionality.

Keep the existing server, worker identities, admin dashboard, task management, earnings system, chat, and Socket.IO communication.

**Produce a complete, buildable Android Studio project and three APKs.**

---

## 2. CREATE THREE SEPARATE APKs

Use Gradle product flavors:

| Flavor | Application ID | Display Name |
|---|---|---|
| worker1 | com.iamtime.worker1 | IAMTIME Worker 1 |
| worker2 | com.iamtime.worker2 | IAMTIME Worker 2 |
| worker3 | com.iamtime.worker3 | IAMTIME Worker 3 |

Each APK must have:

- Preconfigured worker identity.
- Password-only login screen.
- Independent encrypted authentication storage.
- Separate device registration.
- Unique application ID.
- Independent background services.
- Matching Hello Kitty pink interface.

Do not require workers to enter a username, email address, or worker ID.

The APK flavor determines the worker identity. The backend must authenticate the supplied password for that identity.

Never store worker passwords in plaintext or embed them inside APK files.

## 3. PASSWORD-ONLY LOGIN

Upon launching the application, display a pink Hello Kitty login screen containing:

**IAMTIME WORKER**

Welcome Back!

Password: [Enter Password]

[LOGIN]

Features:

1. Automatically identify the worker using the installed APK flavor.
2. Authenticate the password securely against the existing backend.
3. Never expose the password in server logs.
4. Provide an optional Remember This Device feature using encrypted Android storage.
5. After successful login, open the worker dashboard immediately.
6. When a valid session is already stored, skip login.
7. Display the password screen again after logout, authentication expiry, or revocation.
8. Do not display a separate first-time device-registration screen. Register the device automatically after authentication, with server-side approval when required.
9. Prevent the same installation from appearing as duplicate registered devices.

## 4. HELLO KITTY WORKER DASHBOARD

Use the attached Hello Kitty admin and worker project's existing theme.

Visual style:

- Pink primary background.
- White rounded cards.
- Soft pink navigation.
- Cute bow decorations.
- Pastel pink buttons.
- Large digital timer.
- Mobile responsive design.
- Smooth transitions.

Main navigation:

- My Shift
- My Tasks
- My Earnings
- Team Chat
- Settings
- Logout

Worker Dashboard:

**MY WORK TIMER**

00:00:00

[START SHIFT] [PAUSE / RESUME] [STOP SHIFT]

Show connection status, current assignment, shift history, and completed tasks.

Retain the existing task and earning functions and synchronize them with the original backend.

## 5. UPGRADE WEBRTC TO NATIVE ANDROID

Replace background-sensitive browser-only camera streaming with native Android WebRTC integration.

Use:

- Native WebRTC PeerConnection.
- Camera2 or CameraX capture integration.
- Native AudioRecord.
- Socket.IO signaling.
- Existing server ICE configuration.
- STUN and configurable TURN support.
- Automatic ICE restart.
- Network reconnection handling.
- Connection state monitoring.
- Adaptive video bitrate.

Required capabilities:

1. Live front-camera video streaming.
2. Optional rear-camera switching when supported.
3. Camera and microphone audio synchronization.
4. Reliable streaming during screen-off and app minimization where Android permits.
5. Automatic recovery after a temporary network interruption, provided the user-authorized capture session remains valid.
6. Admin start and stop requests for live viewing within an already authorized capture session.
7. Exactly one active capture pipeline per device.
8. No duplicated audio or camera sessions after reconnection.

Default video configuration:

- Resolution: 720p.
- Frame rate: 15–30 FPS, adaptively adjusted.
- Audio: Opus.
- Video codec: VP8 or H.264, according to hardware support.
- Secure transport: DTLS-SRTP.

The worker must explicitly authorize camera and microphone capture. Do not bypass Android's privacy permissions or indicators.

## 6. BACKGROUND CAMERA OPERATION

Implement a properly declared Android foreground service using the necessary camera and microphone service types.

Required behavior:

- The user starts and authorizes the capture session while the app is visible.
- After authorization, capture can continue when the worker minimizes the app, opens another application, or turns the display off, to the extent supported by the device and Android version.
- Display Android's required ongoing recording notification.
- Provide a Stop Recording control.
- Do not repeatedly request camera permission once it has been granted, unless Android revokes it.
- Stop capture immediately if permission is revoked or the user ends the session.
- Recover connection failures without silently creating a new unauthorized capture session.

Handle:

- Camera resource conflicts.
- Microphone availability.
- Battery restrictions.
- Service destruction.
- Activity recreation.
- Application process termination.
- Network disconnection.
- Camera disconnection.

**Do not claim that Android permits camera recording to start silently from a fully backgrounded or rebooted application. Implement the supported behavior and display an actionable notification when fresh user interaction is necessary.**

## 7. BACKGROUND RECORDING

Add native recording using MediaCodec and MediaMuxer or a suitable maintained Android media-recording library.

Features:

- Record camera video and microphone audio.
- Save in MP4 format.
- Use app-private storage.
- Support configurable maximum recording duration.
- Split recordings into manageable segments.
- Recover gracefully from low storage.
- Display recording status.
- Provide secure recording access to authorized users.
- Resume network uploading when connectivity returns.
- Delete temporary upload files only after successful transfer.
- Do not upload recordings to unrelated external services.

Recording must be enabled only during a user-authorized capture session.

Admin can request recording when the session is authorized, with the worker app maintaining the required recording indication.

## 8. DISPLAY OVER OTHER APPS

Implement Android's `SYSTEM_ALERT_WINDOW` floating overlay functionality.

When minimized, the worker application should display a floating pink timer widget.

Floating timer design:

00:24:16

Pink circular or pill-shaped widget, with a small decorative bow.

Features:

- Show current work duration.
- Drag to reposition.
- Tap to reopen worker dashboard.
- Display shift status.
- Minimize and restore.
- Provide access to Pause / Resume where appropriate.
- Never obscure Android privacy indicators or system permission prompts.

On first activation, guide the user to Android's Display Over Other Apps settings.

If overlay permission is denied, the main application must still work without crashing.

## 9. AUTOMATIC STARTUP AFTER REBOOT

Implement a `BOOT_COMPLETED` receiver.

After device restart:

1. Restore non-sensitive worker session state.
2. Restore the last authenticated worker identity.
3. Reconnect background messaging when Android permits.
4. Restore pending task notifications.
5. Restore timer synchronization using the server's authoritative timestamps.
6. Offer the user an action to reopen the dashboard and resume capture if required.

Do not start camera, microphone, or screen capture directly from `BOOT_COMPLETED` where Android prohibits it.

Do not bypass Android's restrictions through hidden activities, unauthorized overlays, or accessibility-service tricks.

If the worker was clocked in before reboot, the server should determine whether the shift remains active. The Android app must not fabricate elapsed time or automatically begin a new recording session.

## 10. BACKGROUND SERVICE ARCHITECTURE

Create these components:

**MainActivity.kt**

Hosts the worker dashboard and authentication flow.

**WorkerForegroundService.kt**

Manages an active authorized worker session and associated persistent notification.

**WebRTCManager.kt**

Handles peer connections, signaling, reconnection, camera and microphone tracks.

**CameraCaptureManager.kt**

Manages Camera2/CameraX capture and safe camera switching.

**RecordingManager.kt**

Controls native MP4 recording and storage.

**FloatingTimerService.kt**

Controls the draggable overlay window.

**BootReceiver.kt**

Restores allowed state after device reboot.

**SocketManager.kt**

Maintains Socket.IO communication with the existing server.

**SessionManager.kt**

Handles password authentication, encrypted tokens, worker identification, and session expiry.

**WorkerFlavorConfig.kt**

Supplies the correct worker identity for each APK.

Avoid unnecessary continuously running services. Use WorkManager for appropriate deferred operations and a properly authorized foreground service for live capture.

## 11. ADMIN AND WORKER SYNCHRONIZATION

Preserve communication with the original Node.js backend.

Required real-time synchronization:

- Worker online/offline status.
- Shift Start / Pause / Resume / Stop.
- Task assignments.
- Task acceptance and submission.
- Task approval and completion.
- Earnings and bonuses.
- Chat messages.
- WebRTC signaling.
- Camera/recording session status.
- Device registration.

Prevent duplicate device registrations and duplicate socket listeners.

Use a unique persistent device installation identifier and reconcile it on the backend.

Do not reset the timer when an activity is minimized, a WebSocket reconnects, or the dashboard refreshes.

The server must remain authoritative for worker identity, timer state, tasks, and earnings.

## 12. ANDROID PERMISSIONS

Configure the manifest with the necessary supported permissions, including:

- INTERNET
- ACCESS_NETWORK_STATE
- CAMERA
- RECORD_AUDIO
- POST_NOTIFICATIONS
- FOREGROUND_SERVICE
- FOREGROUND_SERVICE_CAMERA
- FOREGROUND_SERVICE_MICROPHONE
- SYSTEM_ALERT_WINDOW
- RECEIVE_BOOT_COMPLETED
- WAKE_LOCK, only when justified by active capture

Declare the appropriate foreground-service types.

Use `MediaProjection` and its respective foreground-service permission only if screen sharing is implemented.

All sensitive permissions must be requested through Android's official permission interface.

Do not suppress system security dialogs or privacy indicators.

## 13. PREVENT ANDROID 14/15 CRASHES

Specifically handle:

- `ForegroundServiceStartNotAllowedException`
- `SecurityException`
- `CameraAccessException`
- `IllegalStateException`
- WebRTC ICE failures
- Application lifecycle recreation
- Microphone resource conflicts
- Notification permission denial

Do not launch camera or microphone foreground services from `Application.onCreate()` or directly from the boot receiver.

Verify permissions and foreground state before starting the capture service.

Ensure each service uses the correct foreground-service type.

## 14. ANDROID BUILD CONFIGURATION

Use:

- Kotlin.
- Android Studio.
- Gradle Kotlin DSL.
- Modern AndroidX libraries.
- Compatible WebRTC native SDK.
- Minimum SDK: 26.
- Target SDK: Current supported Play-compliant target, without downgrading to bypass restrictions.
- Java 17.
- ARM64 support.
- Three build flavors.

Keep all dependencies version-compatible.

Do not include duplicate Kotlin standard libraries.

## 15. REQUIRED DELIVERABLES

Produce:

1. Complete Android Studio source project ZIP.
2. `IAMTIME-Worker1.apk`
3. `IAMTIME-Worker2.apk`
4. `IAMTIME-Worker3.apk`
5. Configurable backend URL.
6. Installation README.
7. Android permissions guide.
8. Background capture lifecycle documentation.
9. Build and testing instructions.

Run the Gradle build for all three product flavors. Verify every APK installs and launches.

Test on Android 14 and Android 15, including the Honor X9b if available.

Test password-only login, timer synchronization, task updates, chat, floating overlay, recording, permission denial, background operation, screen-off operation, network reconnect, logout, and restart behavior.

**FINAL REQUIREMENT**

Do not deliver only a sample interface, mockup, or incomplete project.

Provide actual source code, build configurations, manifests, services, backend integration, and APK outputs. Preserve the original Hello Kitty theme and existing worker functionality.

Never claim a feature works until it has been implemented and tested.