import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/products.api";

export function useServices() {
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["services"],
    queryFn: () => getProducts({ category: "Service" }),
  });

  const parseNumber = (v: any) => {
    if (v == null) return 0;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
    const cleaned = parseFloat(String(v).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(cleaned) ? cleaned : 0;
  };

  return {
    products: products || [],
    isLoading,
    refetch,
    parseNumber,
  };
}