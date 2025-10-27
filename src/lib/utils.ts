// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Utility Functions (`utils.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This is a utility file, similar to a `utils.h` or `helpers.c` in C.
 * It contains common, reusable functions that are used across different
 * parts of the application. Keeping them here prevents code duplication
 * and makes the main component files cleaner and more focused on their
 * specific logic.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function for conditionally combining CSS class names.
 * It merges Tailwind CSS classes intelligently, removing conflicts.
 *
 * @param {...ClassValue[]} inputs - A list of class values to be combined. These can be strings, objects, or arrays.
 * @returns {string} A single, merged string of CSS class names.
 *
 * C-like Explanation: `function cn(...inputs) -> returns string`
 *
 * This function is a helper for managing CSS class names in a clean way.
 * In web development, you often need to conditionally apply classes, for example:
 * `if (is_active) { class = "active"; } else { class = ""; }`
 *
 * This function, `cn` (short for "class names"), simplifies that process.
 *
 * How it works:
 * 1.  It takes any number of arguments: strings, objects, arrays.
 * 2.  The `clsx` library processes these inputs and combines them into a single class string.
 *     For example: `clsx('base', { 'active': true, 'disabled': false })` becomes `"base active"`.
 * 3.  `tailwind-merge` then intelligently merges these classes. It's smart
 *     about Tailwind CSS classes. For example, if you have `"p-2 p-4"`, it knows
 *     that `p-4` should override `p-2`, so the final result is just `"p-4"`. This
 *     prevents conflicting styles from being applied to an element.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates a "strength score" for a given password based on a set
 * of predefined criteria. Used in the registration form for real-time feedback.
 *
 * @param {string} password - The password string to evaluate.
 * @returns {number} A score from 0 to 100 representing the password's strength.
 *
 * C-like Explanation: `function calculate_password_strength(char* password) -> returns int`
 *
 * PSEUDOCODE:
 * ```c
 * int calculate_password_strength(const char* password) {
 *   // 1. Initialize score to 0.
 *   int score = 0;
 *
 *   // 2. If the password is null or empty, return 0 immediately.
 *   if (password == NULL || strlen(password) == 0) return 0;
 *
 *   // 3. Award points based on different rules.
 *   // Each rule met adds 20 points, for a maximum of 100.
 *
 *   // Rule A: Length check (>= 8 characters)
 *   if (strlen(password) >= 8) score += 20;
 *
 *   // Rule B: Lowercase letter check
 *   if (string_contains(password, "a-z")) score += 20;
 *
 *   // Rule C: Uppercase letter check
 *   if (string_contains(password, "A-Z")) score += 20;
 *
 *   // Rule D: Number check
 *   if (string_contains(password, "0-9")) score += 20;
 *
 *   // Rule E: Special character check
 *   if (string_contains_special_char(password)) score += 20;
 *
 *   // 4. Return the final score.
 *   return score;
 * }
 * ```
 */
export const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  if (!password) return 0;

  // Use regular expressions (regex) to test for character types.
  // A regex is a powerful pattern-matching tool for strings.

  // Award 20 points for each met criterion.
  if (password.length >= 8) score += 20; // Length
  if (/[a-z]/.test(password)) score += 20; // Contains a lowercase letter
  if (/[A-Z]/.test(password)) score += 20; // Contains an uppercase letter
  if (/[0-9]/.test(password)) score += 20; // Contains a number
  if (/[^A-Za-z0-9]/.test(password)) score += 20; // Contains a non-alphanumeric character

  return score;
};
