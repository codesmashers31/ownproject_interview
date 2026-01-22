import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Camera, CameraOff, Mic, MicOff,
} from 'lucide-react';
import { toast } from "sonner";
import { useWebRTC } from '../meeting/hooks/useWebRTC';
import { useSignaling } from '../meeting/hooks/useSignaling';
import { VideoTile } from './meeting/VideoTile';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function LiveMeeting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [status, setStatus] = useState("Connecting...");
  const [isBothReady, setIsBothReady] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const hasOfferedRef = useRef(false);

  const meetingId = searchParams.get('meetingId') || '';
  
  // Securely get role from state (fallback to null implies unauthorized entry or refresh)
  // Securely get role from state (fallback to null implies unauthorized entry or refresh)
  const stateRole = (location.state as { role?: 'expert' | 'candidate' })?.role;
  const role = stateRole || 'candidate'; // Default to satisfy TS, but we redirect if stateRole is missing
  const userId = user?.id || '';

  useEffect(() => {
    // If we lost state (e.g. refresh), we might want to redirect or handle it.
    // tailored to USER request: "hide and secure".
    if (!stateRole || !userId) {
       // Optional: Could fetch role from backend using meetingId if we wanted to support refresh.
       // For now, redirect to safety.
       toast.error("Invalid session state. Please join from the dashboard.");
       navigate(user?.userType === 'expert' ? '/dashboard/sessions' : '/my-sessions');
    }
  }, [stateRole, userId, navigate, user]);

  // Ref to break circular dependency between hooks
  const sendIceCandidateRef = useRef<((candidate: RTCIceCandidateInit) => void) | null>(null);

  // Validate Auth
  useEffect(() => {
    if (!userId) {
      setAccessDenied(true);
      setStatus("Error: Missing User ID");
    }
  }, [userId]);

  // WebRTC Hook
  const {
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
  } = useWebRTC((candidate) => {
    // Navigate via Ref to avoid TDZ
    if (sendIceCandidateRef.current) {
      sendIceCandidateRef.current(candidate);
    }
  });

  // Signaling Hook
  const { sendOffer, sendAnswer, sendIceCandidate, endCall, socket } = useSignaling({
    meetingId,
    role,
    userId,
    onBothReady: () => {

      setIsBothReady(true);
      hasOfferedRef.current = false;
    },
    // Verify media is ready before processing offer
    onOffer: async ({ sdp, caller }) => {
      if (role === 'candidate') {


        // Wait for media if not ready? 
        // For now, just log warning if stream is missing
        if (!localStream) {
          console.warn("⚠️ Received offer but Local Stream is NULL! Video back to expert will fail.");
        }

        setStatus("Received Offer...");
        const answer = await handleReceivedOffer(sdp);
        if (answer) {
          sendAnswer(answer);
          setStatus("Connected");
        }
      }
    },
    onAnswer: async ({ sdp, caller }) => {
      if (role === 'expert') {

        await handleReceivedAnswer(sdp);
        setStatus("Connected");
      }
    },
    onIceCandidate: ({ candidate, caller }) => {
      handleReceivedIceCandidate(candidate);
    },
    onUserLeft: (userId) => {

      setStatus("Partner left. Waiting...");
      setIsBothReady(false);
      hasOfferedRef.current = false;
      resetPeerConnection();
    },
    onMeetingEnded: () => {
      toast.info("Meeting has been ended by the host.");
      cleanup();
      navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions');
      // navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions');
    },
    isMediaReady: !!localStream
  });

  // Sync Ref
  useEffect(() => {
    sendIceCandidateRef.current = sendIceCandidate;
  }, [sendIceCandidate]);

  // Listen for socket errors (Auth, etc)
  useEffect(() => {
    if (socket) {
      socket.on("error", (msg) => {
        console.error("Socket Error:", msg);
        if (msg === "Unauthorized" || msg === "Meeting has ended") {
          setAccessDenied(true);
          setStatus(`Error: ${msg}`);
          toast.error(msg);
          cleanup();
          navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions');
        }
      });
    }
  }, [socket, cleanup, navigate, role]);

  // Initialize Local Media on Mount
  useEffect(() => {
    initLocalMedia().catch(err => console.error("Media Error", err));
  }, [initLocalMedia]);

  // Handle Offer Creation - Strict "Expert Initiates" for stability, 
  // but if we wanted symmetric, we'd need collision handling (e.g. perfect negotiation pattern).
  // Given the race condition issues, keeping one designated offerer (Expert) is safer 
  // unless we implement the "glare" handling.
  // USER request: "disable it in future... implement expert meeting architecture for candidate".
  // This likely means the CONTROLS (End Meeting). I have enabled that.
  useEffect(() => {
    if (isBothReady && localStream && role === 'expert' && !hasOfferedRef.current) {

      setStatus("Initiating connection...");
      hasOfferedRef.current = true;

      createOffer().then(offer => {
        if (offer) {

          sendOffer(offer);
          setStatus("Offer sent...");
        } else {
          console.error("Failed to create offer - see useWebRTC logs");
          hasOfferedRef.current = false;
        }
      });
    }
  }, [isBothReady, localStream, role, createOffer, sendOffer]);

  const handleLeaveCall = () => {
    cleanup();
    navigate(role === 'expert' ? '/dashboard/sessions' : '/my-sessions');
  };

  const handleEndMeeting = () => {
    if (confirm("Are you sure you want to end the meeting for everyone?")) {
      endCall();
      cleanup();
      navigate('/dashboard/sessions');
    }
  };

  if (accessDenied) {
    return <div className="p-10 text-black text-center">Access Denied</div>;
  }

  return (
    <div className="relative w-full h-screen bg-[#121212] overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="h-16 px-6 flex items-center justify-between bg-[#1a1a1a] border-b border-gray-800 z-50">
        <div className="text-white font-medium">
          Meeting ID: <span className="text-gray-400 select-all">{meetingId}</span>
          <span className="ml-4 text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">{status}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
            {role === 'expert' ? 'E' : 'C'}
          </div>
        </div>
      </div>

      {/* Main Stage (Picture in Picture Layout) */}
      <div className="flex-1 p-4 flex items-center justify-center relative">

        {/* Remote Video (Main Stage) */}
        <VideoTile
          name={role === 'expert' ? "Candidate" : "Expert"}
          stream={remoteStream}
          muted={false}
          isMainTile={true}
          className="z-0"
        />

        {/* Local Video (Floating PIP - Bottom Right) */}
        <VideoTile
          name="You"
          stream={localStream}
          muted={true}
          cameraEnabled={isCameraOn}
          micEnabled={isMicOn}
          isMainTile={false}
          className="absolute bottom-6 right-6 z-20 shadow-2xl border border-white/10"
        />
      </div>

      {/* Controls */}
      <div className="h-20 bg-[#1a1a1a] border-t border-gray-800 flex items-center justify-center gap-4 z-50">
        <button onClick={toggleMic} className={`p-4 rounded-full ${isMicOn ? 'bg-[#2a2a2a] text-white' : 'bg-red-500 text-white'}`}>
          {isMicOn ? <Mic /> : <MicOff />}
        </button>
        <button onClick={toggleCamera} className={`p-4 rounded-full ${isCameraOn ? 'bg-[#2a2a2a] text-white' : 'bg-red-500 text-white'}`}>
          {isCameraOn ? <Camera /> : <CameraOff />}
        </button>

        <button onClick={handleLeaveCall} className="px-6 py-3 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 font-medium">
          Leave Call
        </button>

        {role === 'expert' && (
          <button onClick={handleEndMeeting} className="px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 font-medium">
            End Meeting
          </button>
        )}
      </div>
    </div>
  );
}