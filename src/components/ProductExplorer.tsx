"use client";

import { useEffect, useState } from "react";
import ProductDetail from "./ProductDetail";
import ProductForm from "./ProductForm";
import ProductImage from "./ProductImage";
import ProductSearchForm from "./ProductSearchForm";
import {
  availabilityOf,
  defaultQuery,
  fetchProducts,
  finalPrice,
  formatPrice,
  getFallbackProducts,
} from "@/lib/products";
import type {
  Product,
  ProductDraft,
  ProductList,
  SearchQuery,
} from "@/lib/products";

type LoadState = "loading" | "error" | "ready";

const statusClass: Record<string, string> = {
  "In Stock": "in-stock",
  "Low Stock": "low-stock",
  "Out of Stock": "out-of-stock",
};

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastQuery, setLastQuery] = useState<SearchQuery>(defaultQuery);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
  }, []);

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ",
    );
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");
    setLastQuery(query);
    setEditingId(null);
    setViewingId(null);

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  function loadFallback() {
    try {
      showResult(getFallbackProducts(lastQuery));
    } catch (error) {
      showError(error);
    }
  }

  function saveProduct(draft: ProductDraft) {
    if (editingId === null) {
      setProducts([...products, { ...draft, id: Date.now() }]);
      return;
    }

    setProducts(
      products.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...draft,
              id: editingId,
              availabilityStatus:
                draft.stock === item.stock
                  ? item.availabilityStatus
                  : undefined,
            }
          : item,
      ),
    );
    setEditingId(null);
  }

  function removeProduct(id: number) {
    setProducts(products.filter((item) => item.id !== id));

    if (editingId === id) {
      setEditingId(null);
    }
    if (viewingId === id) {
      setViewingId(null);
    }
  }

  const editingProduct =
    products.find((item) => item.id === editingId) ?? null;
  const viewingProduct =
    products.find((item) => item.id === viewingId) ?? null;

  return (
    <main className="page">
      <h1>จัดการสินค้า</h1>

      <div className="toolbar">
        <button
          type="button"
          onClick={() => loadProducts(defaultQuery)}
          disabled={status === "loading"}
        >
          {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูลใหม่"}
        </button>
      </div>

      <div className="forms">
        <ProductSearchForm onSearch={loadProducts} />

        <ProductForm
          key={editingId ?? "new"}
          editing={editingProduct}
          onSave={saveProduct}
          onCancel={() => setEditingId(null)}
        />
      </div>

      <section aria-live="polite" className="results">
        {status === "loading" && (
          <p className="status-box">กำลังโหลดข้อมูล</p>
        )}

        {status === "error" && (
          <div className="status-box error">
            <p role="alert">{errorMessage}</p>
            <button type="button" onClick={loadFallback}>
              ใช้ข้อมูลสำรอง
            </button>
          </div>
        )}

        {status === "ready" && products.length === 0 && (
          <p className="status-box">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        )}

        {status === "ready" && products.length > 0 && (
          <div className="table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>รูป</th>
                  <th>ชื่อสินค้า</th>
                  <th>ราคา</th>
                  <th>คงเหลือ</th>
                  <th>คะแนน</th>
                  <th>หมวดหมู่</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const availability = availabilityOf(item);
                  const hasDiscount = (item.discountPercentage ?? 0) > 0;

                  return (
                    <tr
                      key={item.id}
                      className={
                        item.id === editingId ? "is-editing" : undefined
                      }
                    >
                      <td>
                        <ProductImage
                          src={item.thumbnail}
                          alt={item.title}
                          size={48}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setViewingId(item.id)}
                        >
                          {item.title}
                        </button>
                        {item.brand && (
                          <span className="muted">{item.brand}</span>
                        )}
                      </td>
                      <td>
                        <strong>{formatPrice(finalPrice(item))}</strong>
                        {hasDiscount && (
                          <span className="muted">
                            <s>{formatPrice(item.price)}</s> -
                            {item.discountPercentage}%
                          </span>
                        )}
                      </td>
                      <td>
                        {item.stock}
                        <span
                          className={`status-badge ${statusClass[availability] ?? ""}`}
                        >
                          {availability}
                        </span>
                      </td>
                      <td>
                        {item.rating !== undefined
                          ? `★ ${item.rating.toFixed(1)}`
                          : "-"}
                      </td>
                      <td>{item.category}</td>
                      <td className="row-actions">
                        <button
                          type="button"
                          onClick={() => setViewingId(item.id)}
                        >
                          ดู
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(item.id)}
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => removeProduct(item.id)}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {viewingProduct && (
        <ProductDetail
          key={viewingProduct.id}
          product={viewingProduct}
          onClose={() => setViewingId(null)}
        />
      )}
    </main>
  );
}
