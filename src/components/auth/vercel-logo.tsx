// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Reusable Vercel Logo Component (`vercel-logo.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This component encapsulates the SVG for the Vercel logo.
 */
export function VercelLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role='img'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      fill='currentColor'
      {...props}
    >
      <title>Vercel</title>
      <path d='m12 1.608 12 20.784H0Z' />
    </svg>
  );
}
