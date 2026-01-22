import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

import { SOCKET_URL } from '../../config';

const SIGNALING_SERVER_URL = SOCKET_URL;

interface UseSignalingProps {
    meetingId: string;
    role: 'expert' | 'candidate';
    userId: string; // New auth requirement
    onOffer: (data: { sdp: RTCSessionDescriptionInit; caller: string }) => void;
    onAnswer: (data: { sdp: RTCSessionDescriptionInit; caller: string }) => void;
    onIceCandidate: (data: { candidate: RTCIceCandidateInit; caller: string }) => void;
    onBothReady: () => void;
    onUserLeft: (userId: string) => void;
    onMeetingEnded: () => void;
    isMediaReady: boolean;
}

export function useSignaling({
    meetingId,
    role,
    userId,
    onOffer,
    onAnswer,
    onIceCandidate,
    onBothReady,
    onUserLeft,
    onMeetingEnded,
    isMediaReady
}: UseSignalingProps) {
    const socketRef = useRef<Socket | null>(null);

    // Keep callbacks fresh in refs to avoid stale closures in socket listeners
    const onOfferRef = useRef(onOffer);
    const onAnswerRef = useRef(onAnswer);
    const onIceCandidateRef = useRef(onIceCandidate);
    const onBothReadyRef = useRef(onBothReady);
    const onUserLeftRef = useRef(onUserLeft);
    const onMeetingEndedRef = useRef(onMeetingEnded);

    useEffect(() => {
        onOfferRef.current = onOffer;
        onAnswerRef.current = onAnswer;
        onIceCandidateRef.current = onIceCandidate;
        onBothReadyRef.current = onBothReady;
        onUserLeftRef.current = onUserLeft;
        onMeetingEndedRef.current = onMeetingEnded;
    }, [onOffer, onAnswer, onIceCandidate, onBothReady, onUserLeft, onMeetingEnded]);

    useEffect(() => {
        if (!meetingId || !userId) {
            console.warn('[useSignaling] Missing meetingId or userId - skipping connection', { meetingId, userId });
            return;
        }

        if (!isMediaReady) {
            // Wait for media before connecting to avoid race conditions (Receive One-Way Video issue)
            console.log('[useSignaling] Waiting for Media to be ready...');
            return;
        }

        console.log('[useSignaling] Media Ready! Connecting to socket...');

        // Initialize Socket
        socketRef.current = io(SIGNALING_SERVER_URL, {
            transports: ['websocket'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('[useSignaling] Connected to socket. Joining room...');
            socket.emit('join-room', { meetingId, role, userId });
        });

        // Use wrapper functions that call the current ref
        socket.on('offer', (data) => onOfferRef.current(data));
        socket.on('answer', (data) => onAnswerRef.current(data));
        socket.on('ice-candidate', (data) => onIceCandidateRef.current(data));
        socket.on('both-ready', () => onBothReadyRef.current());
        socket.on('user-left', (id) => onUserLeftRef.current(id));
        socket.on('meeting-ended', () => onMeetingEndedRef.current());

        return () => {
            socket.disconnect();
        };
    }, [meetingId, role, userId, isMediaReady]); // Stable dependencies

    const sendOffer = (sdp: RTCSessionDescriptionInit) => {
        socketRef.current?.emit('offer', { sdp, meetingId });
    };

    const sendAnswer = (sdp: RTCSessionDescriptionInit) => {
        socketRef.current?.emit('answer', { sdp, meetingId });
    };

    const sendIceCandidate = (candidate: RTCIceCandidateInit) => {
        if (candidate) {
            socketRef.current?.emit('ice-candidate', { candidate, meetingId });
        }
    };

    const endCall = () => {
        socketRef.current?.emit('end-call', { meetingId });
    };

    return {
        sendOffer,
        sendAnswer,
        sendIceCandidate,
        endCall,
        socket: socketRef.current
    };
}
