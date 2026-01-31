import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import axios from '../lib/axios';
import {
  Search,
  Bell,
  Users,
  Calendar,
  X,
  Menu,
  LogOut,
  User,
  Settings,
  BookOpen,
  HelpCircle,
  ChevronDown,
  PlayCircle,
  Bot
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";
import { useUserProfile } from "../hooks/useUserProfile";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    link?: string;
  };
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // profileImage state removed, derived from hook
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs for click outside handling
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { user, logout } = useAuth();
  const { data: userProfile } = useUserProfile();
  const profileImage = userProfile?.data?.profileImage || user?.profileImage;

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/notifications?unreadOnly=true');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id: string, link?: string) => {
    try {
      await axios.put('/api/notifications/read', { notificationIds: [id] });
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read', { notificationIds: 'all' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };


  // Close all dropdowns when route changes
  useEffect(() => {
    closeAllDropdowns();
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setIsSearchOpen(false);
      if (menuRef.current && !menuRef.current.contains(target) && isMenuOpen) setIsMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) setIsProfileMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(target)) setIsNotificationOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
    setIsNotificationOpen(false);
    setIsProfileMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const closeAllDropdowns = () => {
    setIsNotificationOpen(false);
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  const navItems = [
    { name: "Find HRs", href: "/", icon: <Users size={18} /> },
    { name: "Watch Mock", href: "/watch-mock", icon: <PlayCircle size={18} /> },
    { name: "My Sessions", href: "/my-sessions", icon: <Calendar size={18} /> },
    { name: "AI Video", href: "/ai-video", icon: <Bot size={18} /> },
  ];

  const profileMenuItems = [
    { name: "Profile", href: "/profile", icon: <User size={18} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={18} /> },
    { name: "Resume", href: "/resume", icon: <BookOpen size={18} /> },
    { name: "Help & Support", href: "/help", icon: <HelpCircle size={18} /> },
  ];

  return (
    <>
      <nav
        ref={menuRef}
        className="bg-white border-b border-blue-100/50 sticky top-0 z-50 w-full h-[80px]"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left side: Logo + Nav Items */}
            <div className="flex items-center space-x-4 lg:space-x-12">
              <Link
                to="/"
                className="flex items-center gap-0 group min-w-max relative"
                onClick={closeAllDropdowns}
              >
                <img
                  src="/benchmock.png"
                  alt="BenchMock"
                  className="absolute  h-[100px] w-auto object-contain mix-blend-multiply"
                />
                <span className="text-3xl font-bold tracking-tight ml-[90px] text-[#004fcb] font-['Outfit']">
                  BenchMock
                </span>
              </Link>

              <div className="hidden md:flex space-x-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== "/");

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${isActive ? "text-[#004fcb] bg-blue-50 font-semibold" : "text-slate-600 hover:text-[#004fcb] hover:bg-blue-50/50"
                        }`}
                      onClick={closeAllDropdowns}
                    >
                      <span className={`mr-2 ${isActive ? "text-[#004fcb]" : "text-slate-400 group-hover:text-[#004fcb]"}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsProfileMenuOpen(false);
                    if (!isNotificationOpen) fetchNotifications();
                  }}
                  className="p-2 text-slate-500 hover:text-[#004fcb] rounded-lg hover:bg-blue-50 transition-all active:scale-95"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-[#004fcb] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-blue-100 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5">
                    <div className="px-4 py-3 border-b border-blue-50 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No new notifications</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`px-4 py-3 border-b border-slate-50 hover:bg-blue-50/50 cursor-pointer ${!notification.isRead ? 'bg-blue-50/20' : ''}`}
                            onClick={() => markAsRead(notification._id, notification.metadata?.link)}
                          >
                            <p className="font-medium text-slate-800 text-sm">{notification.title}</p>
                            <p className="text-slate-500 text-xs mt-1">{notification.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-200 mx-2"></div>

              {/* Profile / Auth */}
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                      setIsNotificationOpen(false);
                    }}
                    className="flex items-center space-x-3 p-1 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 overflow-hidden">
                      <img
                        src={profileImage || getProfileImageUrl(null)}
                        alt="profile"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = getProfileImageUrl(null); }}
                      />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-slate-700 leading-none">
                        {user.name?.split(" ")[0] || "User"}
                      </p>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-blue-100 rounded-xl shadow-xl py-2 z-50 ring-1 ring-black/5">
                      <div className="px-4 py-3 border-b border-blue-50 bg-slate-50/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden">
                          <img src={profileImage || getProfileImageUrl(null)} alt="p" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = getProfileImageUrl(null) }} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="py-2">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-600 hover:text-[#004fcb] text-sm font-medium transition-colors"
                            onClick={closeAllDropdowns}
                          >
                            <span className="mr-3 text-slate-400">{item.icon}</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-blue-50 mt-1 px-2 py-2">
                        <button
                          onClick={() => { logout(); closeAllDropdowns(); }}
                          className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <LogOut size={16} className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/signin">
                    <Button variant="ghost" className="font-medium text-slate-600 hover:text-[#004fcb] hover:bg-blue-50">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="font-medium bg-[#004fcb] hover:bg-[#003bb5] text-white shadow-sm shadow-blue-200">Join Now</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleMenu} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-[80px] left-0 w-full bg-white border-b border-blue-100 shadow-xl z-40">
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-[#004fcb]"
                  onClick={closeAllDropdowns}
                >
                  <span className="mr-3 text-slate-400">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              <div className="h-px bg-blue-50 my-2"></div>
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-blue-50" onClick={closeAllDropdowns}>
                    <span className="mr-3 text-slate-400"><User size={18} /></span> Profile
                  </Link>
                  <button onClick={() => { logout(); closeAllDropdowns(); }} className="flex w-full items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
                    <span className="mr-3"><LogOut size={18} /></span> Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link to="/signin" onClick={closeAllDropdowns}><Button variant="outline" className="w-full">Sign In</Button></Link>
                  <Link to="/signup" onClick={closeAllDropdowns}><Button className="w-full bg-[#004fcb] hover:bg-[#003bb5]">Join Now</Button></Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsMenuOpen(false)} />}
    </>
  );
};

export default Navigation;