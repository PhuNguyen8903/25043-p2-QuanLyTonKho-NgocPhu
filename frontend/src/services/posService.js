import api from "./api";

export const searchProducts = async (search = "") => {
    const res = await api.get("/api/product/search", {
        params: {
            search,
        },
    });

    return res.data;
};

export const createSaleOrder = async (data) => {
    const res = await api.post("/api/pos/sale_order", data);

    return res.data;
};

export const getSaleOrders = async (page = 1, limit = 10, search = "") => {
    const res = await api.get("/api/pos", {
        params: {
            page,
            limit,
            search,
        },
    });

    return res.data;
};

export const getSaleOrderById = async (id) => {
    const res = await api.get(`/api/pos/${id}`);

    return res.data;
};