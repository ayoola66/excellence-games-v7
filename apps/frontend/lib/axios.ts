import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance; 