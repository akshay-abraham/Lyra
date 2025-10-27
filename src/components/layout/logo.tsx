// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Logo Component (`logo.tsx`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file defines a very simple, reusable UI component that renders the Lyra logo.
 * The logo is defined as an SVG (Scalable Vector Graphic), which allows it to scale
 * to any size without losing quality. This component can be imported and used anywhere
 * in the application to display a consistent brand logo.
 *
 * C-like Analogy:
 * Think of this as a small, self-contained C function that prints a specific,
 * pre-defined ASCII art logo to the console.
 *
 * ```c
 * void print_logo() {
 *   printf("   *   \n");
 *   printf(" * * * \n");
 *   printf("   *   \n");
 * }
 * ```
 * In this case, instead of ASCII art, it returns an SVG element for rendering in a web browser.
 * It's a "stateless" or "pure" component, meaning it doesn't have any internal variables
 * that change. It always renders the same thing every time it's called.
 */

/**
 * Renders the Lyra logo as an SVG element.
 *
 * @returns {JSX.Element} The SVG logo component.
 *
 * C-like Explanation: `function Logo() -> returns JSX_Element`
 *
 * This function takes no arguments (props) and returns a JSX element representing
 * the SVG logo. The `className="text-primary"` is a Tailwind CSS class that makes
 * the logo's color inherit from the `--primary` CSS variable defined in `globals.css`.
 * The `stroke="currentColor"` property within the SVG means the lines of the SVG
 * will take on the color of the parent element's text color, which we've set to be
 * the primary theme color. This makes the logo's color theme-aware.
 */
export function Logo() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-primary'
    >
      <path
        d='M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M4.5 4.5L7 7'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.5 4.5L17 7'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M4.5 19.5L7 17'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M19.5 19.5L17 17'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
