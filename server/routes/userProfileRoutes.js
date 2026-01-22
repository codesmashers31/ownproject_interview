/**
 * User Profile Routes
 */

import express from "express";
import {
    getUserProfile,
    updatePersonalInfo,
    updateEducation,
    updateExperience,
    updateSkills,
    updatePreferences,
    saveProfileImage
} from "../controllers/userProfileController.js";
import { uploadUserProfile } from "../middleware/upload.js";

const router = express.Router();

// Get user profile
router.get("/profile", getUserProfile);

// Update personal info
router.put("/profile/personal", updatePersonalInfo);

// Update education
router.put("/profile/education", updateEducation);

// Update experience
router.put("/profile/experience", updateExperience);

// Update skills
router.put("/profile/skills", updateSkills);

// Update preferences
router.put("/profile/preferences", updatePreferences);

// Upload profile image
router.post("/profile/image", uploadUserProfile.single("profileImage"), saveProfileImage);

export default router;
