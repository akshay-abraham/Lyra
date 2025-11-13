// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Custom hook to track the user's pointer and update CSS variables for a glow effect.
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This hook attaches a 'pointermove' event listener to the document body.
 * It calculates the pointer's absolute position (x, y) and its relative
 * position (xp, yp) as a value from 0 to 1, and sets them as CSS custom
 * properties on the root HTML element.
 *
 * This allows CSS to create dynamic effects that react to the user's cursor,
 * such as the "glow card" animation.
 */

import { useEffect } from 'react';

export const useGlowPointer = () => {
  useEffect(() => {
    const update = (e: PointerEvent) => {
      const { clientX, clientY } = e;
      const x = clientX.toFixed(2);
      const y = clientY.toFixed(2);
      const xp = (clientX / window.innerWidth).toFixed(2);
      const yp = (clientY / window.innerHeight).toFixed(2);
      document.documentElement.style.setProperty('--x', x);
      document.documentElement.style.setProperty('--xp', xp);
      document.documentElement.style.setProperty('--y', y);
      document.documentElement.style.setProperty('--yp', yp);
    };

    document.body.addEventListener('pointermove', update);

    return () => {
      document.body.removeEventListener('pointermove', update);
    };
  }, []);
};
