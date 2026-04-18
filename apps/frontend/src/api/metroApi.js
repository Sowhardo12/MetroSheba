import axios from 'axios';

const baseURL= import.meta.env.VITE_API_URL ? 
`${import.meta.env.VITE_API_URL}/api` : 
'http://localhost:5000/api';
export const API = axios.create({ 
  baseURL, //baseURL:the link
  withCredentials: true   //permission for sending and receiving cookies cross origin
});

// when request about to leave from frontend
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token'); // This is your Access Token
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// when response is about to enter 
API.interceptors.response.use(
  (response) => response, // If the request succeeds, just return it
  async (error) => {
    const originalRequest = error.config;
    console.log("Interceptor caught error:", error.response?.status);
 
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // getting 401 -> calling refresh/ endpoint for new refresh token 
        // const { data } = await axios.post(
        //   'http://localhost:5000/api/auth/refresh', 
        //   {}, 
        //   { withCredentials: true }
        // );
        const { data } = await API.post('/auth/refresh',{},{withCredentials: true});

        localStorage.setItem('token', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Retry the original request
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

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchStations = () => API.get('/stations');
export const sendChat = (message) => API.post('/ai/chat', { message });

//for later
export const logout = () => API.post('/auth/logout');



