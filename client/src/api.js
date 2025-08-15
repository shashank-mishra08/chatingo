// import axios from 'axios';

// const instance = axios.create({
//   withCredentials: true,
// });

// export default instance;

import axios from 'axios';

// Get API base URL from environment variables
const API_URL = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  baseURL: API_URL,         // backend URL (changes based on env)
  withCredentials: true,    // allow cookies/JWT
});

export default instance;
