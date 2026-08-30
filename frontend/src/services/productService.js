import api from "./api";

export const getProducts = async () => {
    const res = await api.get("/api/product");
    return res.data;
};

export const getProductById = async (id) => {
    const res = await api.get(`/api/product/${id}`);
    return res.data;
};

export const createProduct = async (data) => {
    const res = await api.post("/api/product", data);
    return res.data;
};

export const updateProduct = async (id, data) => {
    const res = await api.put(`/api/product/${id}`, data);
    return res.data;
};

export const deleteProduct = async (id) => {
    const res = await api.delete(`/api/product/${id}`);
    return res.data;
};

export const searchProducts = async (search = "") => {
    const res = await api.get("/api/product/search", {
        params: {
            search,
        },
    });

    return res.data;
};