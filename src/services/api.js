import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // http://amparoserver.test/api
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Apenas configura o token de autenticação
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(token);
    } else {
        console.log("Token não encontrado no localStorage");
    }
    return config;
});


export default api;