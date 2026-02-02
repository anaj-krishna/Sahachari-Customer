import { api } from "./api";

export const addToCart = (dto: { productId: string; quantity: number }) =>
  api.post("/customer/cart", dto).then((r) => r.data);

export const placeSingleOrder = (dto: {
  productId: string;
  quantity: number;
  deliveryAddress: any;
}) => api.post("/customer/single-order", dto).then((r) => r.data);

export const getCart = () => api.get("/customer/cart").then((r) => r.data);
export const getOrders = () => api.get("/customer/orders").then((r) => r.data);
export const getOrderById = async (orderId: string) => {
  const response = await api.get(`/customer/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId: string) => {
  const response = await api.post(`/customer/orders/${orderId}/cancel`);
  return response.data;
};