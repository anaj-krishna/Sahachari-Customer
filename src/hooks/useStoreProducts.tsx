import { useQuery } from "@tanstack/react-query";
import { getStoreProducts } from "../services/products.api";

// Hook to fetch products by store ID using the shared API client
export const useStoreProducts = (storeId: string | undefined) =>
  useQuery({
    queryKey: ["storeProducts", storeId],
    queryFn: () => getStoreProducts(storeId!),
    enabled: Boolean(storeId),
  });
