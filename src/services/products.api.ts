import { Product, ProductsQueryParams, Store } from "../types/product";
import { api } from "./api";

const S3_BASE =
  (process.env.EXPO_PUBLIC_S3_BASE_URL || "").replace(/\/$/, "");

function normalizeId(value: any): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid;
    if (typeof value._id === "string") return value._id;
    if (typeof value.id === "string") return value.id;
    if (value._id && typeof value._id === "object" && value._id.$oid) {
      return String(value._id.$oid);
    }
  }

  const asString = value?.toString?.();
  return asString && asString !== "[object Object]" ? asString : "";
}

function normalizeImage(img: any): string | null {
  if (!img) return null;

  // Prefer configured S3 base; otherwise fall back to API base URL so relative keys become absolute
  const base = S3_BASE || (api.defaults?.baseURL || "").replace(/\/$/, "");

  if (typeof img === "string") {
    if (img.startsWith("http")) return img;
    if (!base) return null;
    return `${base}/${img.replace(/^\/+/, "")}`;
  }

  if (typeof img === "object") {
    const key = img.key || img.path || img.url;
    if (!key) return null;
    if (key.startsWith("http")) return key;
    if (!base) return null;
    return `${base}/${String(key).replace(/^\/+/, "")}`;
  }

  return null;
}

function mapProduct(raw: any): Product {
  const rawStoreId = raw?.storeId?._id ?? raw?.storeId?.id ?? raw?.storeId;
  const resolvedStoreName =
    raw?.storeId?.name ??
    raw?.store?.name ??
    raw?.storekeeper?.name ??
    raw?.storekeeperName ??
    raw?.user?.name ??
    raw?.nameOfStore ??
    raw?.storeName;

  return {
    id: raw._id?.toString() ?? raw.id?.toString(),
    name: raw.name,
    description: raw.description,

    images: Array.isArray(raw.images)
      ? raw.images.map(normalizeImage).filter(Boolean) as string[]
      : [],

    quantity: Number(raw.quantity || 0),
    price: String(raw.price ?? 0),
    category: raw.category,
    storeId: normalizeId(rawStoreId),
    storeName: resolvedStoreName,
    offers: raw.offers || [],
    finalPrice:
      typeof raw.finalPrice === "number"
        ? raw.finalPrice
        : raw.finalPrice
        ? Number(raw.finalPrice)
        : undefined,
  };
}

function mapStore(raw: any): Store {
  if (typeof raw === "string") {
    return { id: raw };
  }

  const resolvedStoreName =
    raw?.name ??
    raw?.storeName ??
    raw?.storekeeperName ??
    raw?.user?.name ??
    raw?.storekeeper?.name;

  const resolvedStoreImage =
    normalizeImage(
      raw?.image ??
        raw?.profileImage ??
        raw?.avatar ??
        raw?.logo ??
        raw?.storekeeper?.image ??
        raw?.storekeeper?.profileImage ??
        raw?.user?.image,
    ) ?? undefined;

  return {
    id: normalizeId(raw?.id ?? raw?._id ?? raw?.storeId),
    name: resolvedStoreName,
    email: raw?.email,
    status: raw?.status,
    isVerified: raw?.isVerified,
    image: resolvedStoreImage,
  };
}

export const getProducts = (params?: ProductsQueryParams): Promise<Product[]> =>
  api
    .get<any[]>("/customer/products", { params })
    .then(r => r.data.map(mapProduct));

export const getProduct = (id: string): Promise<Product> =>
  api.get<any>(`/customer/products/${id}`).then(r => mapProduct(r.data));

export const getStores = (): Promise<Store[]> =>
  api.get<any[]>("/customer/stores").then(r => r.data.map(mapStore));

export const getStoreProducts = (storeId: string): Promise<Product[]> =>
  api
    .get<any[]>(`/customer/stores/${storeId}/products`)
    .then(r => r.data.map(mapProduct));
