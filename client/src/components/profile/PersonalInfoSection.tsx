import { useState, useMemo, useEffect } from "react";
import { Save, Upload } from "lucide-react";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Country, State, City } from "country-state-city";
import { getProfileImageUrl } from "../../lib/imageUtils";

interface PersonalInfo {
    phone?: string;
    dateOfBirth?: string | Date;
    gender?: string;
    country?: string;
    state?: string;
    city?: string;
    bio?: string;
}



interface ProfileData {
    name?: string;
    email?: string; // Ensure email is in ProfileData interface
    profileImage?: string;
    personalInfo?: PersonalInfo;
}

interface PersonalInfoSectionProps {
    profileData: ProfileData | null;
    onUpdate: () => void;
}

export default function PersonalInfoSection({ profileData, onUpdate }: PersonalInfoSectionProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: profileData?.name || user?.name || "",
        email: profileData?.email || user?.email || "", // Add email to state
        phone: profileData?.personalInfo?.phone || "",
        dateOfBirth: profileData?.personalInfo?.dateOfBirth ? new Date(profileData.personalInfo.dateOfBirth).toISOString().split('T')[0] : "",
        gender: profileData?.personalInfo?.gender || "",
        country: profileData?.personalInfo?.country || "",
        state: profileData?.personalInfo?.state || "",
        city: profileData?.personalInfo?.city || "",
        bio: profileData?.personalInfo?.bio || ""
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Sync form data when profileData updates
    useEffect(() => {
        if (profileData) {
            setFormData({
                name: profileData.name || user?.name || "",
                email: profileData.email || user?.email || "", // Sync email
                phone: profileData.personalInfo?.phone || "",
                dateOfBirth: profileData.personalInfo?.dateOfBirth ? new Date(profileData.personalInfo.dateOfBirth).toISOString().split('T')[0] : "",
                gender: profileData.personalInfo?.gender || "",
                country: profileData.personalInfo?.country || "",
                state: profileData.personalInfo?.state || "",
                city: profileData.personalInfo?.city || "",
                bio: profileData.personalInfo?.bio || ""
            });
        }
    }, [profileData]);

    // Get all countries
    const countries = useMemo(() => {
        return Country.getAllCountries();
    }, []);

    // Get states based on selected country
    const states = useMemo(() => {
        if (!formData.country || formData.country === "Other") return [];
        const countryCode = countries.find(c => c.name === formData.country)?.isoCode;
        return countryCode ? State.getStatesOfCountry(countryCode) : [];
    }, [formData.country, countries]);

    // Get cities based on selected state
    const cities = useMemo(() => {
        if (!formData.country || !formData.state || formData.state === "Other") return [];
        const countryCode = countries.find(c => c.name === formData.country)?.isoCode;
        const stateCode = states.find(s => s.name === formData.state)?.isoCode;
        return countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : [];
    }, [formData.country, formData.state, countries, states]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "country") {
            setFormData(prev => ({
                ...prev,
                country: value,
                state: "", // Reset state
                city: ""   // Reset city
            }));
        } else if (name === "state") {
            setFormData(prev => ({
                ...prev,
                state: value,
                city: ""   // Reset city
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                "/api/user/profile/personal",
                formData,
                { headers: { userid: user?.id } }
            );

            if (response.data.success) {
                toast.success("Personal info updated successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating personal info:", error);
            toast.error("Failed to update personal info");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("profileImage", file);

            const response = await axios.post(
                "/api/user/profile/image",
                formData,
                {
                    headers: {
                        userid: user?.id,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (response.data.success) {
                toast.success("Profile image uploaded successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[#002a6b]">Personal Information</h2>
                <p className="text-slate-500 mt-1">Update your personal details and contact information</p>
            </div>

            {/* Profile Image Upload */}
            <div className="border-b border-blue-50 pb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Profile Image</label>
                <div className="flex items-center gap-4">
                    <img
                        src={getProfileImageUrl(profileData?.profileImage)}
                        alt="Profile"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-blue-100"
                        onError={(e) => {
                            e.currentTarget.src = getProfileImageUrl(null);
                        }}
                    />
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors shadow-sm shadow-blue-200">
                            <Upload className="w-4 h-4" />
                            {uploading ? "Uploading..." : "Upload New Photo"}
                        </div>
                    </label>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                        placeholder="Your full name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-100 text-slate-500 rounded-lg cursor-not-allowed"
                        placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                        placeholder="+91 98765 43210"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                    >
                        <option value="">Select Country</option>
                        {countries.map((c) => (
                            <option key={c.isoCode} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                        disabled={!formData.country}
                    >
                        <option value="">{formData.country ? "Select State" : "Select Country First"}</option>
                        {states.map((s) => (
                            <option key={s.isoCode} value={s.name}>
                                {s.name}
                            </option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                    <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                        disabled={!formData.state}
                    >
                        <option value="">{formData.state ? "Select City" : "Select State First"}</option>
                        {cities.map((c) => (
                            <option key={c.name} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                    placeholder="Tell us about yourself..."
                />
                <p className="text-sm text-slate-500 mt-1">{formData.bio.length}/500 characters</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-50">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors disabled:opacity-50 shadow-md shadow-blue-200"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
