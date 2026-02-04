import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Download,
  FileText,
  User,
  TrendingUp,
  Award,
  Briefcase,
  ChevronRight,
  Search,
  LayoutDashboard,
  ListVideo,
  PieChart,
  Star,
  RefreshCw,
  Play,
  Calendar,
  Bookmark,
  MapPin,
  CheckCircle,
  Zap,
  Shield as ShieldIcon // Rename to avoid conflict if needed, or just use Shield
} from "lucide-react";
import { toast } from "sonner";
import Navigation from "./Navigation";
import { useAuth } from "../context/AuthContext";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";

// --- Types ---

type Session = {
  id: string;
  expert: string;
  role: string;
  company: string;
  date: string;
  time: string;
  duration: string;
  status: "Upcoming" | "Completed" | "Cancelled" | "Confirmed" | "Live";
  score?: number; // Mock score for completed sessions
  meetLink?: string;
  sessionId: string;
  expertId?: string;
  profileImage?: string | null;
  startTime?: string;
  endTime?: string;
  category?: string;
};

type SavedExpert = {
  id: string;
  expertID: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  reviews: number;
  price: string;
  location: string;
  skills: string[];
  experience: string;
  responseTime: string;
  totalAvailableSlots: number;
  isVerified: boolean;
};

// --- Mock Data ---

const MOCK_CERTIFICATES = [
  {
    id: 1,
    name: "Senior React Developer",
    issueDate: "Oct 15, 2025",
    score: "92%",
    badgeColor: "bg-blue-100 text-blue-700",
    icon: <Award className="w-6 h-6" />
  },
  {
    id: 2,
    name: "System Design Architect",
    issueDate: "Nov 02, 2025",
    score: "88%",
    badgeColor: "bg-purple-100 text-purple-700",
    icon: <ShieldIcon className="w-6 h-6" />
  }
];

// --- Component ---

