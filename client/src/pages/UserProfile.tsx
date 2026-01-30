import { useState } from "react";
import { User, Phone, MapPin, Calendar, Briefcase, Award, Settings2, Bookmark, FileText } from "lucide-react";
import axios from '../lib/axios';
import { useAuth } from "../context/AuthContext";
import Navigation from "../components/Navigation";
import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import EducationSection from "../components/profile/EducationSection";
import ExperienceSection from "../components/profile/ExperienceSection";
import CertificationsSection from "../components/profile/CertificationsSection";
import SkillsSection from "../components/profile/SkillsSection";
import PreferencesSection from "../components/profile/PreferencesSection";
import ResumePreview from "../components/profile/ResumePreview";
import { useQuery } from "@tanstack/react-query";
import { getProfileImageUrl } from "../lib/imageUtils";

interface ProfileData {
    name?: string;
    email?: string;
    profileImage?: string;
    profileCompletion?: number;
    personalInfo?: {
        phone?: string;
        city?: string;
        state?: string;
        dateOfBirth?: string;
        gender?: string;
        address?: string;
    };
    education?: any[];
    experience?: any[];
    certifications?: any[];
    skills?: {
        technical?: string[];
        soft?: string[];
        languages?: string[];
    };
    preferences?: any;
}

export default function UserProfile() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("personal");
    const [isResumeOpen, setIsResumeOpen] = useState(false);

    // Replace manual fetch/state with React Query to prevent flickering
    const { data: profileData, isLoading, refetch } = useQuery({
        queryKey: ["userProfile", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const response = await axios.get("/api/user/profile", {
                headers: { userid: user.id }
            });
            return response.data.success ? response.data.data : null;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // Cache data for 5 mins to prevent unnecessary fetches
    });

    const tabs = [
        { id: "personal", label: "Personal Info", icon: User },
        { id: "education", label: "Education", icon: Award },
        { id: "experience", label: "Experience", icon: Briefcase },
        { id: "certifications", label: "Certifications", icon: Award },
        { id: "skills", label: "Skills", icon: Settings2 },
        { id: "preferences", label: "Preferences", icon: Calendar }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#004fcb] border-t-transparent"></div>
                    <p className="text-slate-600 mt-4 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-blue-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-[#002a6b]">My Profile</h1>
                                <p className="text-slate-600 mt-1">Manage your personal information and preferences</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Profile Completion</p>
                                    <p className="text-2xl font-bold text-[#004fcb]">{profileData?.profileCompletion || 0}%</p>
                                </div>
                                <div className="w-16 h-16">
                                    <svg className="transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#E5E7EB"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#111827"
                                            strokeWidth="3"
                                            strokeDasharray={`${profileData?.profileCompletion || 0}, 100`}
                                            className="text-[#004fcb]"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                                {/* Profile Card */}
                                <div className="bg-gradient-to-br from-[#004fcb] to-[#002a6b] p-6 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="relative">
                                            <img
                                                src={getProfileImageUrl(profileData?.profileImage)}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                                                onError={(e) => {
                                                    e.currentTarget.src = getProfileImageUrl(null);
                                                }}
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                                        </div>
                                    </div>
                                    <h3 className="text-white font-bold text-lg">{profileData?.name}</h3>
                                    <p className="text-blue-100 text-sm mt-1">{profileData?.email}</p>
                                </div>

                                {/* Quick Info */}
                                <div className="p-6 space-y-4">
                                    {profileData?.personalInfo?.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="w-4 h-4 text-[#004fcb]" />
                                            <span className="text-slate-700">{profileData.personalInfo.phone}</span>
                                        </div>
                                    )}
                                    {profileData?.personalInfo?.city && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin className="w-4 h-4 text-[#004fcb]" />
                                            <span className="text-slate-700">
                                                {profileData.personalInfo.city}, {profileData.personalInfo.state}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="border-t border-blue-50 p-4">
                                    <nav className="space-y-1">
                                        {tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                                        ? "bg-blue-50 text-[#004fcb]"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-[#004fcb]"
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </nav>

                                    {/* Resume Generator Button */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <button
                                            onClick={() => setIsResumeOpen(true)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#004fcb] to-[#0065ff] hover:shadow-md transition-all group"
                                        >
                                            <FileText className="w-4 h-4 text-white/90 group-hover:scale-110 transition-transform" />
                                            Generate Resume
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                                {activeTab === "personal" && (
                                    <PersonalInfoSection profileData={profileData} onUpdate={refetch} />
                                )}
                                {activeTab === "education" && (
                                    <EducationSection profileData={profileData} onUpdate={refetch} />
                                )}
                                {activeTab === "experience" && (
                                    <ExperienceSection profileData={profileData} onUpdate={refetch} />
                                )}
                                {activeTab === "certifications" && (
                                    <CertificationsSection profileData={profileData} onUpdate={refetch} />
                                )}
                                {activeTab === "skills" && (
                                    <SkillsSection profileData={profileData} onUpdate={refetch} />
                                )}
                                {activeTab === "preferences" && (
                                    <PreferencesSection profileData={profileData} onUpdate={refetch} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resume Preview Modal */}
                <ResumePreview isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
            </div>
        </>
    );
}
