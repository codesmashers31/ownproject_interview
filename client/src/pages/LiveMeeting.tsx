import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Camera, CameraOff, Mic, MicOff, PhoneOff, Info, Clock, MessageSquare, X, Menu, Users
} from 'lucide-react';
import { toast } from "sonner";
import { useWebRTC } from '../meeting/hooks/useWebRTC';
import { useSignaling } from '../meeting/hooks/useSignaling';
import { VideoTile } from './meeting/VideoTile';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';

// --- Active Meeting Component (WebRTC Logic) ---
const ActiveMeeting = ({ meetingId, role, userId, onLeave, sessionData }: any) => {
  const [status, setStatus] = useState("Connecting...");
  const [isBothReady, setIsBothReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [showSidebar, setShowSidebar] = useState(false); // Mobile toggle
  const hasOfferedRef = useRef(false);

  // Ref to break circular dependency
  const sendIceCandidateRef = useRef<((candidate: RTCIceCandidateInit) => void) | null>(null);

  const {
    localStream, remoteStream, isMicOn, isCameraOn, initLocalMedia,
    createOffer, handleReceivedOffer, handleReceivedAnswer, handleReceivedIceCandidate,
    toggleMic, toggleCamera, cleanup, resetPeerConnection, connectionState
  } = useWebRTC((candidate) => {
    if (sendIceCandidateRef.current) sendIceCandidateRef.current(candidate);
  });

  const { sendOffer, sendAnswer, sendIceCandidate, endCall, socket } = useSignaling({
    meetingId,
    role,
    userId,
    onBothReady: () => {
      setIsBothReady(true);
      hasOfferedRef.current = false;
      console.log("[Signaling] Both users ready, initializing connection sequence...");
      setStatus("Connected (Initializing Media...)");
    },
    onOffer: async ({ sdp }) => {
      if (role === 'candidate') {
        setStatus("Negotiating...");
        const answer = await handleReceivedOffer(sdp);
        if (answer) sendAnswer(answer);
      }
    },
    onAnswer: async ({ sdp }) => {
      if (role === 'expert') await handleReceivedAnswer(sdp);
    },
    onIceCandidate: ({ candidate }) => handleReceivedIceCandidate(candidate),
    onUserLeft: () => {
      setStatus("Partner left. Waiting...");
      setIsBothReady(false);
      resetPeerConnection();
    },
    onMeetingEnded: () => {
      toast.info("Meeting has been ended by the host.");
      cleanup();
      onLeave();
    },
    isMediaReady: !!localStream
  });

  useEffect(() => { sendIceCandidateRef.current = sendIceCandidate; }, [sendIceCandidate]);

  useEffect(() => {
    if (socket) {
      socket.on("error", (msg: string) => {
        console.error("Socket Error:", msg);
        toast.error(msg);
        if (msg === "Unauthorized" || msg === "Meeting has ended") {
          cleanup();
          onLeave();
        }
      });
    }
  }, [socket, cleanup, onLeave]);

  useEffect(() => {
    initLocalMedia().catch(err => console.error("Media Error", err));
    return () => cleanup();
  }, []);

  useEffect(() => {
    // Sync WebRTC state to UI status if connected/failed
    if (connectionState === 'connected' || connectionState === 'completed') {
      setStatus("Live Call");
    } else if (connectionState === 'failed' || connectionState === 'disconnected') {
      setStatus("Connection Failed/Lost");
    } else if (connectionState === 'checking') {
      setStatus("Establishing P2P Path...");
    }
  }, [connectionState]);

  useEffect(() => {
    if (isBothReady && localStream && role === 'expert' && !hasOfferedRef.current) {
      console.log("[ActiveMeeting] Expert triggering offer creation...");
      hasOfferedRef.current = true;
      setStatus("Initiating Peer Connection...");
      createOffer().then(offer => {
        if (offer) {
          console.log("[ActiveMeeting] Offer created and sent");
          sendOffer(offer);
        } else {
          console.error("[ActiveMeeting] Failed to create offer");
          hasOfferedRef.current = false;
        }
      });
    }
  }, [isBothReady, localStream, role, createOffer, sendOffer]);

  const handleEndMeeting = () => {
    if (confirm("End meeting for everyone?")) {
      endCall();
      cleanup();
      onLeave();
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden relative">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Bar */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${status === "Connected" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-amber-500 animate-pulse"}`} />
            <div>
              <h1 className="text-gray-200 font-semibold text-sm sm:text-base leading-tight truncate max-w-[150px] sm:max-w-md">
                {sessionData?.topics?.[0] || 'Live Session'}
              </h1>
              <p className="text-[10px] text-gray-500 hidden sm:block">{status}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
              <Clock size={14} className="text-gray-400" />
              <span className="text-xs text-gray-300 font-medium">{sessionData?.duration || 30}m</span>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 transition-colors"
            >
              {showSidebar ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Video Stage */}
        <div className="flex-1 relative bg-black flex items-center justify-center p-0 sm:p-4 overflow-hidden">

          {/* Remote Video (Main) */}
          <div className="relative w-full h-full max-w-[1600px] mx-auto sm:rounded-2xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-white/10 group">
            <VideoTile
              name={role === 'expert' ? sessionData?.candidateDetails?.name : sessionData?.expertDetails?.name}
              stream={remoteStream}
              muted={false}
              isMainTile={true}
              className="w-full h-full object-cover"
            />
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Users size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-medium">Waiting for participant...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Pip */}
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-32 sm:w-64 aspect-video shadow-2xl rounded-xl overflow-hidden border-2 border-gray-800/80 hover:border-blue-500/50 transition-all z-30 group bg-gray-900">
            <VideoTile
              name="You"
              stream={localStream}
              muted={true}
              cameraEnabled={isCameraOn}
              micEnabled={isMicOn}
              isMainTile={false}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 sm:gap-6 z-20 shrink-0 pb-4 sm:pb-0">
          <button onClick={toggleMic} className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg ${isMicOn ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'}`}>
            {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <button onClick={toggleCamera} className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg ${isCameraOn ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'}`}>
            {isCameraOn ? <Camera size={22} /> : <CameraOff size={22} />}
          </button>
          <div className="w-px h-10 bg-gray-800 mx-2"></div>
          <button onClick={() => { cleanup(); onLeave(); }} className="px-6 py-3.5 rounded-full bg-red-600/10 text-red-500 font-medium hover:bg-red-600 hover:text-white transition-all border border-red-600/20 hover:border-red-500 md:min-w-[140px] flex items-center justify-center gap-2">
            <PhoneOff size={20} />
            <span className="hidden sm:inline">Leave</span>
          </button>
          {role === 'expert' && (
            <button onClick={handleEndMeeting} className="hidden sm:block text-xs text-red-500 hover:text-red-400 underline ml-2 font-medium">
              End Meeting
            </button>
          )}
        </div>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-gray-900 border-l border-gray-800 transform transition-transform duration-300 z-40 ease-in-out ${showSidebar ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800">
          <span className="font-bold text-gray-200">Session Details</span>
          <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-5 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-gray-800/40 p-5 rounded-xl border border-gray-700/50 space-y-4">
              <div>
                <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Topic</h3>
                <div className="flex flex-wrap gap-2">
                  {sessionData?.topics?.map((t: string) => (
                    <span key={t} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-md border border-blue-500/20">{t}</span>
                  )) || <span className="text-gray-500 text-sm italic">No topics listed</span>}
                </div>
              </div>
              <div>
                <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Duration</h3>
                <p className="text-gray-300 font-medium flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  {sessionData?.duration} minutes
                </p>
              </div>
            </div>

            {/* Participants */}
            <div>
              <h3 className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-4">Participants</h3>
              <div className="space-y-4">
                {/* Expert */}
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-center border border-indigo-700/50 shadow-inner">
                    <span className="text-indigo-200 font-bold text-lg">{sessionData?.expertDetails?.name?.charAt(0) || 'E'}</span>
                  </div>
                  <div>
                    <p className="text-gray-200 text-sm font-semibold group-hover:text-white transition-colors">{sessionData?.expertDetails?.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">EXPERT</span>
                      <span className="text-xs text-gray-500 truncate max-w-[120px]">{sessionData?.expertDetails?.role || 'Interviewer'}</span>
                    </div>
                  </div>
                </div>
                {/* Candidate */}
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center border border-emerald-700/50 shadow-inner">
                    <span className="text-emerald-200 font-bold text-lg">{sessionData?.candidateDetails?.name?.charAt(0) || 'C'}</span>
                  </div>
                  <div>
                    <p className="text-gray-200 text-sm font-semibold group-hover:text-white transition-colors">{sessionData?.candidateDetails?.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">CANDIDATE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-600 text-center">Session ID: <span className="font-mono">{meetingId}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function LiveMeeting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const meetingId = searchParams.get('meetingId') || '';
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  // Securely get role, but now rely on backend validation
  const stateRole = (location.state as { role?: 'expert' | 'candidate' })?.role;
  // If no state role, we will determine it from session data if possible, or error out.

  useEffect(() => {
    if (!user || !meetingId) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/sessions/${meetingId}`);
        setSession(res.data);
        setError(null);
      } catch (err: any) {
        console.error("Fetch Session Error", err);
        setError(err.response?.data?.message || err.message || "Failed to load session details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [meetingId, user]);

  const handleJoin = async () => {
    if (!session) return;

    // Status check
    if (session.status === 'completed' || session.status === 'cancelled') {
      toast.error(`Session is ${session.status}. You cannot join.`);
      return;
    }

    // Role Resolution
    let myRole = stateRole;
    if (!myRole && user) {
      // Infer from IDs
      if (user.id === session.expertId || user.id === session.expertDetails?.userId) myRole = 'expert';
      else if (user.id === session.candidateId || user.id === session.candidateDetails?.userId) myRole = 'candidate';
    }

    if (!myRole) {
      toast.error("Could not verify your role in this session.");
      return;
    }

    // Join API Call (Optional validation)
    try {
      const joinRes = await axios.post(`/api/sessions/${meetingId}/join`, { userId: user?.id });
      if (joinRes.data.permitted) {
        setIsJoined(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to join session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-gray-400 animate-pulse font-medium tracking-wide">CONNECTING TO SECURE SERVER...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Session Unavailable</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">{error || "The session you are trying to join could not be found or has expired."}</p>
          <button onClick={() => navigate('/dashboard/sessions')} className="w-full py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium border border-gray-700 hover:border-gray-600">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active Meeting
  if (isJoined) {
    return (
      <ActiveMeeting
        meetingId={meetingId}
        role={stateRole || (user?.id === session.expertId ? 'expert' : 'candidate')}
        userId={user?.id}
        sessionData={session}
        onLeave={() => {
          setIsJoined(false);
          navigate(user?.userType === 'expert' ? '/dashboard/sessions' : '/my-sessions');
        }}
      />
    );
  }

  // Lobby
  const isCompleted = session.status === 'completed';
  const isCancelled = session.status === 'cancelled';
  const canJoin = !isCompleted && !isCancelled;
  const startTime = new Date(session.startTime);
  const now = new Date();

  // Allow joining if within 15 mins of start time OR if start time is past
  // Logic: Users can join late, but not too early.
  const timeDiff = startTime.getTime() - now.getTime();
  const minutesUntilStart = Math.ceil(timeDiff / (1000 * 60));
  const isTooEarly = minutesUntilStart > 15;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Inter']">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-2xl border border-gray-700/50 shadow-2xl rounded-3xl p-8 md:p-10 max-w-3xl w-full relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1 bg-opacity-10 border bg-white border-white/10 rounded-full text-xs font-bold tracking-wide uppercase mb-6 ${session.status === 'live' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-blue-300 bg-blue-500/10 border-blue-400/20'}`}>
            <div className={`w-2 h-2 rounded-full ${session.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`}></div>
            {session.status === 'live' ? 'Live Now' : session.status}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{session.topics?.[0] || "Mock Interview Session"}</h1>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Clock size={16} />
            Scheduled for {new Date(session.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-5 bg-gray-800/40 hover:bg-gray-800/60 transition-colors rounded-2xl border border-gray-700/50 flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
              {session.expertDetails?.name?.charAt(0) || 'E'}
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">Interviewer</p>
              <p className="text-white font-semibold text-lg">{session.expertDetails?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.expertDetails?.role || 'Expert Interviewer'}</p>
            </div>
          </div>

          <div className="p-5 bg-gray-800/40 hover:bg-gray-800/60 transition-colors rounded-2xl border border-gray-700/50 flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
              {session.candidateDetails?.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">Candidate</p>
              <p className="text-white font-semibold text-lg">{session.candidateDetails?.name}</p>
              <p className="text-xs text-gray-500">Ready to join</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {canJoin ? (
            isTooEarly ? (
              <button disabled className="w-full py-4 bg-gray-800 text-gray-400 rounded-xl font-bold cursor-not-allowed border border-gray-700 flex flex-col items-center">
                <span className="flex items-center gap-2"><Clock size={18} /> Meeting Starts Soon</span>
                <span className="text-xs font-normal mt-1 opacity-60">You can join 15 minutes before start time</span>
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="w-full py-4 bg-[#004fcb] hover:bg-blue-600 active:scale-[0.99] text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 text-lg border border-blue-500/50"
              >
                <Camera size={24} />
                Join Interview Now
              </button>
            )
          ) : (
            <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 font-semibold mb-1">This session is {session.status}.</p>
              <p className="text-red-400/60 text-sm">Please contact support if you believe this is a mistake.</p>
            </div>
          )}

          <button onClick={() => navigate(user?.userType === 'expert' ? '/dashboard/sessions' : '/my-sessions')} className="w-full py-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-medium transition-colors text-sm">
            Cancel & Return to Dashboard
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-xs">Protected by End-to-End Encryption • Mockeefy Secure Interview</p>
      </div>
    </div>
  );
}