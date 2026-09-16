import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    
    withCredentials: true, // do sử dụng cookie session nên cần nếu kô sẽ ăn block by cookie
});

export default api;