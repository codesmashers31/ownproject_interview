import { useState } from "react";
import { Save, Plus, Trash2, GraduationCap } from "lucide-react";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

interface Education {
    degree: string;
    institution: string;
    field: string;
    startYear: number;
    endYear: number | null;
    current: boolean;
}

interface EducationSectionProps {
    profileData: {
        education?: Education[];
    } | null;
    onUpdate: () => void;
}

export default function EducationSection({ profileData, onUpdate }: EducationSectionProps) {
    const { user } = useAuth();
    const [education, setEducation] = useState(profileData?.education || []);
    const [saving, setSaving] = useState(false);

    const addEducation = () => {
        setEducation([...education, {
            degree: "",
            institution: "",
            field: "",
            startYear: new Date().getFullYear(),
            endYear: null,
            current: false
        }]);
    };

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const updateEducation = (index: number, field: keyof Education, value: string | number | boolean | null) => {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value };
        setEducation(updated);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                "/api/user/profile/education",
                { education },
                { headers: { userid: user?.id } }
            );

            if (response.data.success) {
                toast.success("Education updated successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating education:", error);
            toast.error("Failed to update education");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[#002a6b]">Education</h2>
                    <p className="text-slate-500 mt-1">Add your educational background</p>
                </div>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-2 px-4 py-2 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors shadow-sm shadow-blue-200"
                >
                    <Plus className="w-4 h-4" />
                    Add Education
                </button>
            </div>

            {education.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-blue-100 bg-blue-50/50 rounded-lg">
                    <GraduationCap className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-slate-500">No education added yet</p>
                    <button
                        onClick={addEducation}
                        className="mt-4 text-[#004fcb] font-medium hover:underline"
                    >
                        Add your first education
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {education.map((edu, index) => (
                        <div key={index} className="border border-blue-100 bg-white rounded-lg p-6 relative shadow-sm">
                            <button
                                onClick={() => removeEducation(index)}
                                className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Degree *</label>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                                        placeholder="Bachelor of Science"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Institution *</label>
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                                        placeholder="Stanford University"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Field of Study</label>
                                    <input
                                        type="text"
                                        value={edu.field}
                                        onChange={(e) => updateEducation(index, "field", e.target.value)}
                                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                                        placeholder="Computer Science"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Year *</label>
                                    <input
                                        type="number"
                                        value={edu.startYear}
                                        onChange={(e) => updateEducation(index, "startYear", parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                                        min="1950"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">End Year</label>
                                    <input
                                        type="number"
                                        value={edu.endYear || ""}
                                        onChange={(e) => updateEducation(index, "endYear", e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                                        min="1950"
                                        max={new Date().getFullYear() + 10}
                                        disabled={edu.current}
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={edu.current}
                                            onChange={(e) => updateEducation(index, "current", e.target.checked)}
                                            className="w-4 h-4 text-[#004fcb] border-blue-200 rounded focus:ring-[#004fcb]"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Currently Studying</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
