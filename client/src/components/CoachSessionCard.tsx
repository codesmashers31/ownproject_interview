import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Star,
  MapPin,
  Shield,
  CheckCircle,
  TrendingUp,
  Zap,
  Bookmark
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import FilterScrollStrip from "./FilterScrollStrip";

// Types
type Category = string;

interface Profile {
  id: string;
  expertID: string;
  name: string;
  role: string;
  industry: string;
  category: Category;
  avatar: string;
  location: string;
  experience: string;
  skills: string[];
  languages: string[];
  mode: string;
  rating: number;
  reviews: number;
  price: string;
  responseTime: string;
  successRate: number;
  isVerified: boolean;
  isFeatured?: boolean;
  availableTime?: string;
  company?: string;
  availability?: {
    sessionDuration: number;
    maxPerDay: number;
    weekly: Record<string, any[]>;
    breakDates: any[];
  };
  totalAvailableSlots?: number;
}

// Save Button Component
const SaveButton = ({ expertId }: { expertId: string }) => {
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !expertId) return;
    const checkStatus = async () => {
      try {
        const res = await axios.get(`/api/user/saved-experts/check/${expertId}`);
        setIsSaved(res.data.isSaved);
      } catch (e) {
        // Silent fail
      }
    };
    checkStatus();
  }, [user, expertId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save experts");
      navigate("/login");
      return;
    }

    const oldState = isSaved;
    setIsSaved(!isSaved);

    try {
      if (oldState) {
        await axios.delete(`/api/user/saved-experts/${expertId}`);
        toast.success("Expert removed from saved info");
      } else {
        await axios.post('/api/user/saved-experts', { expertId });
        toast.success("Expert saved successfully");
      }
    } catch (error) {
      console.error(error);
      setIsSaved(oldState);
      toast.error("Failed to update status");
    }
  };

  return (
    <button
      onClick={toggleSave}
      className={`h-9 w-9 rounded-full flex items-center justify-center transition-all border ${isSaved
        ? "bg-green-50 text-green-600 border-green-200"
        : "bg-white text-gray-400 border-gray-200 hover:border-[#004fcb] hover:text-[#004fcb]"
        }`}
      title={isSaved ? "Saved" : "Save Expert"}
    >
      {isSaved ? <CheckCircle className="w-5 h-5" /> : <Bookmark className="w-4 h-4" />}
    </button>
  );
}

