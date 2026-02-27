"use client";

import { socket } from "@/lib/socket";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * A remote camera stream keyed by the sender's socket id.
 * We use socket id as a temporary peer identity for the current connection.
 */
type RemoteStream = {
  socketId: string;
  stream: MediaStream;
};

type UseRoomCameraProps = {
  roomId: string;
};

/**
 * STUN server is enough for basic NAT traversal in many cases.
 * (No TURN configured yet, so some restrictive networks may still fail.)
 */
const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/**
 * Intentionally low camera settings to keep bandwidth small:
 * - low resolution
 * - low frame rate
 * - no audio track
 */
const cameraConstraints: MediaStreamConstraints = {
  video: {
    width: { ideal: 320, max: 640 },
    height: { ideal: 240, max: 480 },
    frameRate: { ideal: 12, max: 15 },
  },
  audio: false,
};

/**
 * Manages room camera sharing + peer negotiation over socket signaling.
 *
 * Flow summary:
 * 1) User starts sharing -> we get local camera stream.
 * 2) We announce camera presence via socket (camera:join-room).
 * 3) We create RTCPeerConnection objects per remote socket.
 * 4) Offers/answers/ICE are exchanged through socket events.
 * 5) Incoming MediaStreams are stored in `remoteStreams` for rendering.
 */

export function useRoomCamera({ roomId }: UseRoomCameraProps) {
  // Whether current user actively shares their own camera.
  const [isSharing, setIsSharing] = useState(false);

  // Human-readable camera error shown in UI.
  const [error, setError] = useState<string | null>(null);

  // All currently connected remote streams to render in room UI.
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);

  // Keep local stream in ref so we avoid unnecessary rerenders on track updates.
  const localStreamRef = useRef<MediaStream | null>(null);

  // Map<socketId, RTCPeerConnection> so each peer has an isolated connection.
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  /**
   * Fully stops camera sharing and tears down all active peer connections.
   * Called on manual toggle OFF and component unmount cleanup.
   */
  const stopSharing = useCallback(() => {
    // Stop local hardware capture (camera LED should turn off).
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    // Close every peer connection and release RTC resources.
    peerConnectionsRef.current.forEach((connection) => connection.close());
    peerConnectionsRef.current.clear();

    // Clear remote UI state and sharing flag.
    setRemoteStreams([]);
    setIsSharing(false);

    // Notify room peers that this sharer is gone.
    if (roomId) {
      socket.emit("camera:leave-room", { roomId });
    }
  }, [roomId]);

  /**
   * Returns existing peer connection for target socket, or creates one.
   * Also wires ICE + track handlers and injects local media tracks.
   */

  const createPeerConnection = useCallback(
    (targetSocketId: string) => {
      const existing = peerConnectionsRef.current.get(targetSocketId);
      if (existing) {
        return existing;
      }

      const peer = new RTCPeerConnection(rtcConfig);

      // Whenever browser finds a network candidate, relay it to the target peer.
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc:ice-candidate", {
            roomId,
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // When remote media arrives, store/update it in room state.
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

      // Add our local video tracks so this connection can send them out.
      localStreamRef.current?.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current as MediaStream);
      });

      peerConnectionsRef.current.set(targetSocketId, peer);
      return peer;
    },
    [roomId],
  );

  /**
   * Active dialing step: create an SDP offer and signal it to a target peer.
   */
  const callPeer = useCallback(
    async (targetSocketId: string) => {
      const peer = createPeerConnection(targetSocketId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("webrtc:offer", {
        roomId,
        targetSocketId,
        offer,
      });
    },
    [createPeerConnection, roomId],
  );

  /**
   * Requests camera permission, starts local capture, and joins camera room mesh.
   */
  const startSharing = useCallback(async () => {
    if (!roomId || isSharing) return;

    try {
      setError(null);

      // Camera signaling relies on socket connection being live.
      if (!socket.connected) {
        socket.connect();
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(cameraConstraints);
      localStreamRef.current = stream;
      setIsSharing(true);

      // Ask server for current peers + announce ourselves to room participants.
      socket.emit("camera:join-room", { roomId });
    } catch (e) {
      console.error("Unable to start camera sharing", e);
      setError("Camera permission denied or unavailable.");
      stopSharing();
    }
  }, [isSharing, roomId, stopSharing]);

  useEffect(() => {
    /**
     * Existing peers currently sharing camera in room.
     * We initiate offers to each of them.
     */
    const handlePeerList = ({ peers }: { peers: string[] }) => {
      peers.forEach((peerId) => {
        void callPeer(peerId);
      });
    };

    /**
     * A new camera sharer joined.
     * Initiate one more offer toward that newly joined peer.
     */
    const handlePeerJoined = ({ socketId }: { socketId: string }) => {
      if (!socketId || socketId === socket.id) return;
      void callPeer(socketId);
    };

    /**
     * Remove peer resources + remote tile when a sharer leaves/disconnects.
     */
    const handlePeerLeft = ({ socketId }: { socketId: string }) => {
      const connection = peerConnectionsRef.current.get(socketId);
      if (connection) {
        connection.close();
        peerConnectionsRef.current.delete(socketId);
      }
      setRemoteStreams((prev) =>
        prev.filter((stream) => stream.socketId !== socketId),
      );
    };

    /**
     * Incoming offer -> set remote description -> create and send answer.
     */
    const handleOffer = async ({
      fromSocketId,
      offer,
    }: {
      fromSocketId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      // We only answer while user is actively sharing.
      if (!isSharing) return;

      const peer = createPeerConnection(fromSocketId);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("webrtc:answer", {
        roomId,
        targetSocketId: fromSocketId,
        answer,
      });
    };

    /**
     * Incoming answer for one of our offers.
     */
    const handleAnswer = async ({
      fromSocketId,
      answer,
    }: {
      fromSocketId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      const peer = peerConnectionsRef.current.get(fromSocketId);
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    };

    /**
     * Incoming ICE candidate discovered by remote peer.
     */
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

    // Register signaling listeners.
    socket.on("camera:peer-list", handlePeerList);
    socket.on("camera:peer-joined", handlePeerJoined);
    socket.on("camera:peer-left", handlePeerLeft);
    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIceCandidate);

    // Unregister listeners to prevent duplicate handlers after rerender/unmount.
    return () => {
      socket.off("camera:peer-list", handlePeerList);
      socket.off("camera:peer-joined", handlePeerJoined);
      socket.off("camera:peer-left", handlePeerLeft);
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIceCandidate);
    };
  }, [callPeer, createPeerConnection, isSharing, roomId]);

  // Safety net: if user navigates away, ensure camera + peers are torn down.
  useEffect(() => {
    return () => {
      stopSharing();
    };
  }, [stopSharing]);

  // Memoized API consumed by Room page.
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
}


//understand this file as much in detailes as you can 