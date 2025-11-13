// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Login Redirect Page (`/login`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file's sole purpose is to permanently redirect any traffic from the old
 * `/login` URL to the new home page (`/`). This ensures that any old bookmarks
 * or links continue to work seamlessly after the route restructuring.
 */
import { redirect } from 'next/navigation';

export default function LoginPage() {
  // `redirect` is a server-side function from Next.js that issues a 308 permanent redirect.
  redirect('/');
}