const MySessions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'sessions' | 'certifications' | 'reports' | 'saved'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Saved Experts State
  const [savedExperts, setSavedExperts] = useState<SavedExpert[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Fetch Saved Experts
  const fetchSavedExperts = async () => {
    if (!user?.id) return;
    setSavedLoading(true);
    try {
      const res = await axios.get("/api/user/saved-experts");
      if (res.data?.data) {
        const mapped = res.data.data.map((item: any) => {
          const expert = item.expertId;
          if (!expert) return null;

          const cat = expert.personalInformation?.category || "IT";
          let exp = "";
          if (expert.professionalDetails?.totalExperience) exp = expert.professionalDetails.totalExperience === 1 ? "1 year" : `${expert.professionalDetails.totalExperience} years`;
          // Fallback for experience (simplified for this view)
          else exp = "Experienced";

          return {
            id: expert._id || expert.userId,
            expertID: expert._id,
            name: expert.personalInformation?.userName || "Expert",
            role: expert.professionalDetails?.title || `Expert`,
            company: expert.professionalDetails?.company || "Freelance",
            avatar: getProfileImageUrl(expert.profileImage),
            rating: expert.metrics?.avgRating || 0,
            reviews: expert.metrics?.totalReviews || 0,
            price: expert.price ? `₹${expert.price}` : "₹500",
            location: expert.personalInformation?.city || "Online",
            skills: ((expert.expertSkills || []).map((s: any) => s.skillName).slice(0, 3)) || [],
            experience: exp,
            responseTime: expert.metrics?.avgResponseTime ? `${Math.round(expert.metrics.avgResponseTime)}h` : "fast",
            totalAvailableSlots: 5, // Mock or calc
            isVerified: expert.status === "Active"
          };
        }).filter(Boolean);
        setSavedExperts(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch saved experts", e);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'saved') {
      fetchSavedExperts();
    }
  }, [activeView, user?.id]);


  // Stats State
  const [stats, setStats] = useState({
    completed: 0,
    certifications: 2, // Mocked based on UI request
    reports: 0,
    upcoming: 0
  });

  // Filtered sessions based on search and status
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = searchQuery === '' ||
        session.expert.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || session.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, statusFilter]);

  // Refresh function
  const refreshSessions = async () => {
    setRefreshing(true);
    try {
      if (!user?.id) return;

      const res = await axios.get(`/api/sessions/candidate/${user.id}`);
      const data = res.data;

      if (Array.isArray(data)) {
        const mapped: Session[] = data.map((s: any) => {
          const startDate = new Date(s.startTime);
          const endDate = new Date(s.endTime);
          const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

          return {
            id: s._id,
            expert: s.expertDetails?.name || "Expert",
            role: s.expertDetails?.role || "Interviewer",
            company: s.expertDetails?.company || "Tech Company",
            date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            duration: `${duration} min`,
            status: (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as Session['status'],
            score: s.status === 'completed' ? Math.floor(Math.random() * (95 - 75) + 75) : undefined,
            meetLink: s.meetLink,
            sessionId: s.sessionId,
            expertId: s.expertId,
            profileImage: s.expertDetails?.profileImage,
            startTime: s.startTime,
            category: s.expertDetails?.category || "General"
          };
        });

        mapped.sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime());
        setSessions(mapped);

        setStats(prev => ({
          ...prev,
          completed: mapped.filter(s => s.status === 'Completed').length,
          reports: mapped.filter(s => s.status === 'Completed').length,
          upcoming: mapped.filter(s => s.status === 'Upcoming' || s.status === 'Confirmed').length
        }));
      }
    } catch (err) {
      console.error("Failed to refresh sessions", err);
      toast.error("Could not refresh sessions");
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch Logic
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;

        const res = await axios.get(`/api/sessions/candidate/${user.id}`);
        const data = res.data;

        if (Array.isArray(data)) {
          const mapped: Session[] = data.map((s: any) => {
            const startDate = new Date(s.startTime);
            const endDate = new Date(s.endTime);
            const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

            return {
              id: s._id,
              expert: s.expertDetails?.name || "Expert",
              role: s.expertDetails?.role || "Interviewer",
              company: s.expertDetails?.company || "Tech Company",
              date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              duration: `${duration} min`,
              status: (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as Session['status'],
              score: s.status === 'completed' ? Math.floor(Math.random() * (95 - 75) + 75) : undefined, // Mock score
              meetLink: s.meetLink,
              sessionId: s.sessionId,
              expertId: s.expertId,
              profileImage: s.expertDetails?.profileImage,
              startTime: s.startTime,
              category: s.expertDetails?.category || "General"
            };
          });

          mapped.sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime());
          setSessions(mapped);

          setStats(prev => ({
            ...prev,
            completed: mapped.filter(s => s.status === 'Completed').length,
            reports: mapped.filter(s => s.status === 'Completed').length,
            upcoming: mapped.filter(s => s.status === 'Upcoming' || s.status === 'Confirmed').length
          }));
        }
      } catch (err) {
        console.error("Failed to fetch sessions", err);
        toast.error("Could not load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user?.id]);

  const handleJoin = (session: Session) => {
    if (['Upcoming', 'Confirmed', 'Live'].includes(session.status)) {
      // Use sessionId derived from the session object, fallback to 'demo' only if absolutely missing
      const targetId = session.sessionId || session.meetLink || 'demo';
      navigate(`/live-meeting?meetingId=${targetId}`, {
        state: { role: 'candidate' }
      });
    }
  };

  const NavItem = ({ id, label, icon }: { id: typeof activeView, label: string, icon: any }) => (
    <button
      onClick={() => setActiveView(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === id
        ? "bg-[#004fcb] text-white shadow-md shadow-blue-200"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      {icon}
      <span>{label}</span>
      {activeView === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Interview Sessions</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your interviews, track progress, and view reports.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="bg-[#004fcb] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Book New Interview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --- SIDE NAVIGATION --- */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 space-y-1 sticky top-24">
              <NavItem id="overview" label="Overview" icon={<LayoutDashboard className="w-4 h-4" />} />
              <NavItem id="sessions" label="All Sessions" icon={<ListVideo className="w-4 h-4" />} />
              <NavItem id="certifications" label="Certifications" icon={<Award className="w-4 h-4" />} />
              <NavItem id="reports" label="Performance & Reports" icon={<PieChart className="w-4 h-4" />} />

              <div className="pt-2 border-t border-gray-100 mt-2">
                <button
                  onClick={() => setActiveView('saved')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === 'saved'
                    ? "bg-[#004fcb] text-white shadow-md shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Saved Experts</span>
                </button>
              </div>
            </div>

            {/* Mini Stats in Sidebar */}
            <div className="mt-6 bg-[#004fcb]/5 rounded-2xl p-5 border border-[#004fcb]/10">
              <h3 className="text-xs font-black text-[#004fcb] uppercase tracking-wider mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                  {loading ? (
                    <div className="h-5 w-8 bg-blue-100/50 animate-pulse rounded"></div>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">{stats.completed}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Upcoming</span>
                  {loading ? (
                    <div className="h-5 w-8 bg-blue-100/50 animate-pulse rounded"></div>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">{stats.upcoming}</span>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="lg:col-span-9 space-y-6">

            {/* VIEW: OVERVIEW */}
            {activeView === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Total Sessions" value={stats.completed + stats.upcoming} icon={<Video className="w-5 h-5 text-white" />} color="bg-blue-500" loading={loading} />
                  <StatCard label="Certificates" value={stats.certifications} icon={<Award className="w-5 h-5 text-white" />} color="bg-purple-500" loading={loading} />
                  <StatCard label="Reports" value={stats.reports} icon={<FileText className="w-5 h-5 text-white" />} color="bg-emerald-500" loading={loading} />
                </div>

                {/* Recent Activity (Subset of sessions) */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    <button onClick={() => setActiveView('sessions')} className="text-sm text-[#004fcb] font-bold hover:underline">View All</button>
                  </div>
                  <SessionsList sessions={filteredSessions.slice(0, 3)} handleJoin={handleJoin} loading={loading} />
                </section>
              </div>
            )}

            {/* VIEW: ALL SESSIONS */}
            {activeView === 'sessions' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">All Interview Sessions</h2>
                        <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search experts, companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#004fcb] focus:bg-white transition-colors w-full sm:w-64"
                          />
                        </div>

                        {/* Filter */}
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#004fcb] focus:bg-white transition-colors"
                        >
                          <option value="all">All Status</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Refresh */}
                        <button
                          onClick={refreshSessions}
                          disabled={refreshing}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[#004fcb] transition-colors disabled:opacity-50"
                          title="Refresh sessions"
                        >
                          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Active Filters */}
                    {(searchQuery || statusFilter !== 'all') && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-xs text-gray-500">Filters:</span>
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            Search: "{searchQuery}"
                            <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">×</button>
                          </span>
                        )}
                        {statusFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full capitalize">
                            Status: {statusFilter}
                            <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900">×</button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <SessionsList sessions={filteredSessions} handleJoin={handleJoin} loading={loading || refreshing} />
                </div>
              </div>
            )}

            {/* VIEW: CERTIFICATIONS */}
            {activeView === 'certifications' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-600" />
                    Earned Certifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_CERTIFICATES.map((cert) => (
                      <div key={cert.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex items-center justify-between hover:border-purple-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${cert.badgeColor}`}>
                            {cert.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{cert.name}</h3>
                            <p className="text-xs text-gray-500">Issued: {cert.issueDate} • Score: {cert.score}</p>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-[#004fcb] transition-colors rounded-lg hover:bg-white">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: REPORTS */}
            {activeView === 'reports' && (
              <div className="space-y-6 animate-fadeIn">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Detailed Performance Analysis
                    </h2>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Top 10% Candidate</span>
                  </div>

                  <div className="space-y-6">
                    <SkillBar label="Communication Skills" score={85} color="bg-blue-500" />
                    <SkillBar label="Technical Knowledge" score={92} color="bg-emerald-500" />
                    <SkillBar label="Problem Solving" score={78} color="bg-amber-500" />
                    <SkillBar label="System Design" score={88} color="bg-purple-500" />
                  </div>

                  <div className="mt-8 bg-amber-50 rounded-xl p-5 border border-amber-100 flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">AI Improvement Suggestion</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Your technical foundation is strong. Focus on structuring your system design answers with a clearer "Requirements &rarr; High Level Design &rarr; Deep Dive" approach to improve your Architect score.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* VIEW: SAVED EXPERTS */}
            {activeView === 'saved' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-[#004fcb]" />
                        Saved Experts
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Your shortlisted mentors and interviewers</p>
                    </div>
                  </div>

                  {savedLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                      ))}
                    </div>
                  ) : savedExperts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-900">No saved experts yet</h3>
                      <p className="text-sm text-gray-500 mb-4">Start exploring experts and save them here.</p>
                      <button onClick={() => navigate('/')} className="text-[#004fcb] font-bold text-sm hover:underline">Find Experts</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedExperts.map(expert => (
                        <SavedExpertCard key={expert.id} expert={expert} onRefresh={fetchSavedExperts} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
};

// --- Sub-Components ---

function StatCard({ label, value, icon, color, loading }: { label: string, value: number, icon: any, color: string, loading?: boolean }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        {loading ? (
          <div className="h-8 w-12 bg-gray-100 animate-pulse rounded mt-1"></div>
        ) : (
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function SessionsList({ sessions, handleJoin, loading }: { sessions: Session[], handleJoin: (s: Session) => void, loading: boolean }) {
  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) return (
    <div className="p-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Video className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">No sessions found</h3>
      <p className="text-gray-500 mb-6">You haven't booked any interview sessions yet.</p>
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="bg-[#004fcb] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all inline-flex items-center gap-2"
      >
        <Briefcase className="w-4 h-4" />
        Book Your First Interview
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-100">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} handleJoin={handleJoin} />
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
              <th className="px-6 py-4">Session Details</th>
              <th className="px-6 py-4">Interviewer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.map((session) => {
              // Check status directly. Defer time validation to the Lobby page for better UX.
              const isJoinable = ['Confirmed', 'Live', 'Upcoming', 'confirmed', 'live', 'upcoming'].includes(session.status);

              return (
                <tr key={session.id} className={`hover:bg-blue-50/50 transition-colors group ${isJoinable ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm">{session.category} Interview</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {/* Explicit Date Format */}
                        {new Date(session.startTime || '').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        <span className="text-gray-300">|</span>
                        {session.time}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProfileImageUrl(session.profileImage)}
                        className="w-8 h-8 rounded-lg object-cover bg-gray-200"
                        alt={session.expert}
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{session.expert}</p>
                        <p className="text-xs text-gray-500">{session.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={isJoinable ? 'Live' : session.status} />
                    {session.score && (
                      <div className="mt-1 text-xs font-bold text-gray-900">
                        Score: <span className="text-[#004fcb]">{session.score}/100</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100">
                      {session.status === 'Completed' ? (
                        <>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip" title="View Report">
                            <FileText className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleJoin(session)}
                          disabled={!isJoinable && session.status !== 'Upcoming'}
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ml-auto
                          ${isJoinable
                              ? 'bg-[#004fcb] text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                          {isJoinable ? <><Play className="w-3 h-3" /> JOIN NOW</> : 'View Details'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Mobile Session Card Component
function SessionCard({ session, handleJoin }: { session: Session, handleJoin: (s: Session) => void }) {
  const isJoinable = ['Confirmed', 'Live', 'Upcoming', 'confirmed', 'live', 'upcoming'].includes(session.status);

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${isJoinable ? 'bg-blue-50/30' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Expert Avatar */}
        <img
          src={getProfileImageUrl(session.profileImage)}
          className="w-12 h-12 rounded-xl object-cover bg-gray-200 flex-shrink-0"
          alt={session.expert}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{session.category} Interview</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {new Date(session.startTime || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {session.time}
              </p>
            </div>
            <StatusBadge status={isJoinable ? 'Live' : session.status} />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{session.expert}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-full">
              {session.status === 'Completed' ? (
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                  View Report
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(session)}
                  disabled={!isJoinable && session.status !== 'Upcoming'}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all
                     ${isJoinable
                      ? 'bg-[#004fcb] text-white hover:bg-blue-700 shadow-md'
                      : 'bg-gray-100 text-gray-400'}`}
                >
                  {isJoinable ? 'JOIN INTERVIEW' : 'View Details'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Upcoming: "bg-purple-50 text-purple-700 border-purple-100",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-100",
    Completed: "bg-gray-100 text-gray-600 border-gray-200",
    Cancelled: "bg-red-50 text-red-700 border-red-100",
    Live: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function SkillBar({ label, score, color }: { label: string, score: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-bold text-gray-700">{label}</span>
        <span className="text-xs font-bold text-gray-900">{score}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}

function SavedExpertCard({ expert, onRefresh }: { expert: SavedExpert, onRefresh: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUnsave = async (e: any) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await axios.delete(`/api/user/saved-experts/${expert.expertID}`);
      toast.success("Removed from saved list");
      onRefresh();
    } catch (error) {
      toast.error("Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    navigate(`/book-session`, {
      state: {
        profile: { ...expert, id: expert.expertID }, // Adapter for profile
        expertId: expert.expertID
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#004fcb] transition-all shadow-sm group">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={expert.avatar}
          alt={expert.name}
          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{expert.name}</h3>
          <p className="text-xs text-gray-500 truncate">{expert.role} @ {expert.company}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            {expert.location}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="font-bold text-gray-900">{expert.rating.toFixed(1)}</span>
          <span>({expert.reviews})</span>
        </div>
        <div className="w-px h-3 bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>{expert.responseTime}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleUnsave}
          disabled={loading}
          className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors text-green-600 bg-green-50 border-green-200"
          title="Saved (Click to remove)"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        </button>
        <button
          onClick={handleBook}
          className="flex-1 bg-[#004fcb] hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
        >
          Book Session
        </button>
      </div>
    </div>
  );
}

export default MySessions;
