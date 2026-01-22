import express from 'express';
import * as meetingController from '../controllers/meetingController.js';

const router = express.Router();

router.post('/join', meetingController.joinMeeting);
router.post('/end', meetingController.endMeeting);

export default router;
