import { api } from "./api";

export const addToCart = (dto: {
  productId: string;
  quantity: number;
}) => api.post("/customer/cart", dto).then(r => r.data);

export const placeSingleOrder = (dto: {
  productId: string;
  quantity: number;
  deliveryAddress: any;
}) =>
  api.post("/customer/single-order", dto).then(r => r.data);
