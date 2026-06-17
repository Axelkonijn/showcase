import axios from 'axios';

// Gebruik de environment variable, of val terug op localhost voor lokale dev
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: baseURL, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;