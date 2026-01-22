/**
 * User Profile Controller
 * Handles user profile CRUD operations and profile completion calculation
 */

import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getFileUrl } from "../middleware/upload.js";

/* ----------------- Profile Completion Calculator ------------------ */
function calculateProfileCompletion(user) {
    let score = 0;

    // Personal Info (20%)
    if (user.name) score += 5;
    if (user.personalInfo?.phone) score += 5;
    if (user.personalInfo?.city && user.personalInfo?.state) score += 5;
    if (user.personalInfo?.bio) score += 5;

    // Profile Image (10%)
    if (user.profileImage) score += 10;

    // Education (20%)
    if (user.education && user.education.length > 0) score += 20;

    // Experience (25%)
    if (user.experience && user.experience.length > 0) score += 25;

    // Skills (15%)
    if (user.skills?.technical && user.skills.technical.length > 0) score += 5;
    if (user.skills?.soft && user.skills.soft.length > 0) score += 5;
    if (user.skills?.languages && user.skills.languages.length > 0) score += 5;

    // Preferences (10%)
    if (user.preferences?.jobType) score += 3;
    if (user.preferences?.expectedSalary) score += 3;
    if (user.preferences?.noticePeriod) score += 2;
    if (user.preferences?.willingToRelocate !== undefined) score += 2;

    return Math.min(score, 100);
}

/* ----------------- Get User Profile ------------------ */
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.headers.userid;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Calculate profile completion
        const profileCompletion = calculateProfileCompletion(user);

        return res.json({
            success: true,
            data: {
                ...user.toObject(),
                profileCompletion
            }
        });
    } catch (err) {
        console.error("getUserProfile error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Personal Info ------------------ */
export const updatePersonalInfo = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { name, phone, dateOfBirth, gender, country, state, city, bio } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update name if provided
        if (name) user.name = name;

        // Update personal info
        user.personalInfo = {
            phone: phone || user.personalInfo?.phone,
            dateOfBirth: dateOfBirth || user.personalInfo?.dateOfBirth,
            gender: gender || user.personalInfo?.gender,
            country: country || user.personalInfo?.country,
            state: state || user.personalInfo?.state,
            city: city || user.personalInfo?.city,
            bio: bio || user.personalInfo?.bio
        };

        // Calculate and update profile completion
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Personal info updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updatePersonalInfo error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Education ------------------ */
export const updateEducation = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { education } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.education = education;
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Education updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updateEducation error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Experience ------------------ */
export const updateExperience = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { experience } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.experience = experience;
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Experience updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updateExperience error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Skills ------------------ */
export const updateSkills = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { technical, soft, languages } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.skills = {
            technical: technical || user.skills?.technical || [],
            soft: soft || user.skills?.soft || [],
            languages: languages || user.skills?.languages || []
        };

        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Skills updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updateSkills error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

/* ----------------- Update Preferences ------------------ */
export const updatePreferences = async (req, res) => {
    try {
        const userId = req.headers.userid;
        const { jobType, expectedSalary, noticePeriod, willingToRelocate } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.preferences = {
            jobType: jobType || user.preferences?.jobType,
            expectedSalary: expectedSalary || user.preferences?.expectedSalary,
            noticePeriod: noticePeriod || user.preferences?.noticePeriod,
            willingToRelocate: willingToRelocate !== undefined ? willingToRelocate : user.preferences?.willingToRelocate
        };

        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Preferences updated successfully",
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("updatePreferences error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};

// Multer setup removed - reusing middleware/uploadCloudinary.js in routes

export const saveProfileImage = async (req, res) => {
    try {
        const userId = req.headers.userid;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // (Optional) We could delete the old image from Cloudinary here using the public_id
        // For now, we just overwrite the URL in the database


        // Save new image URL
        user.profileImage = getFileUrl(req, req.file);
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        return res.json({
            success: true,
            message: "Profile image uploaded successfully",
            imageUrl: user.profileImage,
            profileCompletion: user.profileCompletion
        });
    } catch (err) {
        console.error("saveProfileImage error:", err);
        return res.status(500).json({ success: false, message: "Internal error" });
    }
};
