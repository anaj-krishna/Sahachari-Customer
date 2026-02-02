import { useQuery } from "@tanstack/react-query";
import {
  getProduct,
  getProducts,
  getStoreProducts,
  getStores,
} from "../services/products.api";
import { useAuthStore } from "../store/auth.store";
import { ProductsQueryParams } from "../types/product";

export const useProducts = (params?: ProductsQueryParams) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });

export const useProduct = (id?: string) => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    // only fetch product details when we have an id AND a token
    enabled: !!id && Boolean(token),
    // surface errors to UI immediately
    retry: false,
  });
};

export const useStores = () =>
  useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
  });

export const useStoreProducts = (storeId?: string) =>
  useQuery({
    queryKey: ["storeProducts", storeId],
    queryFn: () => getStoreProducts(storeId!),
    enabled: !!storeId,
  });
