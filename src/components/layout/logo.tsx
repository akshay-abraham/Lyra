// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview Logo Component (`logo.tsx`)
 *
 * C-like Analogy:
 * This file defines a very simple, reusable UI component. Think of it as a
 * small, self-contained C function that prints a specific, pre-defined ASCII art
 * to the console.
 *
 * `void printLogo() { ... }`
 *
 * In this case, instead of ASCII art, it returns an SVG (Scalable Vector Graphic)
 * which is a standard way to draw images and icons on the web. This component
 * can be imported and used anywhere in the application to display the Lyra logo.
 *
 * It's a "stateless" component, meaning it doesn't have any internal variables
 * that change. It always renders the same thing every time it's called.
 */

/**
 * C-like Explanation: `function Logo() -> returns JSX_Element`
 *
 * This is the main function for this component. It takes no arguments (props)
 * and returns a JSX element representing the SVG logo.
 *
 * The SVG code itself defines the shape, color, and stroke of the logo.
 * The `className="text-primary"` is a Tailwind CSS class that makes the logo's
 * color inherit from the `--primary` CSS variable defined in `globals.css`.
 * The `stroke="currentColor"` property within the SVG means the lines of the
 * SVG will take on the color of the parent element's text color, which we set
 * to be the primary theme color.
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
  )
}
