import { z } from "zod";
import fallbackData from "@/data/products-fallback.json";

// https://dummyjson.com/products/category-list
export const CATEGORIES = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
] as const;

const imageUrl = z.url({
  protocol: /^https?$/,
  error: "ลิงก์รูปต้องขึ้นต้นด้วย http:// หรือ https://",
});

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า"),
  price: z.number({ error: "กรุณากรอกราคา" }).min(0, "ราคาต้องไม่ติดลบ"),
  stock: z
    .number({ error: "กรุณากรอกจำนวนคงเหลือ" })
    .int("จำนวนคงเหลือต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนคงเหลือต้องไม่ติดลบ"),
  category: z.enum(CATEGORIES, { error: "กรุณาเลือกหมวดหมู่" }),

  brand: z.string().trim().optional(),
  description: z.string().trim().optional(),
  thumbnail: imageUrl.optional(),
  rating: z.number().min(0).max(5).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  availabilityStatus: z.string().optional(),
});

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductList = z.infer<typeof ProductListSchema>;

const DimensionsSchema = z.object({
  width: z.number(),
  height: z.number(),
  depth: z.number(),
});

const ReviewSchema = z.object({
  rating: z.number().min(0).max(5),
  comment: z.string(),
  date: z.iso.datetime(),
  reviewerName: z.string(),
});

const MetaSchema = z.object({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  barcode: z.string(),
});

export const ProductDetailSchema = ProductSchema.extend({
  description: z.string(),
  thumbnail: imageUrl,
  rating: z.number().min(0).max(5),
  discountPercentage: z.number().min(0).max(100),
  availabilityStatus: z.string(),
  tags: z.array(z.string()),
  sku: z.string(),
  weight: z.number(),
  dimensions: DimensionsSchema,
  warrantyInformation: z.string(),
  shippingInformation: z.string(),
  returnPolicy: z.string(),
  minimumOrderQuantity: z.number().int(),
  reviews: z.array(ReviewSchema),
  meta: MetaSchema,
  images: z.array(imageUrl),
});

export type ProductDetail = z.infer<typeof ProductDetailSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export const ProductDraftSchema = ProductSchema.omit({ id: true });
export type ProductDraft = z.infer<typeof ProductDraftSchema>;

// api 
const API_BASE = "https://dummyjson.com";

const LIST_FIELDS = [
  "title",
  "price",
  "stock",
  "category",
  "brand",
  "description",
  "thumbnail",
  "rating",
  "discountPercentage",
  "availabilityStatus",
].join(",");


export const SORT_FIELDS = ["title", "price", "stock", "rating"] as const;
export const ORDER_OPTIONS = ["asc", "desc"] as const;

export const SearchQuerySchema = z.object({
  q: z.string().trim(),
  limit: z
    .number({ error: "กรุณากรอกจำนวนรายการ" })
    .int("จำนวนรายการต้องเป็นจำนวนเต็ม")
    .min(1, "อย่างน้อย 1 รายการ")
    .max(30, "ไม่เกิน 30 รายการ"),
  sortBy: z.enum(SORT_FIELDS, { error: "กรุณาเลือกช่องที่ใช้เรียง" }),
  order: z.enum(ORDER_OPTIONS, { error: "กรุณาเลือกทิศทางการเรียง" }),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const defaultQuery: SearchQuery = {
  q: "",
  limit: 10,
  sortBy: "title",
  order: "asc",
};

export function buildProductUrl(query: SearchQuery): string {
  const params = new URLSearchParams();
  params.set("q", query.q);
  params.set("limit", String(query.limit));
  params.set("sortBy", query.sortBy);
  params.set("order", query.order);
  params.set("select", LIST_FIELDS);

  return `${API_BASE}/products/search?${params.toString()}`;
}

export async function fetchProducts(query: SearchQuery): Promise<ProductList> {
  const response = await fetch(buildProductUrl(query));

  if (!response.ok) {
    throw new Error(`เรียกข้อมูลไม่สำเร็จ สถานะ ${response.status}`);
  }

  const data = await response.json();
  const result = ProductListSchema.safeParse(data);

  if (!result.success) {
    throw new Error("รูปแบบข้อมูลที่ได้รับไม่ตรงกับที่กำหนดไว้");
  }

  return result.data;
}

export async function fetchProductDetail(
  id: number,
): Promise<ProductDetail | null> {
  const response = await fetch(`${API_BASE}/products/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`เรียกรายละเอียดไม่สำเร็จ สถานะ ${response.status}`);
  }

  const result = ProductDetailSchema.safeParse(await response.json());

  if (!result.success) {
    throw new Error("รูปแบบรายละเอียดสินค้าไม่ตรงกับที่กำหนดไว้");
  }

  return result.data;
}

export function finalPrice(product: Product): number {
  const discount = product.discountPercentage ?? 0;
  return Math.round(product.price * (100 - discount)) / 100;
}

// 80% of product stock 
export const MAX_PURCHASE_RATIO = 0.8;

export function purchaseLimit(product: Product): number {
  return Math.floor(product.stock * MAX_PURCHASE_RATIO);
}

export function availabilityOf(product: Product): string {
  if (product.availabilityStatus) {
    return product.availabilityStatus;
  }
  if (product.stock === 0) {
    return "Out of Stock";
  }
  return product.stock < 5 ? "Low Stock" : "In Stock";
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export function getFallbackProducts(query: SearchQuery): ProductList {
  const result = ProductListSchema.safeParse(fallbackData);

  if (!result.success) {
    throw new Error("ไฟล์ข้อมูลสำรองมีรูปแบบไม่ถูกต้อง");
  }

  const keyword = query.q.trim().toLowerCase();
  const searched = result.data.products
    .filter((item) => item.title.toLowerCase().includes(keyword))
    .sort((a, b) => {
      if (query.sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (query.sortBy === "rating") {
        return (a.rating ?? 0) - (b.rating ?? 0);
      }
      return a[query.sortBy] - b[query.sortBy];
    });

  const ordered = query.order === "desc" ? [...searched].reverse() : searched;
  const products = ordered.slice(0, query.limit);

  return {
    products,
    total: products.length,
    skip: 0,
    limit: query.limit,
  };
}
