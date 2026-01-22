export const canJoinMeeting = (meeting, userId) => {

    return String(meeting.expertId) === String(userId) || String(meeting.candidateId) === String(userId);
};
