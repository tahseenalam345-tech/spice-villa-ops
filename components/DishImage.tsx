'use client';

import { useState } from 'react';

/**
 * Food photo with graceful degradation: if the URL is missing or fails to
 * load, renders a solid pine tile with the dish initial in saffron.
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
        className={`flex items-center justify-center bg-pine-soft ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="font-display text-4xl font-semibold text-saffron/70">
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
