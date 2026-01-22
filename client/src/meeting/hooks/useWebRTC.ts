import { useState, useRef, useCallback, useEffect } from 'react';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
};

export function useWebRTC(onIceCandidateSend: (candidate: RTCIceCandidate) => void) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const candidateQueue = useRef<RTCIceCandidateInit[]>([]);

    // 1. Initialize Local Media
    const initLocalMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            setIsMicOn(true);
            setIsCameraOn(true);
            return stream;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            return null;
        }
    }, []);

    // 2. Initialize PeerConnection (Singleton)
    const getOrCreatePeerConnection = useCallback(() => {
        if (pcRef.current) return pcRef.current;


        const pc = new RTCPeerConnection(STUN_SERVERS);

        // ICE Candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {

                onIceCandidateSend(event.candidate);
            } else {

            }
        };

        // Remote Track Handling - Critical Fix
        pc.ontrack = (event) => {

            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        // Monitor Connection State
        pc.oniceconnectionstatechange = () => {

        };

        pc.onconnectionstatechange = () => {

        };

        pcRef.current = pc;
        return pc;
    }, [onIceCandidateSend]);

    // Helper: Add Tracks to PC
    const addLocalTracksToPC = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {

        stream.getTracks().forEach((track) => {
            // Check if track already exists to avoid duplication
            const senders = pc.getSenders();
            const exists = senders.some(s => s.track === track);
            if (!exists) {

                pc.addTrack(track, stream);
            } else {

            }
        });
    }, []);

    // 3. Expert: Create Offer
    const createOffer = useCallback(async () => {
        const pc = getOrCreatePeerConnection();

        // Reliability: Create Data Channel to ensure ICE gathering triggers even if no media
        const dc = pc.createDataChannel("chat");
        dc.onopen = () => { };

        if (localStream) {
            addLocalTracksToPC(pc, localStream);
        } else {
            console.warn("Creating offer with NO local stream (Receive Only)");
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });
        }

        try {
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await pc.setLocalDescription(offer);
            return offer;
        } catch (error) {
            console.error("Error creating offer:", error);
            return null;
        }
    }, [localStream, getOrCreatePeerConnection, addLocalTracksToPC]);

    // 4. Candidate: Handle Offer & Create Answer
    const handleReceivedOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
        const pc = getOrCreatePeerConnection();


        if (localStream) {
            addLocalTracksToPC(pc, localStream);
        } else {
            console.warn("Handling offer with NO local stream - adding recvonly transceivers");
            // Critical: Must add transceivers to tell WebRTC we want to receive
            // But if candidate HAS a stream (e.g. mic/cam), they MUST add it here for Expert to see them.
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });
        }

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Process Queued Candidates
            while (candidateQueue.current.length > 0) {
                const c = candidateQueue.current.shift();
                if (c) await pc.addIceCandidate(new RTCIceCandidate(c));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            return answer;
        } catch (error) {
            console.error("Error handling offer:", error);
            return null;
        }
    }, [localStream, getOrCreatePeerConnection, addLocalTracksToPC]);

    // 5. Expert: Handle Answer
    const handleReceivedAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        const pc = pcRef.current;
        if (!pc) return;

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));

            // Process Queued Candidates (Rare for answer side but good practice)
            while (candidateQueue.current.length > 0) {
                const c = candidateQueue.current.shift();
                if (c) await pc.addIceCandidate(new RTCIceCandidate(c));
            }
        } catch (error) {
            console.error("Error handling answer:", error);
        }
    }, []);

    // 6. Handle ICE Candidate
    const handleReceivedIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        const pc = pcRef.current;
        if (!pc) {
            // Queue if PC not created yet (rare)
            candidateQueue.current.push(candidate);
            return;
        }

        try {
            if (pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {

                candidateQueue.current.push(candidate);
            }
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    }, []);

    // 7. Toggle Logic (Enabled/Disabled)
    const toggleMic = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    }, [localStream]);

    const toggleCamera = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    }, [localStream]);

    // Track stream in ref for cleanup access
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    const cleanup = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        setRemoteStream(null);
        // Clear candidates
        candidateQueue.current = [];
    }, []);

    const resetPeerConnection = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        setRemoteStream(null);
        candidateQueue.current = [];
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        localStream,
        remoteStream,
        isMicOn,
        isCameraOn,
        initLocalMedia,
        createOffer,
        handleReceivedOffer,
        handleReceivedAnswer,
        handleReceivedIceCandidate,
        toggleMic,
        toggleCamera,
        cleanup,
        resetPeerConnection
    };
}
