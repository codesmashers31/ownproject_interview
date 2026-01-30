import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Edit3,
  User,
  Sparkles,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Bookmark,
  Settings,
  Bot,
  Clock,
  Video
} from "lucide-react";
import axios from '../lib/axios';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";
import { useUserProfile } from "../hooks/useUserProfile";

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [nextSession, setNextSession] = useState<any>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const profileData = userProfile?.data;

  // Use derived loading state. If we have profileData (from cache/placeholder), we don't block on profile loading.
  const loading = sessionsLoading && (!profileData && isProfileLoading);
  // Actually, sidebar skeleton covers everything. 
  // If we have profile but not sessions, do we show loading?
  // Current logic: `if (loading && !profileData)` returns skeleton.
  // So if I have profile data, I can show sidebar?
  // But the sidebar has a "Next Session" part.
  // If I show sidebar immediately with profile, session part might pop in?
  // Use `loading` to control skeleton for whole sidebar or just parts?
  // The skeleton covers whole sidebar.
  // The user wants "very fast and never flicker".
  // Best is to show profile immediately if available, and maybe skeleton for session part?
  // Or just render session as null if loading?
  // The current skeleton is full page.
  // I will make `loading` depend on `!profileData`. If we have profile, show it!
  // `sessionsLoading` can just affect the session card locally?
  // But `Sidebar` code returns early if `loading && !profileData`.
  // So if I set `loading` to `sessionsLoading`, it waits for sessions.
  // I want to bypass wait if profile is ready.
  // So `loading` should be `(!profileData && isProfileLoading)`.
  // Sessions can load in background.
  // But verify `Sidebar` render logic for sessions. 
  // View file showed `Next Session` logic? I didn't see the render part fully.
  // I'll stick to `const loading = !profileData;` basically.
  // But `sessionsLoading` is needed for the session part?
  // I'll keep the variable `sessionsLoading` available but maybe not force global loading.

  // Actually, I'll just replicate the `fetchData` logic but for sessions only.

  // Fetch Sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (user?.id) {
        setSessionsLoading(true);
        try {
          const sessionsRes = await axios.get(`/api/sessions/candidate/${user.id}`);

          if (Array.isArray(sessionsRes.data)) {
            // Find the next upcoming session
            const now = new Date();
            const upcoming = sessionsRes.data
              .filter((s: any) => new Date(s.startTime) > now && s.status !== 'Cancelled')
              .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

            if (upcoming) {
              setNextSession(upcoming);
            }
          }
        } catch (error) {
          console.error("Error fetching sessions:", error);
        } finally {
          setSessionsLoading(false);
        }
      }
    };
    fetchSessions();
  }, [user?.id]);

  if (loading && !profileData) {
    return (
      <div className="w-full max-w-xs mx-auto space-y-6 pb-6">
        {/* Profile Card Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="h-2 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-full bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* AI Interview Button Skeleton */}
        <div className="w-full h-20 bg-gray-200 rounded-xl animate-pulse shadow-sm" />

        {/* Navigation Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 w-full bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Upcoming Session Skeleton */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const NavItem = ({ icon: Icon, label, path, active }: any) => (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
        ? "bg-[#004fcb]/10 text-[#004fcb]"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      <Icon size={18} className={active ? "text-[#004fcb]" : "text-gray-500"} />
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-xs mx-auto space-y-6 pb-6">

      {/* 1. Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <img
              src={getProfileImageUrl(profileData.profileImage)}
              alt={profileData.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#004fcb]"
              onError={(e) => {
                e.currentTarget.src = getProfileImageUrl(null);
              }}
            />
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{profileData.name}</h3>
              <p className="text-xs text-[#004fcb] font-medium">
                {profileData.experience && profileData.experience.length > 0
                  ? profileData.experience[0].position
                  : "Member"}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-[#004fcb] transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 bg-white border-t border-gray-100">
            <div className="py-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-600">Profile Completion</span>
                  <span className="font-bold text-[#004fcb]">{profileData.profileCompletion || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#004fcb] h-full rounded-full"
                    style={{ width: `${profileData.profileCompletion || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[#004fcb]" />
                  <span className="truncate">{profileData.email}</span>
                </div>
                {profileData.personalInfo?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#004fcb]" />
                    <span>{profileData.personalInfo.city}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-all border border-gray-200"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* 2. AI Interview CTA - PRIMARY ACTION */}
      <button
        onClick={() => navigate("/ai-video")}
        className="w-full bg-gradient-to-r from-[#004fcb] to-[#0063ff] hover:from-[#003bb5] hover:to-[#004fcb] text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group flex items-center justify-between relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white text-base">Start AI Interview</h3>
            <p className="text-white/80 text-xs font-medium">Practice with AI Mock</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-transform"></div>
      </button>

      {/* 3. Navigation / Quick Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="space-y-1">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            path="/"
            active={location.pathname === "/"}
          />
          <NavItem
            icon={Calendar}
            label="My Sessions"
            path="/my-sessions"
            active={location.pathname === "/my-sessions"}
          />
          <NavItem
            icon={MessageSquare}
            label="Messages"
            path="/messages"
            active={location.pathname === "/messages"}
          />
          <NavItem
            icon={Bookmark}
            label="Saved Experts"
            path="/saved-experts"
            active={location.pathname === "/saved-experts"}
          />
          <NavItem
            icon={Settings}
            label="Settings"
            path="/settings"
            active={location.pathname === "/settings"}
          />
        </div>
      </div>

      {/* 4. Upcoming Session (Backend Connected) */}
      {nextSession && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Upcoming Session
            </h3>
            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
              {new Date(nextSession.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <img
              src={getProfileImageUrl(nextSession.expertDetails?.profileImage)}
              className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
              alt="Expert"
            />
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">{nextSession.expertDetails?.name || "Expert"}</p>
              <p className="text-xs text-gray-500 truncate">{nextSession.expertDetails?.role || "Mentor"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
            <Clock size={14} className="text-[#004fcb]" />
            <span className="font-medium">
              {new Date(nextSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-gray-300">|</span>
            <span>{Math.round((new Date(nextSession.endTime).getTime() - new Date(nextSession.startTime).getTime()) / 60000)} min</span>
          </div>

          <button
            onClick={() => navigate('/my-sessions')}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <Video size={12} />
            Join Meeting
          </button>
        </div>
      )}

      {/* 5. Promo/Resources */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm group cursor-pointer">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-white rounded-lg border border-blue-100 shadow-sm text-[#004fcb]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Premium Plan</h3>
            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">Unlock Features</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          Get unlimited AI interviews and priority booking access.
        </p>
        <button className="text-xs font-bold text-[#004fcb] group-hover:underline">
          Upgrade Now →
        </button>
      </div>

    </div>
  );
};

export const SkeletonSidebar = () => (
  <div className="w-full max-w-xs mx-auto space-y-6 pb-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-24 animate-pulse p-4 flex gap-3">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
    <div className="w-full h-20 bg-gray-200 rounded-xl animate-pulse"></div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 space-y-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-11 w-full bg-gray-50 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

export default Sidebar;