export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export interface Offer {
  type: DiscountType;
  value: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface Product {
  id: string; // mapped from backend _id
  name: string;
  description?: string;
  images?: string[];
  quantity: number;
  price: string; // stored as string on backend
  category?: string;
  storeId?: string;
  offers?: Offer[];
  finalPrice?: number; // calculated by backend
}

export type Store = string; // backend returns distinct storeId array for stores

export interface ProductsQueryParams {
  search?: string;
  category?: string;
}