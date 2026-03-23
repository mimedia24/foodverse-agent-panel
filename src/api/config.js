import axios from "axios";

const MODE_TYPE = {
    PRODUCTION: 'PRODUCTION',
    DEVELOPEMENT: 'DEVELOPEMENT'
}
const currentMode = 'PRODUCTION'

const apiUri = currentMode === 'PRODUCTION' ? 'https://api.foodversedelivery.com/api' : 'http://localhost:3000/api'
const version = 'v3'


const api = axios.create({
    baseURL: apiUri + `/${version}`,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    }
})


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.AccessToken = `${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


export default api;