import axios from 'axios';

const api = axios.create({
    // Usar https:// antes da URL do backend
    baseURL: `https://${process.env.REACT_APP_API_URL}/api`,
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
    // Usar https:// antes da URL do backend
    baseURL: `https://${process.env.REACT_APP_API_URL}`,
    withCredentials: false,
});

export default api;