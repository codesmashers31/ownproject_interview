import axios from 'axios';
import { API_BASE_URL } from '../config';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        // Check for 401 or specific "Invalid token" messages
        if (status === 401 || (message && message.includes("Invalid or expired token"))) {
            // Clear local storage (adjust keys as per your app)
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');

            // Redirect to signin if not already there
            if (!window.location.pathname.includes('/signin')) {
                window.location.href = '/signin';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
