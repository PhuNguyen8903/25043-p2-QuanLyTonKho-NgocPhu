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