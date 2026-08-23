import api from "./api";

export const getEmployees = async () => {
    const res = await api.get("/api/user/getusers");
    return res.data;
};