"use client";

// 1  import ทั้งหมด
import { useEffect, useState } from "react";
import ProductDetail from "./ProductDetail";
import ProductImage from "./ProductImage";
import ProductSearchForm from "./ProductSearchForm";
import {
  availabilityOf,
  defaultQuery,
  fetchProducts,
  finalPrice,
  formatPrice,
  getFallbackProducts,
  purchaseLimit,
} from "@/lib/products";
import type { Product, ProductList, SearchQuery } from "@/lib/products";

// 2  type ที่ใช้เฉพาะในไฟล์นี้
type LoadState = "loading" | "error" | "ready";

type CartLine = {
  product: Product;
  qty: number;
};

type PlacedOrder = {
  code: string;
  date: string;
  lines: CartLine[];
  total: number;
};

const statusClass: Record<string, string> = {
  "In Stock": "in-stock",
  "Low Stock": "low-stock",
  "Out of Stock": "out-of-stock",
};

const lineTotal = (line: CartLine) => finalPrice(line.product) * line.qty;

export default function UserShop() {
  // 3  State ทั้งหมดของ Component
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastQuery, setLastQuery] = useState<SearchQuery>(defaultQuery);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  // 4  useEffect  โหลดสินค้าครั้งเดียวตอนแสดงผลครั้งแรก
  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
  }, []);

  // 5  ฟังก์ชันจัดการเหตุการณ์
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

  async function search(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");
    setLastQuery(query);

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

  // เพิ่มลงตะกร้า ถ้ามีอยู่แล้วเพิ่มจำนวน แต่ไม่เกินเพดาน 80% ของสต็อก
  function addToCart(product: Product) {
    const limit = purchaseLimit(product);
    setOrder(null);
    setCart((prev) => {
      const found = prev.find((line) => line.product.id === product.id);
      if (found) {
        // ถึงเพดานแล้ว คงจำนวนเดิม (ปุ่มจะถูกปิดไว้อยู่แล้ว)
        return prev.map((line) =>
          line.product.id === product.id
            ? { ...line, qty: Math.min(line.qty + 1, limit) }
            : line,
        );
      }
      // สินค้าที่เพิ่มครั้งแรก เพดานต้องมากกว่า 0 ถึงจะใส่ได้
      if (limit < 1) {
        return prev;
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.product.id === id
            ? {
                ...line,
                qty: Math.min(
                  Math.max(line.qty + delta, 0),
                  purchaseLimit(line.product),
                ),
              }
            : line,
        )
        .filter((line) => line.qty > 0),
    );
  }

  function removeLine(id: number) {
    setCart((prev) => prev.filter((line) => line.product.id !== id));
  }

  function placeOrder() {
    if (cart.length === 0) {
      return;
    }
    setOrder({
      // code random
      code: `ORD-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toLocaleString("th-TH"),
      lines: cart,
      total: cart.reduce((sum, line) => sum + lineTotal(line), 0),
    });
    setCart([]);
  }

  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const cartTotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const qtyInCart = (id: number) =>
    cart.find((line) => line.product.id === id)?.qty ?? 0;
  const viewingProduct = products.find((item) => item.id === viewingId) ?? null;

  // 6  return ส่วนแสดงผล
  return (
    <main className="page shop">
      <h1>เลือกซื้อสินค้า</h1>

      <div className="shop-layout">
        {/* ---------- ฝั่งสินค้า ---------- */}
        <div className="shop-main">
          <ProductSearchForm onSearch={search} />

          <section aria-live="polite">
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
              <div className="shop-grid">
                {products.map((item) => {
                  const inCart = qtyInCart(item.id);
                  const limit = purchaseLimit(item); // เพดาน 80% ของสต็อก
                  const soldOut = item.stock === 0;
                  const tooLowStock = !soldOut && limit < 1; // สต็อกน้อยจนสั่งไม่ได้
                  const maxed = inCart >= limit; // ถึงเพดาน 80% แล้ว
                  const availability = availabilityOf(item);

                  return (
                    <article key={item.id} className="shop-card">
                      <button
                        type="button"
                        className="shop-thumb"
                        onClick={() => setViewingId(item.id)}
                        aria-label={`ดูรายละเอียด ${item.title}`}
                      >
                        <ProductImage
                          src={item.thumbnail}
                          alt={item.title}
                          size={160}
                        />
                      </button>

                      <h3>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setViewingId(item.id)}
                        >
                          {item.title}
                        </button>
                      </h3>

                      {item.brand && <p className="muted">{item.brand}</p>}

                      <p className="shop-price">
                        <strong>{formatPrice(finalPrice(item))}</strong>
                        {(item.discountPercentage ?? 0) > 0 && (
                          <s>{formatPrice(item.price)}</s>
                        )}
                      </p>

                      <p className="shop-meta">
                        {item.rating !== undefined && (
                          <span>★ {item.rating.toFixed(1)}</span>
                        )}
                        <span
                          className={`status-badge ${statusClass[availability] ?? ""}`}
                        >
                          {availability}
                        </span>
                      </p>

                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => addToCart(item)}
                        disabled={soldOut || tooLowStock || maxed}
                      >
                        {soldOut
                          ? "สินค้าหมด"
                          : tooLowStock
                            ? "สต็อกไม่พอสั่งซื้อ"
                            : maxed
                              ? `เพิ่มไม่ได้ (ครบ 80% ของสต็อก ${limit} ชิ้น)`
                              : inCart > 0
                                ? `เพิ่มลงตะกร้า (มี ${inCart})`
                                : "เพิ่มลงตะกร้า"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ---------- ฝั่งตะกร้า ---------- */}
        <aside className="cart">
          <div className="panel cart-panel">
            <h2>ตะกร้าสินค้า ({cartCount})</h2>

            {cart.length === 0 ? (
              <p className="cart-empty">ยังไม่มีสินค้าในตะกร้า</p>
            ) : (
              <>
                <ul className="cart-lines">
                  {cart.map((line) => (
                    <li key={line.product.id} className="cart-line">
                      <div className="cart-line-info">
                        <span className="cart-line-title">
                          {line.product.title}
                        </span>
                        <span className="muted">
                          {formatPrice(finalPrice(line.product))} × {line.qty}
                        </span>
                      </div>

                      <div className="qty-control">
                        <button
                          type="button"
                          onClick={() => changeQty(line.product.id, -1)}
                          aria-label="ลดจำนวน"
                        >
                          −
                        </button>
                        <span>{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(line.product.id, 1)}
                          disabled={line.qty >= purchaseLimit(line.product)}
                          aria-label="เพิ่มจำนวน"
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-line-total">
                        {formatPrice(lineTotal(line))}
                      </span>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => removeLine(line.product.id)}
                        aria-label={`ลบ ${line.product.title} ออกจากตะกร้า`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="cart-total">
                  <span>ยอดรวม</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>

                <button
                  type="button"
                  className="checkout-btn"
                  onClick={placeOrder}
                >
                  สั่งซื้อสินค้า
                </button>
              </>
            )}

            {order && (
              <div role="status">
                <h3>สั่งซื้อสำเร็จ</h3>
                <p>
                  เลขที่คำสั่งซื้อ <strong>{order.code}</strong>
                </p>
                <p className="muted">{order.date}</p>
                <ul>
                  {order.lines.map((line) => (
                    <li key={line.product.id}>
                      {line.product.title} × {line.qty} —{" "}
                      {formatPrice(lineTotal(line))}
                    </li>
                  ))}
                </ul>
                <p className="order-total">
                  รวมทั้งสิ้น {formatPrice(order.total)}
                </p>
                <p className="muted">
                  (สั่งปลอมนะอิอิ)
                </p>
                <button type="button" onClick={() => setOrder(null)}>
                  เลือกซื้อต่อ
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

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
