import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4040', // Explicitly set baseURL
  withCredentials: true,
});

export default instance;
