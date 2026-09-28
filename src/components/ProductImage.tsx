"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src?: string;
  alt: string;
  size: number;
  className?: string;
};

export default function ProductImage({
  src,
  alt,
  size,
  className = "",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`product-image product-image-empty ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`ไม่มีรูป ${alt}`}
      >
        ไม่มีรูป
      </div>
    );
  }

  return (
    <Image
      className={`product-image ${className}`}
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      onError={() => setHasError(true)}
    />
  );
}
