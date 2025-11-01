// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Logo Component (`logo.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines a simple, reusable UI component that renders the Lyra logo
 * from an image file. Using the Next.js `Image` component provides automatic
 * optimization, such as converting the image to modern formats like WebP.
 *
 * C-like Analogy:
 * Think of this as a utility function that knows how to load and display a specific
 * image asset. It abstracts away the details of image rendering.
 *
 * It's a "stateless" or "pure" component, meaning it doesn't have any internal variables
 * that change. It always renders the same thing every time it's called.
 */
import Image from 'next/image';

/**
 * Renders the Lyra logo using the Next.js Image component.
 *
 * @returns {JSX.Element} The Image component configured for the logo.
 */
export function Logo() {
  return <Image src='/logo.webp' alt='Lyra Logo' width={32} height={32} />;
}
