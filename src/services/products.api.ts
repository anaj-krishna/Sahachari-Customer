import { api } from './api';
import { Product, Store, ProductsQueryParams } from '../types/product';

function mapProduct(raw: any): Product {
  return {
    id: raw._id?.toString() ?? raw.id?.toString(),
    name: raw.name,
    description: raw.description,
    images: raw.images || [],
    quantity: typeof raw.quantity === 'number' ? raw.quantity : Number(raw.quantity || 0),
    price: raw.price,
    category: raw.category,
    storeId: raw.storeId?.toString?.() ?? raw.storeId,
    offers: raw.offers || [],
    finalPrice: typeof raw.finalPrice === 'number' ? raw.finalPrice : raw.finalPrice ? Number(raw.finalPrice) : undefined,
  };
}
    
export const getProducts = (params?: ProductsQueryParams): Promise<Product[]> =>
  api.get<any[]>('/customer/products', { params }).then((r) => r.data.map(mapProduct));

export const getProduct = (id: string): Promise<Product> =>
  api.get<any>(`/customer/products/${id}`).then((r) => mapProduct(r.data));

export const getStores = (): Promise<Store[]> =>
  api.get<string[]>('/customer/stores').then((r) => r.data.map((s) => s.toString()));

export const getStoreProducts = (storeId: string): Promise<Product[]> =>
  api.get<any[]>(`/customer/stores/${storeId}/products`).then((r) => r.data.map(mapProduct));