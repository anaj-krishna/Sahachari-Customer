import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  getStores,
  getStoreProducts,
} from "../services/products.api";
import { ProductsQueryParams } from "../types/product";

export const useProducts = (params?: ProductsQueryParams) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
    
  });

export const useProduct = (id?: string) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

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
