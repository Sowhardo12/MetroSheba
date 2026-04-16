import axios from 'axios';

// 1. Initialize with Credentials enabled for Cookies
export const API = axios.create({ 
  baseURL: 'http://localhost:5000/api',
  withCredentials: true   //permission for sending and receiving cookies cross origin
});

// 2. Request Interceptor (Stays mostly the same)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token'); // This is your Access Token
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 3. Response Interceptor (The "Magic" Auto-Refresh)
API.interceptors.response.use(
  (response) => response, // If the request succeeds, just return it
  async (error) => {
    const originalRequest = error.config;
    console.log("Interceptor caught error:", error.response?.status);
    // If error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call the refresh endpoint to get a new Access Token
        const { data } = await axios.post(
          'http://localhost:5000/api/auth/refresh', 
          {}, 
          { withCredentials: true }
        );

        // Update local storage with the NEW Access Token
        localStorage.setItem('token', data.accessToken);

        // Update the header of the original failed request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Retry the original request and return its result
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired), log out the user
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// --- API Methods ---
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchStations = () => API.get('/stations');
export const sendChat = (message) => API.post('/ai/chat', { message });

// Add this for manual logout if needed
export const logout = () => API.post('/auth/logout');




// export const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// API.interceptors.request.use((req) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     req.headers.Authorization = `Bearer ${token}`;
//   }
//   return req;
// });


// export const login = (formData) => API.post('/auth/login', formData);
// export const register = (formData) => API.post('/auth/register', formData);
// export const fetchStations = () => API.get('/stations');
// export const sendChat = (message) => API.post('/ai/chat', { message });


