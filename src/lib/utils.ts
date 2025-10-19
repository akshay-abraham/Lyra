// Copyright (C) 2025 Akshay K Rooben abraham
/**
 * @fileoverview FILE SUMMARY
 *
 * This is a utility file, similar to a `utils.h` or `helpers.c` in C.
 * It contains common, reusable functions that are used across different
 * parts of the application. Keeping them here prevents code duplication
 * and makes the main component files cleaner.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * C-like Explanation: `function cn(...inputs) -> returns string`
 *
 * This function is a helper for managing CSS class names in a clean way.
 * In web development, you often need to conditionally apply classes, for example:
 * `if (isActive) { class = "active"; } else { class = ""; }`
 *
 * This function, `cn` (short for "class names"), simplifies that process.
 *
 * How it works:
 * 1.  It takes any number of arguments: strings, objects, arrays.
 * 2.  `clsx` library processes these inputs and combines them into a single class string.
 *     For example: `clsx('base', { 'active': true, 'disabled': false })` becomes `"base active"`.
 * 3.  `twMerge` (Tailwind Merge) then intelligently merges these classes. It's smart
 *     about Tailwind CSS classes. For example, if you have `"bg-red-500 bg-blue-500"`,
 *     it knows that `bg-blue-500` should override the red one, so the final result
 *     is just `"bg-blue-500"`. This prevents conflicting styles.
 *
 * @param {...ClassValue[]} inputs - A list of class values to be combined.
 * @returns {string} A single, merged string of CSS class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * C-like Explanation: `function calculatePasswordStrength(password) -> returns int`
 *
 * This function calculates a "strength score" for a given password based on a set
 * of predefined criteria. It's used in the registration form to give users real-time
 * feedback on their password security.
 *
 * PSEUDOCODE:
 *
 * function calculatePasswordStrength(char* password):
 *   // 1. Initialize score to 0.
 *   int score = 0;
 *
 *   // 2. If the password is null or empty, return 0 immediately.
 *   if (password == NULL || strlen(password) == 0) return 0;
 *
 *   // 3. Award points based on different rules.
 *   // Each rule met adds 20 points, for a maximum of 100.
 *
 *   // Rule A: Length check
 *   if (strlen(password) >= 8) score += 20;
 *
 *   // Rule B: Lowercase letter check
 *   if (password contains at least one character from 'a' to 'z') score += 20;
 *
 *   // Rule C: Uppercase letter check
 *   if (password contains at least one character from 'A' to 'Z') score += 20;
 *
 *   // Rule D: Number check
 *   if (password contains at least one character from '0' to '9') score += 20;
 *
 *   // Rule E: Special character check
 *   if (password contains at least one special character like !, @, #, etc.) score += 20;
 *
 *   // 4. Return the final score.
 *   return score;
 *
 * @param {string} password - The password string to evaluate.
 * @returns {number} A score from 0 to 100 representing the password's strength.
 */
export const calculatePasswordStrength = (password: string): number => {
    let score = 0;
    if (!password) return 0;

    // Use regular expressions (regex) to test for character types.
    // A regex is a powerful pattern-matching tool.

    // Award points for different criteria
    if (password.length >= 8) score += 20;
    if (/[a-z]/.test(password)) score += 20; // Tests for a lowercase letter
    if (/[A-Z]/.test(password)) score += 20; // Tests for an uppercase letter
    if (/[0-9]/.test(password)) score += 20; // Tests for a number
    if (/[^A-Za-z0-9]/.test(password)) score += 20; // Tests for a non-alphanumeric character

    return score;
};
