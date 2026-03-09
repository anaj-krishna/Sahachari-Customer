export interface ProductsQueryParams {
  search?: string;
  category?: string;
}

export interface Offer {
  type: 'PERCENTAGE' | 'FLAT';
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
  storeName?: string;
  offers: Offer[];
  finalPrice?: number;
}

export interface Store {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  isVerified?: boolean;
  image?: string;
}