import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from "./ThemeContext";
import axios from 'axios'; // New import

// Set axios default baseURL globally
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4040';
axios.defaults.withCredentials = true; // Also set withCredentials globally

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
