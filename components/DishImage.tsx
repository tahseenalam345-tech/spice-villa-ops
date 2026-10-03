'use client';

import { useState } from 'react';

/**
 * Food photo with graceful degradation: if the URL is missing or fails to
 * load, renders a styled gradient tile with the dish initial instead.
 */
export default function DishImage({
  src,
  alt,
  className = '',
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#3a2b12] via-[#6b4a1a] to-[#a06a24] ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="font-display text-4xl font-semibold text-[#E9A13B]/70">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
