# WebRTC Video Streaming in Room — Deep Dive Notes

> **Scope:** End-to-end flow of camera sharing between room members, covering every socket event, every WebRTC step, and every line of code that makes it work.

---

## Table of Contents

1. [Bird's-Eye Architecture](#1-birds-eye-architecture)
2. [Key Concepts Glossary](#2-key-concepts-glossary)
3. [File Map](#3-file-map)
4. [Phase 0 — Prerequisites & Configuration](#4-phase-0--prerequisites--configuration)
5. [Phase 1 — User Clicks "Turn Camera On"](#5-phase-1--user-clicks-turn-camera-on)
6. [Phase 2 — Joining the Camera Room (Socket)](#6-phase-2--joining-the-camera-room-socket)
7. [Phase 3 — Offer / Answer Negotiation (WebRTC)](#7-phase-3--offer--answer-negotiation-webrtc)
8. [Phase 4 — ICE Candidate Exchange](#8-phase-4--ice-candidate-exchange)
9. [Phase 5 — Remote Stream Arrives & Renders](#9-phase-5--remote-stream-arrives--renders)
10. [Phase 6 — A New Peer Joins Mid-Session](#10-phase-6--a-new-peer-joins-mid-session)
11. [Phase 7 — User Turns Camera Off / Disconnects](#11-phase-7--user-turns-camera-off--disconnects)
12. [Socket Events Reference Table](#12-socket-events-reference-table)
13. [RTCPeerConnection Lifecycle Diagram](#13-rtcpeerconnection-lifecycle-diagram)
14. [Why "New Joiner Initiates Offers" (Avoiding Offer Glare)](#14-why-new-joiner-initiates-offers-avoiding-offer-glare)
15. [VideoTile Component — How MediaStream Binds to `<video>`](#15-videotile-component--how-mediastream-binds-to-video)
16. [React State & Ref Strategy in `useRoomCamera`](#16-react-state--ref-strategy-in-useroomcamera)
17. [Known Limitations & Future Work](#17-known-limitations--future-work)

---

## 1. Bird's-Eye Architecture

```
Browser A (Alice)                   Node Server                   Browser B (Bob)
─────────────────                  ────────────                  ─────────────────
getUserMedia()  ─────────────────────────────────────────────────────────────────▶
                                                                  (not involved yet)

socket.emit("camera:join-room")  ─▶  io.on("camera:join-room")
                                     ├─ socket.join("camera:<roomId>")
                                     ├─ emit("camera:peer-list", { peers: [] })  ─▶  Alice
                                     └─ broadcast("camera:peer-joined")          (no one yet)

                 ─── Bob clicks "Turn Camera On" ───

socket.emit("camera:join-room")  ─▶  io.on("camera:join-room")
                                     ├─ socket.join("camera:<roomId>")
                                     ├─ emit("camera:peer-list", { peers: [AliceSocketId] })  ─▶  Bob
                                     └─ broadcast("camera:peer-joined", { socketId: BobId })  ─▶  Alice (ignored)

Bob calls Alice:
socket.emit("webrtc:offer")      ─▶  io.to(AliceSocketId).emit("webrtc:offer")  ─▶  Alice
Alice answers:
socket.emit("webrtc:answer")     ─▶  io.to(BobSocketId).emit("webrtc:answer")   ─▶  Bob

ICE trickling both directions:
socket.emit("webrtc:ice-candidate")  ◀──────────────────────────────────────────▶

(P2P connection established — media flows DIRECTLY between browsers, server not involved)
```

> **Critical insight:** Once ICE completes, the actual video data travels **peer-to-peer**, bypassing the server entirely. The server only handled the *signaling* (offer/answer/ICE relay).

---

## 2. Key Concepts Glossary

| Term | What it means here |
|---|---|
| **Socket.IO room** | A named channel on the server. Clients `join()` it and can broadcast to all members. Used for both regular room chat (`roomId`) and camera rooms (`camera:<roomId>`). |
| **WebRTC** | Browser API for real-time peer-to-peer audio/video. Requires a *signaling* mechanism to bootstrap; Socket.IO acts as that mechanism. |
| **RTCPeerConnection** | The core WebRTC object. One per remote peer. Manages codec negotiation, ICE, and media tracks. |
| **SDP (Session Description Protocol)** | A text blob describing codec capabilities, media directions, and network params. Exchanged as an "offer" from the caller and an "answer" from the callee. |
| **ICE (Interactive Connectivity Establishment)** | The process of finding a working network path between two peers by testing candidate addresses (host, server-reflexive, relay). |
| **STUN** | A server that tells your browser its public IP:port, used to generate ICE candidates. |
| **Offer glare** | A race condition where both peers simultaneously create offers, causing the exchange to fail. Avoided by design in this codebase. |
| **`localStream`** | `MediaStream` from `getUserMedia()` — your own camera. Stored in `localStreamRef`. |
| **`remoteStreams`** | Array of `{ socketId, stream }` — one entry per connected peer's video. Rendered as `<VideoTile>` components. |

---

## 3. File Map

```
server/src/
└── index.ts          ← All Socket.IO event handlers, including camera signaling relay

app/src/lib/hooks/sockets/
└── useRoomCamera.ts  ← React hook: camera state, WebRTC logic, socket listeners

app/src/app/room/[id]/
└── page.tsx          ← Room UI: calls useRoomCamera, renders VideoTile grid
```

---

## 4. Phase 0 — Prerequisites & Configuration

### 4a. Socket Instance (`lib/socket.ts`)
Not shown in your files, but it exports a singleton Socket.IO client:
```ts
import { io } from "socket.io-client";
export const socket = io(BACKEND_URL, { autoConnect: false });
```
The `autoConnect: false` means the socket won't connect until `.connect()` is explicitly called.

### 4b. RTC Configuration
```ts
// useRoomCamera.ts
const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
```
- Only a STUN server is configured.
- STUN tells a browser its public IP for ICE candidate generation.
- **No TURN server** = peers behind symmetric NAT may fail to connect. This is noted in the code comments as a known limitation.

### 4c. Camera Constraints
```ts
const cameraConstraints: MediaStreamConstraints = {
  video: {
    width: { ideal: 320, max: 640 },
    height: { ideal: 240, max: 480 },
    frameRate: { ideal: 12, max: 15 },
  },
  audio: false,   // ← Intentional: no audio to save bandwidth
};
```
Deliberately low-res / low-fps to keep bandwidth small for "focus camera" use case.

### 4d. Camera Room ID Namespacing (Server)
```ts
// index.ts
const getCameraRoomId = (roomId: string) => `camera:${roomId}`;
```
Camera peers live in a separate Socket.IO room (`camera:<roomId>`) from the general room (`<roomId>`). This prevents camera signals from being broadcast to people in the room who haven't turned on their camera.

---

## 5. Phase 1 — User Clicks "Turn Camera On"

### In `page.tsx`:
```tsx
<button
  onClick={() => (isSharing ? stopSharing() : startSharing())}
>
  {isSharing ? "Turn camera off" : "Turn camera on"}
</button>
```
This calls `startSharing()` from the `useRoomCamera` hook.

### `startSharing()` in `useRoomCamera.ts`:
```ts
const startSharing = useCallback(async () => {
  if (!roomId || isSharing) return;   // guard: already sharing or no room

  try {
    setError(null);

    // 1. Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // 2. Request camera permission from OS/browser
    const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints);

    // 3. Store stream in ref (not state — avoids re-render on every track event)
    localStreamRef.current = stream;

    // 4. Update UI state
    setIsSharing(true);

    // 5. Tell server we want to join the camera room for this roomId
    socket.emit("camera:join-room", { roomId });

  } catch (e) {
    console.error("Unable to start camera sharing", e);
    setError("Camera permission denied or unavailable.");
    stopSharing();  // clean up anything that was partially set up
  }
}, [isSharing, roomId, stopSharing]);
```

**What can go wrong here:**
- User denies camera permission → `getUserMedia` rejects → `catch` fires → `stopSharing()` runs → `error` state is set → UI shows error message.
- Socket disconnected → `socket.connect()` re-establishes before emitting.

---

## 6. Phase 2 — Joining the Camera Room (Socket)

### Client emits:
```ts
socket.emit("camera:join-room", { roomId });
```

### Server handles (`index.ts`):
```ts
socket.on("camera:join-room", ({ roomId }) => {
  const cameraRoomId = getCameraRoomId(roomId);  // → "camera:<roomId>"

  // Join the Socket.IO room so future broadcasts reach this socket
  socket.join(cameraRoomId);

  // Get all other sockets currently in this camera room
  const roomSockets = Array.from(
    io.sockets.adapter.rooms.get(cameraRoomId) ?? [],
  );
  const peers = roomSockets.filter((id) => id !== socket.id);  // exclude self

  // Tell the joining socket who's already here
  socket.emit("camera:peer-list", { peers });

  // Tell existing members a new peer arrived
  socket.to(cameraRoomId).emit("camera:peer-joined", { socketId: socket.id });
});
```

**Two responses from server:**

1. **`camera:peer-list`** → sent only to the *new joiner* with an array of existing socket IDs.
2. **`camera:peer-joined`** → broadcast to *everyone else* in the camera room.

### Client handles `camera:peer-list`:
```ts
const handlePeerList = ({ peers }: { peers: string[] }) => {
  peers.forEach((peerId) => {
    void callPeer(peerId);  // initiate offer to each existing peer
  });
};
```
If the room was empty, `peers` is `[]` — no offers are made. The user waits for others to join.

### Client handles `camera:peer-joined` (intentionally passive):
```ts
const handlePeerJoined = ({ socketId }: { socketId: string }) => {
  if (!socketId || socketId === socket.id) return;
  // Intentionally empty — new joiner initiates offer to us, not the other way
};
```
This is a deliberate design choice. See [Phase 10 - Why New Joiner Initiates](#14-why-new-joiner-initiates-offers-avoiding-offer-glare) for the reasoning.

---

## 7. Phase 3 — Offer / Answer Negotiation (WebRTC)

### Step 1: `callPeer()` — New joiner calls existing peers

```ts
const callPeer = useCallback(
  async (targetSocketId: string) => {
    // Get or create an RTCPeerConnection for this peer
    const peer = createPeerConnection(targetSocketId);

    // Create SDP offer (describes what codecs/tracks we support)
    const offer = await peer.createOffer();

    // Commit our local description
    await peer.setLocalDescription(offer);

    // Send offer through Socket.IO to the target peer
    socket.emit("webrtc:offer", {
      roomId,
      targetSocketId,
      offer,
    });
  },
  [createPeerConnection, roomId],
);
```

### Step 2: `createPeerConnection()` — The core WebRTC setup

```ts
const createPeerConnection = useCallback(
  (targetSocketId: string) => {
    // Return existing connection if already exists (idempotent)
    const existing = peerConnectionsRef.current.get(targetSocketId);
    if (existing) return existing;

    // Create new peer connection with STUN config
    const peer = new RTCPeerConnection(rtcConfig);

    // Handler 1: ICE candidates discovered locally → relay to peer via socket
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc:ice-candidate", {
          roomId,
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    // Handler 2: Remote track arrives → store stream for rendering
    peer.ontrack = (event) => {
      const incomingStream = event.streams[0];
      if (!incomingStream) return;

      setRemoteStreams((prev) => {
        // Replace any old stream from same socket
        const withoutOld = prev.filter((s) => s.socketId !== targetSocketId);
        return [...withoutOld, { socketId: targetSocketId, stream: incomingStream }];
      });
    };

    // Add our own local video tracks so they're sent to this peer
    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current as MediaStream);
    });

    // Store in map keyed by socket ID
    peerConnectionsRef.current.set(targetSocketId, peer);
    return peer;
  },
  [roomId],
);
```

**Key detail:** `peer.addTrack(track, stream)` is called immediately when the `RTCPeerConnection` is created. This loads our local camera tracks into the connection so they'll be included in the offer SDP and eventually streamed to the remote peer.

### Step 3: Server relays offer to target peer

```ts
// index.ts
socket.on(
  "webrtc:offer",
  ({ roomId, targetSocketId, offer }: SignalPayload) => {
    // Blindly forward to the target socket — server doesn't inspect SDP
    io.to(targetSocketId).emit("webrtc:offer", {
      roomId,
      fromSocketId: socket.id,  // so the receiver knows who to answer
      offer,
    });
  },
);
```

### Step 4: Target peer handles incoming offer

```ts
const handleOffer = async ({
  fromSocketId,
  offer,
}: {
  fromSocketId: string;
  offer: RTCSessionDescriptionInit;
}) => {
  // Only answer if we're actively sharing camera ourselves
  if (!isSharing) return;

  // Create (or get) peer connection for the caller
  const peer = createPeerConnection(fromSocketId);

  // Set the caller's SDP as our remote description
  await peer.setRemoteDescription(new RTCSessionDescription(offer));

  // Create our answer SDP
  const answer = await peer.createAnswer();

  // Commit our local description
  await peer.setLocalDescription(answer);

  // Send answer back through socket
  socket.emit("webrtc:answer", {
    roomId,
    targetSocketId: fromSocketId,
    answer,
  });
};
```

**Important guard:** `if (!isSharing) return;`
If a peer receives an offer but hasn't turned on their own camera, they won't answer. This prevents one-sided connections where video only flows one way.

### Step 5: Server relays answer

```ts
// index.ts
socket.on(
  "webrtc:answer",
  ({ roomId, targetSocketId, answer }: SignalPayload) => {
    io.to(targetSocketId).emit("webrtc:answer", {
      roomId,
      fromSocketId: socket.id,
      answer,
    });
  },
);
```

### Step 6: Original caller handles incoming answer

```ts
const handleAnswer = async ({
  fromSocketId,
  answer,
}: {
  fromSocketId: string;
  answer: RTCSessionDescriptionInit;
}) => {
  const peer = peerConnectionsRef.current.get(fromSocketId);
  if (!peer) return;

  // Complete the SDP handshake — remote description is now set
  await peer.setRemoteDescription(new RTCSessionDescription(answer));
};
```

After `setRemoteDescription(answer)`, both sides have agreed on codecs and media directions. The WebRTC connection is *negotiated* but not yet *connected* — ICE still needs to find a path.

---

## 8. Phase 4 — ICE Candidate Exchange

ICE runs in parallel with and after SDP negotiation. Both peers independently discover possible network addresses (candidates) and trickle them to each other.

### How candidates are generated:
When `setLocalDescription()` is called, the browser starts gathering ICE candidates automatically. Each one fires `peer.onicecandidate`.

### Sending a candidate (both peers do this):
```ts
// Inside createPeerConnection:
peer.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("webrtc:ice-candidate", {
      roomId,
      targetSocketId,       // who to send to
      candidate: event.candidate,  // RTCIceCandidate object
    });
  }
};
```
`event.candidate` can be `null` when gathering is complete — the `if (event.candidate)` guard skips that.

### Server relay:
```ts
// index.ts
socket.on(
  "webrtc:ice-candidate",
  ({ roomId, targetSocketId, candidate }: SignalPayload) => {
    io.to(targetSocketId).emit("webrtc:ice-candidate", {
      roomId,
      fromSocketId: socket.id,
      candidate,
    });
  },
);
```

### Receiving a candidate:
```ts
const handleIceCandidate = async ({
  fromSocketId,
  candidate,
}: {
  fromSocketId: string;
  candidate: RTCIceCandidateInit;
}) => {
  const peer = peerConnectionsRef.current.get(fromSocketId);
  if (!peer || !candidate) return;

  try {
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.error("Failed to add ICE candidate", e);
  }
};
```

The browser tests each received candidate against local candidates to find a working pair. Once a pair is confirmed, the `RTCPeerConnection` transitions to `connected` state and media starts flowing.

---

## 9. Phase 5 — Remote Stream Arrives & Renders

### `ontrack` fires on the `RTCPeerConnection`:
```ts
// Inside createPeerConnection:
peer.ontrack = (event) => {
  const incomingStream = event.streams[0];
  if (!incomingStream) return;

  setRemoteStreams((prev) => {
    const withoutOld = prev.filter((s) => s.socketId !== targetSocketId);
    return [
      ...withoutOld,
      { socketId: targetSocketId, stream: incomingStream },
    ];
  });
};
```

`event.streams[0]` is the `MediaStream` object containing the remote video track. It's stored in React state keyed by socket ID.

### `page.tsx` renders the streams:
```tsx
{(localStream || remoteStreams.length > 0) && (
  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {localStream && (
      <VideoTile stream={localStream} muted={true} label="You" />
    )}
    {remoteStreams.map((remote) => (
      <VideoTile
        key={remote.socketId}
        stream={remote.stream}
        label={`Peer ${remote.socketId.slice(0, 6)}`}
      />
    ))}
  </div>
)}
```
- `localStream` is `localStreamRef.current` — your own camera (muted to prevent echo).
- `remoteStreams` is React state — causes re-render when a new peer's video arrives.
- The grid is hidden entirely when no streams exist.

---

## 10. Phase 6 — A New Peer Joins Mid-Session

Scenario: Alice and Bob are already connected. Carol now clicks "Turn camera on."

1. **Carol's client:** `startSharing()` → `getUserMedia()` → `socket.emit("camera:join-room")`
2. **Server:** joins Carol to `camera:<roomId>`. Finds `[AliceSocketId, BobSocketId]` already in room.
   - Sends `camera:peer-list { peers: [AliceId, BobId] }` to Carol.
   - Broadcasts `camera:peer-joined { socketId: CarolId }` to Alice and Bob.
3. **Alice & Bob:** receive `camera:peer-joined` → `handlePeerJoined` → **does nothing** (intentional).
4. **Carol:** receives `camera:peer-list` → calls `callPeer(AliceId)` and `callPeer(BobId)`.
5. **For each:** Carol → offer → server relay → Alice/Bob → answer → server relay → Carol.
6. **ICE trickling** between Carol↔Alice and Carol↔Bob simultaneously.
7. **Result:** Carol sees Alice and Bob. Alice and Bob see Carol. (Total: 3 `RTCPeerConnection` objects — one per pair, across the mesh.)

---

## 11. Phase 7 — User Turns Camera Off / Disconnects

### Manual camera off — `stopSharing()`:
```ts
const stopSharing = useCallback(() => {
  // 1. Stop hardware tracks (camera LED turns off)
  localStreamRef.current?.getTracks().forEach((track) => track.stop());
  localStreamRef.current = null;

  // 2. Close all peer connections
  peerConnectionsRef.current.forEach((connection) => connection.close());
  peerConnectionsRef.current.clear();

  // 3. Clear UI state
  setRemoteStreams([]);
  setIsSharing(false);

  // 4. Notify server / room peers
  if (roomId) {
    socket.emit("camera:leave-room", { roomId });
  }
}, [roomId]);
```

### Server handles `camera:leave-room`:
```ts
socket.on("camera:leave-room", ({ roomId }) => {
  const cameraRoomId = getCameraRoomId(roomId);
  socket.leave(cameraRoomId);
  // Broadcast to remaining camera peers so they can clean up their connection
  socket.to(cameraRoomId).emit("camera:peer-left", { socketId: socket.id });
});
```

### Remaining peers handle `camera:peer-left`:
```ts
const handlePeerLeft = ({ socketId }: { socketId: string }) => {
  // Close and remove the peer connection
  const connection = peerConnectionsRef.current.get(socketId);
  if (connection) {
    connection.close();
    peerConnectionsRef.current.delete(socketId);
  }
  // Remove their video tile from UI
  setRemoteStreams((prev) =>
    prev.filter((stream) => stream.socketId !== socketId),
  );
};
```

### On abrupt browser disconnect (tab closed, network drop):

The `disconnecting` event fires on the server **before** the socket is actually removed from rooms, so `socket.rooms` still contains the camera room:

```ts
// index.ts
socket.on("disconnecting", () => {
  for (const joinedRoomId of socket.rooms) {
    if (joinedRoomId !== socket.id && joinedRoomId.startsWith("camera:")) {
      socket.to(joinedRoomId).emit("camera:peer-left", { socketId: socket.id });
    }
  }
});
```

This ensures peers receive `camera:peer-left` even when the client doesn't explicitly call `stopSharing()`.

### Component unmount cleanup:
```ts
// useRoomCamera.ts
useEffect(() => {
  return () => {
    stopSharing();  // cleanup on unmount (navigation away from room)
  };
}, [stopSharing]);
```

---

## 12. Socket Events Reference Table

| Event | Direction | Emitter | Receiver | Payload | Purpose |
|---|---|---|---|---|---|
| `camera:join-room` | Client → Server | New sharer | Server | `{ roomId }` | Join camera Socket.IO room |
| `camera:peer-list` | Server → Client | Server | New joiner only | `{ peers: string[] }` | Tell joiner who's already sharing |
| `camera:peer-joined` | Server → Clients | Server | Existing sharers | `{ socketId }` | Notify room a new sharer arrived |
| `camera:leave-room` | Client → Server | Leaving sharer | Server | `{ roomId }` | Leave camera room gracefully |
| `camera:peer-left` | Server → Clients | Server | Remaining sharers | `{ socketId }` | Clean up stale peer connection/tile |
| `webrtc:offer` | Client → Server → Client | Caller (new joiner) | Callee (existing peer) | `{ roomId, targetSocketId, offer }` | SDP offer relay |
| `webrtc:answer` | Client → Server → Client | Callee | Caller | `{ roomId, targetSocketId, answer }` | SDP answer relay |
| `webrtc:ice-candidate` | Client → Server → Client | Either peer | Other peer | `{ roomId, targetSocketId, candidate }` | ICE candidate relay |

---

## 13. RTCPeerConnection Lifecycle Diagram

```
New Joiner (Bob)                                Existing Peer (Alice)
────────────────                                ─────────────────────

createPeerConnection(AliceId)
  ├─ new RTCPeerConnection(rtcConfig)
  ├─ peer.onicecandidate = ...           
  ├─ peer.ontrack = ...                  
  └─ peer.addTrack(localTrack)           

peer.createOffer()
peer.setLocalDescription(offer)
  └─ ICE gathering starts...

socket.emit("webrtc:offer")  ──────────────────────────────────────▶
                                                createPeerConnection(BobId)
                                                  ├─ new RTCPeerConnection(rtcConfig)
                                                  ├─ peer.onicecandidate = ...
                                                  ├─ peer.ontrack = ...
                                                  └─ peer.addTrack(localTrack)

                                                peer.setRemoteDescription(offer)
                                                peer.createAnswer()
                                                peer.setLocalDescription(answer)
                                                  └─ ICE gathering starts...

                             ◀──────────────────────────────────────
                                                socket.emit("webrtc:answer")

peer.setRemoteDescription(answer)
  └─ SDP handshake COMPLETE

◀────── ICE candidates trickle in both directions simultaneously ──────▶

peer.addIceCandidate(...)                       peer.addIceCandidate(...)
  ...                                             ...

[ICE pair found — connection state → "connected"]

peer.ontrack fires ◀──────── P2P media stream ────────▶ peer.ontrack fires

setRemoteStreams([...])                         setRemoteStreams([...])
  └─ VideoTile renders Alice's video              └─ VideoTile renders Bob's video
```

---

## 14. Why "New Joiner Initiates Offers" (Avoiding Offer Glare)

**The problem:** If both Alice (existing) and Bob (new) simultaneously react to each other's presence and each calls `createOffer()` on the *same* `RTCPeerConnection`, both have set their local description before receiving the remote description. This is "offer glare" and typically results in a failed or black video connection.

**The solution used here:**
- `camera:peer-joined` → existing peers do **nothing** (handler is intentionally empty).
- `camera:peer-list` → new joiner **calls all existing peers**.

This means the new joiner always initiates. Since existing peers are already settled (waiting), there's no race.

**Trade-off:** If the new joiner crashes or goes offline immediately after joining but before completing offers, existing peers won't see them (and won't initiate). This is acceptable for a "focus camera" use case.

---

## 15. VideoTile Component — How MediaStream Binds to `<video>`

```tsx
const VideoTile = ({
  stream,
  label,
  muted = false,
}: {
  stream: MediaStream;
  label: string;
  muted?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Assign stream to the video element's source
    videoRef.current.srcObject = stream;

    // Browsers sometimes don't auto-play even with autoPlay attr; force it
    const tryPlay = async () => {
      try {
        await videoRef.current?.play();
      } catch {
        // DOMException: "play() interrupted by a new load request" — safe to ignore
        // Will resolve when user interacts with the page
      }
    };

    void tryPlay();
  }, [stream]);

  return (
    <div className="rounded-xl border ...">
      <video
        ref={videoRef}
        autoPlay
        playsInline    // ← Required on iOS to prevent fullscreen takeover
        muted={muted}  // ← true for local stream to prevent echo
        onLoadedMetadata={() => {
          void videoRef.current?.play().catch(() => undefined);
        }}
        className="w-full aspect-video object-cover"
      />
      <div className="px-3 py-2 text-xs text-white/80 bg-black/50">{label}</div>
    </div>
  );
};
```

**Why `srcObject` instead of `src`?**
`src` expects a URL string. `MediaStream` objects can't be serialized to URLs (well, you can use `URL.createObjectURL()` but that has memory leak risks and is deprecated for streams). `srcObject` directly accepts a `MediaStream`, `MediaSource`, or `Blob`.

**Why `playsInline`?**
On iOS Safari, `<video>` elements default to fullscreen playback. `playsInline` keeps them inline with the page layout.

**Why `muted` for local stream?**
If you output your own microphone to your own speakers, you get an audio feedback loop. `muted` prevents this. `audio: false` in `cameraConstraints` already removes audio tracks, but `muted` is a safety net.

---

## 16. React State & Ref Strategy in `useRoomCamera`

| Data | Storage | Why |
|---|---|---|
| `isSharing` | `useState` | Controls button label and conditional renders — needs to trigger re-render |
| `error` | `useState` | Shown in UI — needs to trigger re-render |
| `remoteStreams` | `useState` | Array of remote video sources — needs to trigger re-render of `VideoTile` grid |
| `localStreamRef` | `useRef` | Doesn't need to trigger re-render. Also needed synchronously inside callbacks (closures capture ref object, not `.current` value) |
| `peerConnectionsRef` | `useRef<Map>` | Same reason — `Map` mutations shouldn't cause re-renders; needed synchronously in event handlers |

**Why `useMemo` for the return value?**
```ts
return useMemo(
  () => ({
    isSharing,
    startSharing,
    stopSharing,
    localStream: localStreamRef.current,
    remoteStreams,
    error,
  }),
  [error, isSharing, remoteStreams, startSharing, stopSharing],
);
```
The hook returns an object. Without `useMemo`, a new object reference is created on every render, causing any consumer that destructures from this hook to see "changed" values even if nothing relevant changed. The `useMemo` ensures the object reference is stable unless one of its deps actually changes.

**Note:** `localStream: localStreamRef.current` is a snapshot. If the stream changes but no state update triggers a re-render, the consumer won't see the new stream. The current code handles this because `setIsSharing(true)` always accompanies stream assignment, triggering a re-render.

---

## 17. Known Limitations & Future Work

### No TURN server
```ts
// Current config:
const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
```
STUN only works when at least one peer has a public-facing port (e.g., not behind symmetric NAT). Corporate networks and some mobile carriers use symmetric NAT, making STUN-only connections fail. A TURN server (e.g., Twilio, Coturn) would relay media as a fallback.

### Mesh topology (N² connections)
For N peers, each needs N-1 peer connections. With 5 users, that's 10 connections and each browser sends its video stream 4 times. This doesn't scale well past ~5-6 users. A **Selective Forwarding Unit (SFU)** like mediasoup or LiveKit would solve this.

### Peer label is socket ID substring
```tsx
label={`Peer ${remote.socketId.slice(0, 6)}`}
```
Not user-friendly. Should map socket IDs to user names via the room member data.

### `handleOffer` guard uses `isSharing`
If the user clicks "Turn camera off" mid-negotiation, they won't answer incoming offers. Peers who offered them will have a dangling `RTCPeerConnection` that never connects. A more robust solution would send a rejection signal or time out gracefully.

### No renegotiation
If a user's camera stream changes (e.g., they switch cameras), the existing peer connections are not renegotiated. The user would need to turn off and on to re-establish with new tracks.

### `localStream` in `useMemo` return
`localStreamRef.current` is returned directly. The consumer `page.tsx` renders `<VideoTile stream={localStream} .../>`. If the stream reference is stable (same `MediaStream` object), this works fine. But if `getUserMedia` returns a new stream object on retry, the `VideoTile` won't update unless a re-render is triggered by state.

---

*These notes reflect the code as written. Refer to source files for authoritative implementation details.*