// src/lib/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Importante: permite enviar y recibir cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;