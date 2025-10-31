// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Site-wide Configuration (`site-config.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file serves as a centralized configuration store for static data used
 * across the entire site, especially on public-facing pages like the login and
 * about pages. It includes links, names, and technology details.
 *
 * C-like Analogy:
 * This is the equivalent of a `config.h` file for your application's static content,
 * defining constants that can be used in multiple places.
 *
 * ```c
 * #define GITHUB_URL "https://github.com/akshay-abraham/Lyra"
 * #define DEVELOPER_NAME "Akshay K. Rooben Abraham"
 * ```
 */

export const siteConfig = {
  github: 'https://github.com/akshay-abraham/Lyra',
  developer: {
    name: 'Akshay K. Rooben Abraham',
    url: 'https://akshayabraham.vercel.app/',
  },
  mentor: {
    name: 'Mr. Rishikesh Babu',
    email: 'cbrishikesh007@gmail.com',
  },
  technologies: [
    {
      name: 'Next.js',
      logo: '/tech/nextjs.svg',
    },
    {
      name: 'Firebase',
      logo: '/tech/firebase.svg',
    },
    {
      name: 'Genkit',
      logo: '/genkit.png',
    },
    {
      name: 'React',
      logo: '/tech/react.svg',
    },
    {
      name: 'Tailwind CSS',
      logo: '/tech/tailwind-css.svg',
    },
    {
      name: 'Vercel',
      logo: '/tech/vercel.svg',
    },
  ],
};
