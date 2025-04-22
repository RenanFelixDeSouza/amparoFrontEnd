import axios from 'axios';

const api = axios.create({
    baseURL: process.env.amparobackend.railway.internal    + '/api', // http://amparoserver.test:8080/api
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Apenas configura o token de autenticação
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    console.log(token, 'token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(token);
    } else {
        console.log("Token não encontrado no localStorage");
    }
    return config;
});

// Nova instância para lidar com URLs estáticos (sem o prefixo /api)
export const staticApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // http://amparoserver.test:8080
    withCredentials: false, // Não precisa de credenciais para acessar imagens
});

export default api;