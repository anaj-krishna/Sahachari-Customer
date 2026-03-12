export interface ProductsQueryParams {
  search?: string;
  category?: string;
}

export interface Offer {
  type: "PERCENTAGE" | "FLAT";
  value: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  images: string[];
  quantity: number;
  price: string;
  category?: string;
  storeId: string;
  
  offers: Offer[];
  finalPrice?: number;
}

export type Store = string;
// Order Types
export interface DeliveryAddress {
  street: string;
  city: string;
  zipCode: string;
  phone: string;
  notes?: string;
}

export interface OrderItem {
  productId: string | Product;
  quantity: number;
  price: number;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  userId: string;
  storeId: string;
  checkoutId: string;
  deliveryBoyId?: string | null;
  items: OrderItem[];
  itemsSubtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  pickupAddress?: string;
  status: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface PlaceOrderResponse {
  checkoutId: string;
  ordersCount: number;
  totalAmount: number;
  orders: Order[];
}

export interface PlaceSingleOrderResponse {
  message: string;
  order: Order;
}
