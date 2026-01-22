import Session from '../models/Session.js';
import User from '../models/User.js';

export const getSessionsForUser = async (userId, role) => {
    // Strict query based on role
    const query = role === 'expert' ? { expertId: userId } : { candidateId: userId };

    const mongoose = (await import('mongoose')).default;
    const Expert = (await import('../models/expertModel.js')).default;

    // 1. Fetch raw sessions
    const sessions = await Session.find({
        ...query,
        status: { $in: ['upcoming', 'confirmed', 'live', 'completed', 'cancelled'] }
    }).sort({ startTime: -1 }).lean();

    // 2. Enrich
    const enrichedSessions = await Promise.all(sessions.map(async (session) => {
        try {
            let expert = null;
            let candidate = null;
            const lookupId = session.expertId;

            // Fetch Expert Info
            if (mongoose.Types.ObjectId.isValid(lookupId)) {
                const oid = new mongoose.Types.ObjectId(lookupId);
                expert = await Expert.findOne({ userId: oid }).populate('userId');
                if (!expert) expert = await Expert.findById(oid).populate('userId');
                if (!expert) expert = await Expert.findOne({ userId: lookupId.toString() }).populate('userId');
            } else if (typeof lookupId === 'string' && lookupId.includes('@')) {
                const userByEmail = await User.findOne({ email: lookupId.toLowerCase() });
                if (userByEmail) {
                    expert = await Expert.findOne({ userId: userByEmail._id }).populate('userId');
                }
            }

            // Fetch Candidate Info
            if (mongoose.Types.ObjectId.isValid(session.candidateId)) {
                candidate = await User.findById(session.candidateId);
            } else if (typeof session.candidateId === 'string' && session.candidateId.includes('@')) {
                candidate = await User.findOne({ email: session.candidateId.toLowerCase() });
            }

            // Resilient Names
            let expertName = 'Unknown Expert';
            if (expert) {
                expertName = expert.personalInformation?.userName || expert.userId?.name || 'Expert';
            } else {
                // User fallback
                const u = await User.findById(lookupId).catch(() => null);
                if (u) {
                    expertName = u.name;
                } else if (typeof lookupId === 'string' && !mongoose.Types.ObjectId.isValid(lookupId)) {
                    expertName = lookupId;
                } else {
                    expertName = lookupId || 'Unknown Expert'; // Fallback to ID
                }
            }

            const candidateName = candidate?.name || (typeof session.candidateId === 'string' ? session.candidateId : 'Candidate');

            return {
                ...session,
                expertName,
                candidateName,
                expertDetails: {
                    name: expertName,
                    role: expert?.professionalDetails?.title || 'Expert',
                    company: expert?.professionalDetails?.company || 'N/A',
                    profileImage: expert?.profileImage || expert?.userId?.profileImage || null
                },
                candidateDetails: candidate ? {
                    name: candidateName,
                    email: candidate.email,
                    profileImage: candidate.profileImage
                } : null
            };
        } catch (err) {
            console.error(`Error enriching session ${session.sessionId}:`, err);
            return session;
        }
    }));

    return enrichedSessions;
};

export const createRestrictedTestSession = async (expertEmail, candidateEmail, customStartTime, customEndTime) => {
    const expert = await User.findOne({ email: expertEmail });
    if (!expert) throw new Error(`Expert not found: ${expertEmail}`);

    const candidate = await User.findOne({ email: candidateEmail });
    if (!candidate) throw new Error(`Candidate not found: ${candidateEmail}`);

    let nextStart;
    const now = new Date();

    if (customStartTime) {
        if (customStartTime === 'NOW') {
            nextStart = new Date(now.getTime() + 2 * 60 * 1000); // 2 mins
        } else {
            nextStart = new Date(customStartTime);
        }
    } else {
        nextStart = new Date(now);
        nextStart.setUTCHours(10, 0, 0, 0);
        if (nextStart <= now) nextStart.setDate(nextStart.getDate() + 1);
    }

    let endTime;
    if (customEndTime) {
        endTime = new Date(customEndTime);
    } else {
        endTime = new Date(nextStart.getTime() + 60 * 60 * 1000);
    }

    const sessionId = `test-restricted-${expert._id}-${candidate._id}`;
    let session = await Session.findOne({ sessionId });

    if (!session) {
        session = new Session({
            sessionId,
            expertId: expert._id.toString(),
            candidateId: candidate._id.toString(),
            startTime: nextStart,
            endTime: endTime,
            topics: ["Restricted Test", "Strict Auth"],
            status: "confirmed"
        });
        await session.save();
    } else {
        session.startTime = nextStart;
        session.endTime = endTime;
        session.status = "confirmed";
        await session.save();
    }

    return {
        session,
        expertId: expert._id,
        candidateId: candidate._id
    };
};

