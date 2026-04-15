import api from "./api";

export const fetchSales = async (params = {}) => {
  const { data } = await api.get("/sales", { params });
  return data;
};

export const createSale = async (payload) => {
  const { data } = await api.post("/sales", payload);
  return data;
};

export const finalizeSale = async (saleId) => {
  const { data } = await api.post(`/sales/${saleId}/finalize`);
  return data;
};