// Profile Card Component
const ProfileCard = ({ profile }: { profile: Profile }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/book-session`, {
      state: {
        profile: profile,
        expertId: profile.expertID
      }
    });
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-[#004fcb] p-5 h-full flex flex-col transition-all duration-300 relative shadow-sm hover:shadow-lg hover:-translate-y-1">

      {/* Top Section: Role, Name, Location & Avatar */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-3">
          {/* Role / Job Title */}
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#004fcb] transition-colors mb-1 line-clamp-1">
            {profile.role}
          </h3>
          {/* Name & Company */}
          <p className="text-gray-600 font-medium text-sm mb-2 line-clamp-1">
            {profile.name} {profile.company ? `• ${profile.company}` : ''}
          </p>
          {/* Location */}
          <div className="flex items-center text-gray-400 text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {profile.location}
          </div>
        </div>

        {/* Avatar */}
        <div className="relative shrink-0 mt-1">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
            onError={(e) => {
              e.currentTarget.src = getProfileImageUrl(null);
            }}
          />
          {profile.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100" title="Verified Expert">
              <Shield className="w-3.5 h-3.5 text-[#004fcb] fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Badges / Skills */}
      <div className="flex flex-wrap items-center gap-2 mb-4 h-auto min-h-[28px]">
        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide whitespace-nowrap">
          {profile.experience}
        </span>
        {profile.skills.slice(0, 4).map((skill, idx) => (
          <span key={idx} className="text-gray-600 text-[10px] font-semibold border border-gray-200 px-1.5 py-0.5 rounded bg-gray-50 whitespace-nowrap">
            {skill}
          </span>
        ))}
        {profile.skills.length > 4 && (
          <span className="text-gray-400 text-[10px] font-medium px-1">
            +{profile.skills.length - 4}
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div className="mb-5 flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-gray-900">{profile.rating.toFixed(1)}</span>
          <span className="text-gray-400">({profile.reviews})</span>
        </div>
        <div className="w-px h-3 bg-gray-300"></div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>{profile.responseTime}</span>
        </div>
        <div className="w-px h-3 bg-gray-300"></div>
        <div className="flex items-center gap-1.5 font-bold text-[#004fcb]">
          <span>{profile.totalAvailableSlots || 0} Slots Available</span>
        </div>
      </div>

      {/* Footer: Price & Action Buttons */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">{profile.price}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">per session</span>
        </div>

        <div className="flex items-center gap-2">
          <SaveButton expertId={profile.expertID || profile.id} />
          <button
            onClick={handleBookNow}
            className="px-4 py-2 bg-[#004fcb] hover:bg-[#003bb5] text-white text-[10px] font-bold rounded-lg transition-all shadow-md hover:shadow-lg transform active:scale-95"
          >
            Book Session
          </button>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col relative animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 pr-3 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
      </div>
      <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-16 bg-gray-100 rounded-md"></div>
      <div className="h-6 w-20 bg-gray-100 rounded-md"></div>
    </div>
    <div className="mb-5 h-10 bg-gray-50 rounded-lg w-full"></div>
    <div className="mt-auto flex justify-between items-center">
      <div className="h-8 w-20 bg-gray-200 rounded"></div>
      <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);

const countSlots = (availability: any) => {
  if (!availability || !availability.weekly) return 0;
  const { sessionDuration = 30, weekly } = availability;

  let totalSlots = 0;

  Object.values(weekly).forEach((daySlots: any) => {
    if (Array.isArray(daySlots)) {
      daySlots.forEach((slot: any) => {
        if (slot.from && slot.to) {
          const [startHour, startMin] = slot.from.split(':').map(Number);
          const [endHour, endMin] = slot.to.split(':').map(Number);

          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          const duration = endMinutes - startMinutes;
          if (duration > 0) {
            totalSlots += Math.floor(duration / sessionDuration);
          }
        }
      });
    }
  });

  return totalSlots;
};

// Helper functions (Unchanged)
const calculateAge = (dob: string) => {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

const calculateProfessionalExperience = (professionalDetails: any) => {
  if (!professionalDetails?.previous?.length) return null;
  let totalMonths = 0;
  const today = new Date();
  professionalDetails.previous.forEach((job: any) => {
    if (job.start) {
      const end = job.end ? new Date(job.end) : today;
      totalMonths += (end.getFullYear() - new Date(job.start).getFullYear()) * 12 + (end.getMonth() - new Date(job.start).getMonth());
    }
  });
  const years = Math.floor(totalMonths / 12);
  return years <= 0 ? "Fresher" : years === 1 ? "1 year" : `${years}+ years`;
};

const getCurrentCompany = (pd: any, cat: string) => {
  const jobs = pd?.previous || [];
  const current = jobs.find((j: any) => !j.endDate) || jobs.sort((a: any, b: any) => new Date(b.end || 0).getTime() - new Date(a.end || 0).getTime())[0];
  return current?.company || pd?.company || `${cat} Consultant`;
};

const getJobTitle = (pd: any, cat: string) => {
  const jobs = pd?.previous || [];
  const current = jobs.find((j: any) => !j.end) || jobs.sort((a: any, b: any) => new Date(b.end || 0).getTime() - new Date(a.end || 0).getTime())[0];
  return current?.title || pd?.title || `${cat} Expert`;
};



// Smart Ranking Algorithm
const calculateRelevanceScore = (profile: Profile): number => {
  let score = 0;
  score += (profile.rating || 0) * 10;
  score += Math.min((profile.reviews || 0), 50) * 0.4;
  if (profile.isVerified) score += 15;
  score += (profile.successRate || 0) * 0.15;
  if (profile.isFeatured) score += 5;
  return score;
};

// Main Component
export default function CoachSessionCard() {
  const { user } = useAuth(); // Auth context to gate API calls

  // --- React Query Implementation ---

  // 1. Fetch Categories (Public Access)
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/api/categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // 2. Fetch Experts (Public Access)
  const {
    data: expertsData,
    isLoading: isExpertsLoading,
    isError: isExpertsError,
    error: expertsError
  } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const res = await axios.get("/api/expert/verified");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // --- Data Processing ---

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Process Categories
  const categories = useMemo(() => {
    // Helper to extract array from various response shapes
    let cats: any[] = [];
    if (Array.isArray(categoriesData)) {
      cats = categoriesData;
    } else if (categoriesData?.success && Array.isArray(categoriesData?.data)) {
      cats = categoriesData.data;
    } else if (categoriesData?.data && Array.isArray(categoriesData.data)) {
      cats = categoriesData.data;
    }

    if (cats.length > 0) {
      return cats
        .filter((c: any) => c.status === "Active")
        .map((c: any) => ({
          id: c.name,
          name: c.name
        }));
    }

    // Fallback only if strictly no data yet (handled by loading mostly)
    return [];
  }, [categoriesData]);


  // Process Experts
  const allProfiles = useMemo<Profile[]>(() => {
    // Loading State: Return empty (skeletal handled by raw isLoading)
    if (isExpertsLoading && !expertsData) return [];

    let rawExperts: any[] = [];
    if (expertsData?.success && Array.isArray(expertsData?.data)) {
      rawExperts = expertsData.data;
    } else if (Array.isArray(expertsData)) {
      rawExperts = expertsData;
    }

    return rawExperts.map((expert: any) => {
      const cat = expert.personalInformation?.category || "IT";
      let exp = "";
      if (expert.professionalDetails?.totalExperience) exp = expert.professionalDetails.totalExperience === 1 ? "1 year" : `${expert.professionalDetails.totalExperience} years`;
      else exp = calculateProfessionalExperience(expert.professionalDetails) || (calculateAge(expert.personalInformation?.dob) - 22 > 0 ? `${calculateAge(expert.personalInformation?.dob) - 22}+ years` : "Fresher");

      const p: Profile = {
        id: expert._id || expert.userId,
        expertID: expert._id || expert.userId,
        name: expert.personalInformation?.userName || "Expert",
        role: getJobTitle(expert.professionalDetails, cat),
        industry: expert.professionalDetails?.industry || cat,
        experience: exp,
        skills: (() => {
          // 1. Try NEW expertSkills (Populated from backend)
          if (expert.expertSkills && expert.expertSkills.length > 0) {
            return expert.expertSkills
              .filter((s: any) => s.isEnabled && s.skillName) // Only enabled skills
              .map((s: any) => s.skillName);
          }
          // 2. Fallback to Legacy Skills
          const legacySkills = [...(expert.skillsAndExpertise?.domains || []), ...(expert.skillsAndExpertise?.tools || [])];
          return legacySkills;
        })(),
        languages: expert.skillsAndExpertise?.languages || [],
        rating: expert.metrics?.avgRating || 0,
        reviews: expert.metrics?.totalReviews || 0,
        price: expert.price ? `₹${expert.price}` : "₹500",
        category: cat as Category,
        avatar: getProfileImageUrl(expert.profileImage),
        location: expert.personalInformation?.city || "Online",
        mode: expert.skillsAndExpertise?.mode || "Online",
        responseTime: expert.metrics?.avgResponseTime ? `${Math.round(expert.metrics.avgResponseTime)}h` : "fast",
        successRate: expert.metrics?.totalSessions > 0 ? (expert.metrics.completedSessions / expert.metrics.totalSessions) * 100 : 100,
        isVerified: expert.status === "Active",
        isFeatured: Math.random() > 0.8,
        availability: expert.availability,
        company: getCurrentCompany(expert.professionalDetails, cat),
        totalAvailableSlots: countSlots(expert.availability)
      };
      return p;
    });
  }, [expertsData, isExpertsLoading]);


  const displayedProfiles = useMemo<Profile[]>(() => {
    // 1. Filter by Category (Matches Category OR Skills)
    let filtered = allProfiles;
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p =>
        p.category === selectedCategory ||
        p.skills.some(skill => skill.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerTerm) ||
        p.role.toLowerCase().includes(lowerTerm) ||
        p.company?.toLowerCase().includes(lowerTerm) ||
        p.skills.some(s => s.toLowerCase().includes(lowerTerm))
      );
    }

    // 3. Smart Sort
    return filtered.sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a));
  }, [allProfiles, selectedCategory, searchTerm]);

  // Determine Loading State
  // Guests & Users: Both see skeletons while fetching dynamic data
  const showLoading = isExpertsLoading;
  const showError = !!user && isExpertsError;

  return (
    <div className="space-y-6">
      {/* Header Card with Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[#004fcb]" />
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">FIND EXPERTS</h1>
            </div>
            <p className="text-sm text-gray-500 font-medium">Connect with verified professionals for your mock interview</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {displayedProfiles.slice(0, 3).map((p, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={p.avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.currentTarget.src = getProfileImageUrl(null); }} />
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-[#004fcb] ml-1">{displayedProfiles.length} EXPERTS</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-full border border-gray-300 shadow-md p-1 flex items-center transition-all focus-within:ring-2 focus-within:ring-[#004fcb] focus-within:border-[#004fcb]">
            <div className="pl-4 pr-2 text-gray-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, role, company or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow py-2 bg-transparent text-gray-900 placeholder:text-gray-500 font-medium outline-none text-sm w-full"
            />
            <button className="bg-[#004fcb] hover:bg-[#003bb5] text-white px-5 py-2 rounded-full font-bold transition-all shadow-sm whitespace-nowrap text-sm">
              Find Experts
            </button>
          </div>
        </div>
      </div>

      {/* Categories / Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
        <FilterScrollStrip
          items={categories}
          selectedItem={selectedCategory}
          onSelect={setSelectedCategory}
          isCategory={true}
        />
      </div>

      {/* Grid Content */}
      {showLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(n => <SkeletonCard key={n} />)}
        </div>
      ) : showError ? (
        <div className="text-center py-20 text-red-500 font-medium">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-red-200" />
          {expertsError instanceof Error ? expertsError.message : "Failed to load experts."}
        </div>
      ) : displayedProfiles.length === 0 ? (
        <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-[#004fcb]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No experts found</h3>
          <p className="text-gray-500 font-medium max-w-xs mx-auto">Try adjusting your filters or search terms.</p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
            className="mt-6 text-[#004fcb] font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedProfiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
