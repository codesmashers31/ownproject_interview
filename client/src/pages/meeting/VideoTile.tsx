import { useRef, useEffect } from 'react';
import { VideoOff, MicOff } from 'lucide-react';

interface VideoTileProps {
  name: string;
  isMainTile?: boolean;
  isSpeaking?: boolean;
  cameraEnabled?: boolean;
  micEnabled?: boolean;
  stream?: MediaStream | null;
  muted?: boolean; // Explicit control
  className?: string; // Allow custom styling
}

export function VideoTile({
  name,
  isMainTile = false,
  isSpeaking = false,
  cameraEnabled = true,
  micEnabled = true,
  stream,
  muted = false,
  className = ""
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {

        videoRef.current?.play().catch(e => console.error(`[VideoTile] Play error for ${name}:`, e));
      };
    } else if (!stream) {

    }
  }, [stream, name, cameraEnabled]);

  // Generate a unique gradient based on the name
  const getGradient = (name: string) => {
    const gradients = [
      'from-indigo-900/40 via-purple-900/40 to-pink-900/40',
      'from-blue-900/40 via-cyan-900/40 to-teal-900/40',
      'from-green-900/40 via-emerald-900/40 to-lime-900/40',
      'from-orange-900/40 via-red-900/40 to-pink-900/40',
      'from-violet-900/40 via-purple-900/40 to-fuchsia-900/40',
      'from-slate-900/40 via-gray-900/40 to-zinc-900/40',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const gradient = getGradient(name);

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-[#1a1a1a]
        ${isMainTile ? 'w-full max-w-5xl aspect-video' : 'w-52 aspect-video'}
        ${isSpeaking ? 'ring-4 ring-blue-500 ring-opacity-80' : 'ring-2 ring-transparent'}
        transition-all duration-300
        ${isMainTile ? 'shadow-[0_0_40px_rgba(255,255,255,0.08)]' : 'shadow-lg shadow-black/40'}
        hover:shadow-xl hover:shadow-black/60
        ${className}
      `}
    >
      {/* Video Background (simulated) */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
        {/* Stream Video */}
        {stream && cameraEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Simulated video feed overlay pattern */
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              backgroundSize: '100px 100px'
            }}
          />
        )}
      </div>

      {/* Glow effect for main tile */}
      {isMainTile && (
        <div className="absolute -inset-[2px] bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-xl blur-sm -z-10" />
      )}

      {/* Camera Off Overlay */}
      {!cameraEnabled && (
        <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 bg-[#2a2a2a] rounded-full">
              <VideoOff className={`${isMainTile ? 'w-12 h-12' : 'w-6 h-6'} text-gray-400`} />
            </div>
            {isMainTile && <span className="text-gray-400 text-sm">Camera is off</span>}
          </div>
        </div>
      )}

      {/* Speaking indicator glow */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-xl ring-4 ring-blue-500 ring-opacity-60 animate-pulse pointer-events-none" />
      )}

      {/* Name Label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 max-w-[80%]">
        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
          <span className="text-white text-sm font-medium truncate shadow-sm">{name}</span>
          {!micEnabled && <MicOff className="w-3 h-3 text-red-400" />}
        </div>
      </div>
    </div>
  );
}
