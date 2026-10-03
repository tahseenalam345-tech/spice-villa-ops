'use client';

/**
 * OrderKar brand mark — the "O" ring with a QR-style finder dot,
 * restyled for the KoDriftDev design language: ink tile, blue ring.
 */
export default function BrandMark({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="OrderKar"
    >
      <rect x="2" y="2" width="44" height="44" rx="13" fill="#0F172A" />
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="13"
        fill="none"
        stroke="#006EF5"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <circle cx="21.5" cy="24.5" r="10.5" fill="none" stroke="#006EF5" strokeWidth="5.5" />
      <rect x="31.5" y="11.5" width="7.5" height="7.5" rx="2" fill="#F4F6F9" />
      <rect x="33.5" y="32.5" width="5" height="5" rx="1.5" fill="#DE6A50" opacity="0.95" />
    </svg>
  );
}
