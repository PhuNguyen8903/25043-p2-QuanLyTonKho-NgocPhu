import api from "./api";

export const getSuppliers = async () => {
    const res = await api.get("/api/supplier");
    return res.data;
};

export const getSupplierById = async (id) => {
    const res = await api.get(`/api/supplier/${id}`);
    return res.data;
};

export const createSupplier = async (data) => {
    const res = await api.post("/api/supplier", data);
    return res.data;
};

export const updateSupplier = async (id, data) => {
    const res = await api.put(`/api/supplier/${id}`, data);
    return res.data;
};

export const deleteSupplier = async (id) => {
    const res = await api.delete(`/api/supplier/${id}`);
    return res.data;
};