import api from "./api";

export const getPurchaseOrderById = async (id) => {
  const res = await api.get(`/api/purchase/${id}`);
  return res.data;
};

export const createPurchaseOrder = async (data) => {
  const res = await api.post("/api/purchase", data);
  return res.data;
};

export const updatePurchaseOrder = async (id, data) => {
  const res = await api.put(`/api/purchase/${id}`, data);
  return res.data;
};

export const confirmPurchaseOrder = async (id) => {
  const res = await api.patch(`/api/purchase/${id}/confirm`);
  return res.data;
};

export const receivePurchaseOrder = async (id) => {
  const res = await api.patch(`/api/purchase/${id}/receive`);
  return res.data;
};