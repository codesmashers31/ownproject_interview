import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }


        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Razorpay order',
            error: error.message,
        });
    }
};

import * as sessionService from '../services/sessionService.js';

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails, user } = req.body;

        let isVerified = false;

        // Bypass for dummy simulation
        if (razorpay_payment_id.startsWith('dummy_')) {
            isVerified = true;
        } else {
            const sign = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
                .update(sign.toString())
                .digest('hex');

            if (razorpay_signature === expectedSign) {
                isVerified = true;
            }
        }

        if (isVerified) {
            // Create Session Context
            if (bookingDetails) {
                const startTime = new Date(bookingDetails.startTime);
                const endTime = new Date(bookingDetails.endTime);

                // Generate a Session ID similar to sessionController
                const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                const sessionData = {
                    sessionId,
                    expertId: bookingDetails.expertId,
                    candidateId: bookingDetails.candidateId,
                    startTime,
                    endTime,
                    topics: bookingDetails.topics || ["General Mock Interview"],
                    price: bookingDetails.price,
                    status: 'confirmed', // Paid = Confirmed
                    duration: bookingDetails.duration || 60,
                    notes: bookingDetails.notes || ""
                };

                const session = await sessionService.createSession(sessionData);

                return res.status(200).json({
                    success: true,
                    message: 'Payment verified and session created successfully',
                    data: session,
                    sessionId: session.sessionId
                });
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully (No booking details provided)',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature sent!',
            });
        }
    } catch (error) {
        console.error('Razorpay Verify Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message,
        });
    }
};
