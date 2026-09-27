"use client";

// 1  import ทั้งหมด
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ORDER_OPTIONS,
  SORT_FIELDS,
  SearchQuerySchema,
  defaultQuery,
} from "@/lib/products";
import type { SearchQuery } from "@/lib/products";

type ProductSearchFormProps = {
  onSearch: (query: SearchQuery) => Promise<void>;
};

const SORT_LABELS: Record<SearchQuery["sortBy"], string> = {
  title: "ชื่อสินค้า",
  price: "ราคา",
  stock: "คงเหลือ",
  rating: "คะแนน",
};

// ชื่อทิศทางการเรียง (order_by)
const ORDER_LABELS: Record<SearchQuery["order"], string> = {
  asc: "น้อยไปมาก a-z",
  desc: "มากไปน้อย z-a",
};

export default function ProductSearchForm({
  onSearch,
}: ProductSearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SearchQuery>({
    resolver: zodResolver(SearchQuerySchema),
    mode: "onTouched",
    defaultValues: defaultQuery,
  });

  return (
    <form
      className="panel search-form"
      onSubmit={handleSubmit(onSearch)}
      noValidate
    >
      <h2>ค้นหาสินค้า</h2>

      <div className="field">
        <label htmlFor="q">คำค้น</label>
        <input id="q" {...register("q")} placeholder="phone" />
      </div>

      <div className="field">
        <label htmlFor="limit">จำนวนรายการ</label>
        <input
          id="limit"
          type="number"
          required
          {...register("limit", { valueAsNumber: true })}
          aria-invalid={!!errors.limit}
          aria-describedby="limit-error"
        />
        <span id="limit-error" role="alert" className="field-error">
          {errors.limit?.message}
        </span>
      </div>

      <div className="field">
        <label htmlFor="sortBy">เรียงตาม</label>
        <select id="sortBy" {...register("sortBy")}>
          {SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {SORT_LABELS[field]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="order">ทิศทาง</label>
        <select id="order" {...register("order")}>
          {ORDER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {ORDER_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "กำลังค้นหา" : "ค้นหา"}
        </button>
      </div>
    </form>
  );
}
