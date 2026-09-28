"use client";

import { useEffect, useRef, useState } from "react";
import ProductImage from "./ProductImage";
import {
  availabilityOf,
  fetchProductDetail,
  finalPrice,
  formatPrice,
} from "@/lib/products";
import type { Product, ProductDetail as Detail } from "@/lib/products";

type ProductDetailProps = {
  product: Product;
  onClose: () => void;
};

type DetailState = "loading" | "error" | "ready" | "local";

function definedOnly(product: Product): Partial<Product> {
  return Object.fromEntries(
    Object.entries(product).filter(([, value]) => value !== undefined),
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="stars" aria-label={`คะแนน ${rating} จาก 5`}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function ProductDetail({
  product,
  onClose,
}: ProductDetailProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<DetailState>("loading");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  function showDetail(data: Detail | null) {
    setDetail(data);
    setStatus(data ? "ready" : "local");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกรายละเอียดไม่สำเร็จ",
    );
    setStatus("error");
  }

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    fetchProductDetail(product.id).then(showDetail).catch(showError);
  }, [product.id]);

  const view = { ...detail, ...definedOnly(product) } as Product &
    Partial<Detail>;
  const images = detail?.images.length ? detail.images : [];
  const mainImage = images[imageIndex] ?? view.thumbnail;
  const hasDiscount = (view.discountPercentage ?? 0) > 0;

  return (
    <dialog
      ref={dialogRef}
      className="detail-dialog"
      onClose={onClose}
      aria-labelledby="detail-title"
    >
      <div className="detail-head">
        <h2 id="detail-title">{view.title}</h2>
        <button type="button" onClick={onClose} aria-label="ปิดรายละเอียด">
          ✕
        </button>
      </div>

      <div className="detail-body">
        <div className="gallery">
          <ProductImage
            key={mainImage}
            src={mainImage}
            alt={view.title}
            size={320}
            className="gallery-main"
          />
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  className={index === imageIndex ? "is-active" : undefined}
                  onClick={() => setImageIndex(index)}
                  aria-label={`รูปที่ ${index + 1}`}
                >
                  <ProductImage src={url} alt="" size={56} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <p className="detail-sub">
            {view.brand ?? "ไม่ระบุแบรนด์"} · {view.category}
          </p>

          <p className="detail-price">
            <strong>{formatPrice(finalPrice(view))}</strong>
            {hasDiscount && (
              <>
                <s>{formatPrice(view.price)}</s>
                <span className="discount">-{view.discountPercentage}%</span>
              </>
            )}
          </p>

          {view.rating !== undefined && (
            <p>
              <Stars rating={view.rating} /> {view.rating.toFixed(2)}
              {detail && ` (${detail.reviews.length} รีวิว)`}
            </p>
          )}

          <p>
            <span className="status-badge">{availabilityOf(view)}</span>{" "}
            คงเหลือ {view.stock} ชิ้น
            {view.minimumOrderQuantity !== undefined &&
              ` · สั่งขั้นต่ำ ${view.minimumOrderQuantity} ชิ้น`}
          </p>

          {view.description && (
            <p className="detail-desc">{view.description}</p>
          )}

          {view.tags && view.tags.length > 0 && (
            <ul className="tags">
              {view.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section aria-live="polite">
        {status === "loading" && (
          <p className="status-box">กำลังโหลดรายละเอียด</p>
        )}

        {status === "local" && (
          <p className="status-box">
            สินค้านี้เพิ่มในหน้าเว็บนี้
          </p>
        )}

        {status === "error" && (
          <p className="status-box error" role="alert">
            {errorMessage} แสดงเฉพาะข้อมูลจากตาราง
          </p>
        )}

        {status === "ready" && detail && (
          <>
            <h3>ข้อมูลจำเพาะ</h3>
            <dl className="specs">
              <dt>SKU</dt>
              <dd>{detail.sku}</dd>
              <dt>น้ำหนัก</dt>
              <dd>{detail.weight}</dd>
              <dt>ขนาด (กว้าง × สูง × ลึก)</dt>
              <dd>
                {detail.dimensions.width} × {detail.dimensions.height} ×{" "}
                {detail.dimensions.depth}
              </dd>
              <dt>การรับประกัน</dt>
              <dd>{detail.warrantyInformation}</dd>
              <dt>การจัดส่ง</dt>
              <dd>{detail.shippingInformation}</dd>
              <dt>การคืนสินค้า</dt>
              <dd>{detail.returnPolicy}</dd>
              <dt>บาร์โค้ด</dt>
              <dd>{detail.meta.barcode}</dd>
              <dt>อัปเดตล่าสุด</dt>
              <dd>{formatDate(detail.meta.updatedAt)}</dd>
            </dl>

            <h3>รีวิวจากผู้ซื้อ ({detail.reviews.length})</h3>
            {detail.reviews.length === 0 ? (
              <p className="status-box">ยังไม่มีรีวิว</p>
            ) : (
              <ul className="reviews">
                {detail.reviews.map((review, index) => (
                  <li key={`${review.reviewerName}-${index}`}>
                    <div className="review-head">
                      <Stars rating={review.rating} />
                      <strong>{review.reviewerName}</strong>
                      <time dateTime={review.date}>
                        {formatDate(review.date)}
                      </time>
                    </div>
                    <p>{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </dialog>
  );
}
