import axios from 'axios';

const instance = axios.create({
  baseURL: 'chatingo-rx73.vercel.app',
  withCredentials: true,
});

export default instance;
