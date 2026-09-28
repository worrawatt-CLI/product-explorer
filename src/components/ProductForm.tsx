"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductImage from "./ProductImage";
import {
  CATEGORIES,
  ProductDraftSchema,
  ProductSchema,
} from "@/lib/products";
import type { Product, ProductDraft } from "@/lib/products";

type ProductFormProps = {
  editing: Product | null;
  onSave: (draft: ProductDraft) => void;
  onCancel: () => void;
};

const optionalText = {
  setValueAs: (value: string) =>
    value.trim() === "" ? undefined : value.trim(),
};

export default function ProductForm({
  editing,
  onSave,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isValid },
  } = useForm<ProductDraft>({
    resolver: zodResolver(ProductDraftSchema),
    mode: "onTouched",
    defaultValues: editing
      ? {
          title: editing.title,
          price: editing.price,
          stock: editing.stock,
          category: editing.category,
          brand: editing.brand,
          thumbnail: editing.thumbnail,
          description: editing.description,
        }
      : { title: "", price: undefined, stock: undefined },
  });

  const thumbnail = useWatch({ control, name: "thumbnail" });
  const canPreview =
    !!thumbnail && ProductSchema.shape.thumbnail.safeParse(thumbnail).success;

  function saveProduct(values: ProductDraft) {
    onSave(values);
    reset();
  }

  return (
    <form
      className="panel product-form"
      onSubmit={handleSubmit(saveProduct)}
      noValidate
    >
      <h2>{editing ? `แก้ไขสินค้า #${editing.id}` : "เพิ่มสินค้าใหม่"}</h2>

      <div className="field">
        <label htmlFor="title">ชื่อสินค้า</label>
        <input
          id="title"
          required
          {...register("title")}
          aria-invalid={!!errors.title}
          aria-describedby="title-error"
        />
        <span id="title-error" role="alert" className="field-error">
          {errors.title?.message}
        </span>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="price">ราคา (USD)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            required
            {...register("price", { valueAsNumber: true })}
            aria-invalid={!!errors.price}
            aria-describedby="price-error"
          />
          <span id="price-error" role="alert" className="field-error">
            {errors.price?.message}
          </span>
        </div>

        <div className="field">
          <label htmlFor="stock">จำนวนคงเหลือ</label>
          <input
            id="stock"
            type="number"
            step="1"
            required
            {...register("stock", { valueAsNumber: true })}
            aria-invalid={!!errors.stock}
            aria-describedby="stock-error"
          />
          <span id="stock-error" role="alert" className="field-error">
            {errors.stock?.message}
          </span>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="category">หมวดหมู่</label>
          <select
            id="category"
            required
            {...register("category")}
            aria-invalid={!!errors.category}
            aria-describedby="category-error"
          >
            <option value="">กรุณาเลือกหมวดหมู่</option>
            {CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <span id="category-error" role="alert" className="field-error">
            {errors.category?.message}
          </span>
        </div>

        <div className="field">
          <label htmlFor="brand">แบรนด์ (ไม่บังคับ)</label>
          <input id="brand" {...register("brand", optionalText)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="thumbnail">ลิงก์รูปภาพ (ไม่บังคับ)</label>
        <input
          id="thumbnail"
          type="url"
          inputMode="url"
          placeholder="https://imagetest.com/..."
          {...register("thumbnail", optionalText)}
          aria-invalid={!!errors.thumbnail}
          aria-describedby="thumbnail-error"
        />
        <span id="thumbnail-error" role="alert" className="field-error">
          {errors.thumbnail?.message}
        </span>
        {canPreview && (
          <ProductImage
            key={thumbnail}
            src={thumbnail}
            alt="ตัวอย่างรูปที่กรอก"
            size={72}
          />
        )}
      </div>

      <div className="field">
        <label htmlFor="description">คำอธิบาย (ไม่บังคับ)</label>
        <textarea
          id="description"
          rows={3}
          {...register("description", optionalText)}
        />
      </div>

      <div className="actions">
        <button type="submit" disabled={!isDirty || !isValid}>
          {editing ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
        </button>

        {editing && (
          <button type="button" onClick={onCancel}>
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}
