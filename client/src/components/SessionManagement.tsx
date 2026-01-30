import { useState, useEffect, useMemo } from "react";
import axios from '../lib/axios';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface Session {
  _id: string;
  sessionId: string;
  expertId: string;
  candidateId: string;
  expertName?: string;
  candidateName?: string;
  startTime: string; // ISO Date string
  endTime: string;
  topics: string[];
  price: number;
  status: string; // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  duration?: number;
  meetingLink?: string;
}

export default function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false); // Default desc (newest first)
  const pageSize = 8;

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/sessions/all");
      if (response.data.success) {
        // Transform incoming data to handle MongoDB Extended JSON format
        const formattedSessions = response.data.data.map((session: any) => ({
          ...session,
          _id: session._id?.$oid || session._id,
          startTime: session.startTime?.$date || session.startTime,
          endTime: session.endTime?.$date || session.endTime,
        }));
        setSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      // Small delay to prevent instant flicker if data is cached/fast
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesStatus = filterStatus === "All" || s.status.toLowerCase() === filterStatus.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (s.expertName?.toLowerCase() || "").includes(searchLower) ||
        (s.candidateName?.toLowerCase() || "").includes(searchLower) ||
        s.sessionId.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [sessions, filterStatus, searchTerm]);

  // Sort by date
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [filteredSessions, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedSessions.length / pageSize);
  const paginatedSessions = sortedSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper functions for UI
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'upcoming': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Skeleton Row Component
  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100/50">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div><div className="h-3 bg-gray-100 rounded w-32 mt-2"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
    </tr>
  );

  return (
    // MAIN PAGE CONTAINER - Matches Dashboard Style
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Session Management</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage all consultation sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLoading(true); fetchSessions(); }}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, expert, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          >
            <option value="All">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-wider w-1/2">Booking Expert Details</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-xs uppercase tracking-wider w-1/2">Booked Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginatedSessions.length > 0 ? (
              paginatedSessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Booking Expert Details Column */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Expert Name</span>
                        <span className="font-medium text-gray-900 text-base">{session.expertName || "Unknown"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Expert ID</span>
                        <span className="text-sm text-gray-600 font-mono">{session.expertId}</span>
                      </div>
                    </div>
                  </td>

                  {/* Booked Details Column */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-3">
                      {/* Candidate Info */}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Candidate</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{session.candidateName || "Unknown"}</span>
                          <span className="text-xs text-gray-400 font-mono">({session.candidateId.slice(-6)}...)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Date & Time */}
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Schedule</span>
                          <span className="text-sm text-gray-900 font-medium">
                            {formatDate(session.startTime)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Price</span>
                          <span className="text-sm font-medium text-gray-900">₹{session.price?.toLocaleString() || 0}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-20 text-center text-gray-500">
                  <p>No sessions found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredSessions.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredSessions.length)} of {filteredSessions.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-900">Page {currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}