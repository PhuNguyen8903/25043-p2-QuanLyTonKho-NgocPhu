import api from "./api";

export const getProducts = async (page = 1, limit = 10) => {
    const res = await api.get("/api/product", {
        params: {
            page,
            limit
        }
    });

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

export const searchProducts = async (
    search = "",
    page = 1,
    limit = 10
) => {
    const res = await api.get("/api/product/search", {
        params: {
            search,
            page,
            limit
        }
    });

    return res.data;
};