export const getSessionById = async (sessionId) => {
    return await Session.findOne({ sessionId });
};

export const createSession = async (sessionData) => {
    const session = new Session(sessionData);
    return await session.save();
};

export const getSessionsByExpertId = async (expertId) => {
    return await Session.find({ expertId });
};

export const getSessionsByCandidateId = async (candidateId) => {
    return await Session.find({ candidateId });
};

export const seedTestSession = async () => {
    const testSessionId = "test-session-001";
    const sharedExpertId = "kohsanar20@gmail.com";

    const now = new Date();
    const start9am = new Date(now);
    start9am.setHours(9, 0, 0, 0);
    const end10am = new Date(now);
    end10am.setHours(10, 0, 0, 0);

    let session = await Session.findOne({ sessionId: testSessionId });

    if (!session) {
        session = new Session({
            sessionId: testSessionId,
            expertId: sharedExpertId,
            candidateId: "candidate-456",
            startTime: start9am,
            endTime: end10am,
            topics: ["React", "System Design", "Unified Testing"],
            status: "confirmed"
        });
        await session.save();
    } else {
        session.expertId = sharedExpertId;
        session.startTime = start9am;
        session.endTime = end10am;
        session.status = "confirmed";
        await session.save();
    }

    const userSessionId = "test-session-kohsanar-extra";
    let userSession = await Session.findOne({ sessionId: userSessionId });

    if (!userSession) {
        userSession = new Session({
            sessionId: userSessionId,
            expertId: sharedExpertId,
            candidateId: "candidate-789",
            startTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 25),
            topics: ["Future Session"],
            status: "confirmed"
        });
        await userSession.save();
    }

    return [session, userSession];
};

export const getAllSessions = async () => {
    const Expert = (await import('../models/expertModel.js')).default;
    const User = (await import('../models/User.js')).default;
    const mongoose = (await import('mongoose')).default;

    const sessions = await Session.find().sort({ startTime: -1 }).lean();

    const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
            let expert = null;
            let candidate = null;
            const lookupId = session.expertId;

            if (mongoose.Types.ObjectId.isValid(lookupId)) {
                const oid = new mongoose.Types.ObjectId(lookupId);
                expert = await Expert.findOne({ userId: oid }).populate('userId');
                if (!expert) expert = await Expert.findById(oid).populate('userId');
                if (!expert) expert = await Expert.findOne({ userId: lookupId.toString() }).populate('userId');
            } else if (typeof lookupId === 'string' && lookupId.includes('@')) {
                const userByEmail = await User.findOne({ email: lookupId.toLowerCase() });
                if (userByEmail) {
                    expert = await Expert.findOne({ userId: userByEmail._id }).populate('userId');
                }
            }

            if (mongoose.Types.ObjectId.isValid(session.candidateId)) {
                candidate = await User.findById(session.candidateId);
            } else if (typeof session.candidateId === 'string' && session.candidateId.includes('@')) {
                candidate = await User.findOne({ email: session.candidateId.toLowerCase() });
            }

            let expertName = 'Unknown Expert';
            if (expert) {
                expertName = expert.personalInformation?.userName || expert.userId?.name || 'Expert';
            } else {
                const u = await User.findById(lookupId).catch(() => null);
                if (u) {
                    expertName = u.name;
                } else if (typeof lookupId === 'string' && !mongoose.Types.ObjectId.isValid(lookupId)) {
                    expertName = lookupId;
                } else {
                    expertName = lookupId || 'Unknown Expert';
                }
            }

            const candidateName = candidate?.name || (typeof session.candidateId === 'string' ? session.candidateId : 'Candidate');

            const candidateDetails = candidate ? {
                name: candidate.name,
                email: candidate.email,
                profileImage: candidate.profileImage,
                phone: candidate.phone
            } : null;

            return {
                ...session,
                expertName,
                candidateName,
                candidateDetails,
                topic: session.topics?.[0] || "General Consultation",
                status: session.status,
                amount: session.price,
                date: session.startTime,
                duration: session.duration || "N/A"
            };
        })
    );

    return enrichedSessions;
};
