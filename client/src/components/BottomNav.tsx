import { User, Settings2, LogOut, BookOpen, HelpCircle, Briefcase, X, PlayCircle, Calendar, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";
import { Button } from "./ui/button";

const BottomNav = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Hide bottom nav on authentication pages
  // Hide bottom nav on authentication pages
  const authPages = ['/signin', '/signup', '/forgot-password'];
  const shouldShowNav = !authPages.includes(location.pathname);

  // Fetch user profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user?.id) {
        try {
          const response = await axios.get('/api/user/profile', {
            headers: { userid: user.id }
          });
          const data = response.data;
          if (data.success && data.data.profileImage) {
            setProfileImage(getProfileImageUrl(data.data.profileImage));
          }
        } catch (error) {
          console.error('Error fetching profile image:', error);
        }
      }
    };
    fetchProfileImage();
  }, [user?.id]);



  if (!shouldShowNav) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      const pathStartsWithDashboard = location.pathname.startsWith('/dashboard');
      const isExpert = user?.userType === 'expert';
      const isDashboardActive = pathStartsWithDashboard && isExpert;

      return isDashboardActive;
    }

    const isPathActive = location.pathname === path;
    return isPathActive;
  };

  const profileMenuItems = [
    { name: "My Profile", href: "/profile", icon: <User size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Settings", href: "/settings", icon: <Settings2 size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "My Resume", href: "/resume", icon: <BookOpen size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Help & Support", href: "/help", icon: <HelpCircle size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <>
      {/* Main bar */}
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-white/95 backdrop-blur-lg border-t border-blue-100 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:hidden pb-safe">

        <Link
          to="/watch-mock"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${isActive('/watch-mock') ? '-mt-6' : ''}`}
        >
          {isActive('/watch-mock') ? (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 bg-[#004fcb] border-4 border-white scale-110">
              <PlayCircle size={20} className="text-white" />
            </div>
          ) : (
            <div className={`p-1 rounded-lg transition-all duration-300 ${isActive('/watch-mock') ? 'bg-blue-100' : ''}`}>
              <PlayCircle className={`w-6 h-6 transition-all duration-300`} strokeWidth={2} />
            </div>
          )}
          <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive('/watch-mock') ? 'text-[#004fcb] font-semibold' : 'text-blue-600'}`}>Watch</span>
        </Link>

        <Link
          to="/my-sessions"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${isActive('/my-sessions') ? '-mt-6' : ''}`}
        >
          {isActive('/my-sessions') ? (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 bg-[#004fcb] border-4 border-white scale-110">
              <Calendar size={20} className="text-white" />
            </div>
          ) : (
            <div className={`p-1 rounded-lg transition-all duration-300 ${isActive('/my-sessions') ? 'bg-blue-100' : ''}`}>
              <Calendar className={`w-6 h-6 transition-all duration-300`} strokeWidth={2} />
            </div>
          )}
          <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive('/my-sessions') ? 'text-[#004fcb] font-semibold' : 'text-blue-600'}`}>Sessions</span>
        </Link>

        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${isActive('/dashboard') ? '-mt-6' : ''}`}
        >
          {(() => {
            const active = isActive('/dashboard');

            return active ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/50 bg-[#004fcb] border-4 border-white scale-110 transition-all duration-300">
                <Briefcase size={20} className="text-white" />
              </div>
            ) : (
              <div className="p-1 rounded-lg transition-all duration-300 bg-blue-50">
                <Briefcase className="w-6 h-6 transition-all duration-300 text-blue-600" strokeWidth={2} />
              </div>
            );
          })()}
          <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive('/dashboard') ? 'text-[#004fcb] font-semibold' : user?.userType !== 'expert' ? 'text-gray-400' : 'text-blue-600'}`}>Find HRs</span>
        </Link>

        <Link
          to="/ai-video"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${isActive('/ai-video') ? '-mt-6' : ''}`}
        >
          {isActive('/ai-video') ? (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 bg-[#004fcb] border-4 border-white scale-110">
              <Bot size={20} className="text-white" />
            </div>
          ) : (
            <div className={`p-1 rounded-lg transition-all duration-300 ${isActive('/ai-video') ? 'bg-blue-100' : ''}`}>
              <Bot className={`w-6 h-6 transition-all duration-300`} strokeWidth={2} />
            </div>
          )}
          <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive('/ai-video') ? 'text-[#004fcb] font-semibold' : 'text-blue-600'}`}>AI Video</span>
        </Link>

        <button
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${isActive('/profile') ? '-mt-6' : ''}`}
          onClick={() => setShowProfile(true)}
        >
          {isActive('/profile') ? (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 bg-[#004fcb] border-4 border-white scale-110">
              <User size={20} className="text-white" />
            </div>
          ) : (
            <div className={`relative p-1 rounded-lg transition-all duration-300 ${isActive('/profile') ? 'bg-blue-100' : ''}`}>
              {user ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all duration-300 border-blue-300`}>
                  <img
                    src={profileImage || getProfileImageUrl(null)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = getProfileImageUrl(null); }}
                  />
                </div>
              ) : (
                <User className={`w-6 h-6 transition-all duration-300`} strokeWidth={2} />
              )}
            </div>
          )}
          <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive('/profile') ? 'text-[#004fcb] font-semibold' : 'text-blue-600'}`}>Profile</span>
        </button>
      </nav>

      {/* Profile Sheet (Overlay) */}
      {showProfile && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowProfile(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

            <div className="p-5">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">Account</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {user ? (
                <>
                  {/* User Info Card */}
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 mb-6">
                    <img
                      src={profileImage || getProfileImageUrl(null)}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                      onError={(e) => { e.currentTarget.src = getProfileImageUrl(null); }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {user.name || user.email.split('@')[0]}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 bg-gray-900 text-white rounded-full font-medium">Premium</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setShowProfile(false)}
                        className="flex flex-col items-center justify-center p-4 bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
                      >
                        <div className={`p-3 rounded-xl mb-2 ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                          {item.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Logout Button */}
                  <Button
                    onClick={() => {
                      logout();
                      setShowProfile(false);
                    }}
                    variant="outline"
                    className="w-full py-6 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 flex items-center justify-center gap-2 group"
                  >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                  </Button>
                </>
              ) : (
                /* Guest State */
                <div className="flex flex-col gap-3">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Welcome to BenchMock</h3>
                    <p className="text-gray-500 text-sm">Sign in to manage your profile and sessions</p>
                  </div>

                  <Link to="/signin" onClick={() => setShowProfile(false)}>
                    <Button variant="outline" className="w-full py-6 text-base rounded-xl font-semibold border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setShowProfile(false)}>
                    <Button className="w-full py-6 text-base rounded-xl font-semibold bg-[#004fcb] text-white hover:bg-[#003bb5] shadow-lg shadow-blue-600/20">
                      Create Information
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Safe area spacer for mobile */}
            <div className="h-8" />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0.5; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </>
  );
};

export default BottomNav;
