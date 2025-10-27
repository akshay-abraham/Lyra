// Copyright (C) 2025 Akshay K Rooben Abraham
/**
 * @fileoverview Custom Toast Notification Hook (`use-toast.ts`).
 * @copyright Copyright (C) 2025 Akshay K Rooben Abraham. All rights reserved.
 *
 * @description
 * This file implements a custom, global state management system for toast notifications,
 * inspired by the `react-hot-toast` library. It allows any component in the application
 * to trigger a toast notification without needing to be directly connected to the
 * component that renders them (`<Toaster />`).
 *
 * It works by using a "global state" pattern outside of React's own state management.
 * - A global `memoryState` object holds the array of current toasts.
 * - A global `listeners` array holds all the `setState` functions from components that use the hook.
 * - A `dispatch` function updates the `memoryState` and then calls every listener to
 *   trigger a re-render in the components.
 *
 * This pattern avoids the need for a React Context Provider, which can sometimes be
 * overly complex for simple global state like toast notifications.
 *
 * C-like Analogy:
 * This is a classic Observer (or Publisher-Subscriber) pattern.
 *
 * ```c
 * // 1. Global state and a list of observers (function pointers).
 * Toast g_toasts[MAX_TOASTS];
 * void (*g_listeners[MAX_LISTENERS])(Toast*);
 * int g_listener_count = 0;
 *
 * // 2. A function to dispatch actions.
 * void dispatch(Action action) {
 *   // Update the global `g_toasts` array based on the action.
 *   update_toasts(action);
 *
 *   // Notify all registered listeners of the change.
 *   for (int i = 0; i < g_listener_count; i++) {
 *     g_listeners[i](g_toasts);
 *   }
 * }
 *
 * // 3. The main `toast()` function that creates an action and dispatches it.
 * void toast(const char* message) {
 *   Action add_action = create_add_toast_action(message);
 *   dispatch(add_action);
 * }
 * ```
 * The `useToast` hook is the part that registers a component's `setState` function
 * as a listener.
 */
'use client';

// Inspired by react-hot-toast library
import * as React from 'react';

import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 1; // Show only one toast at a time.
const TOAST_REMOVE_DELAY = 1000000; // A very long delay for removing toasts from the state.

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Defines the types of actions that can be dispatched to update the toast state.
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

// Generates a unique ID for each toast.
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

// A union type representing all possible actions.
type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

// The shape of the global toast state.
interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * The reducer function. It takes the current state and an action, and returns the new state.
 * This is a pure function; it does not have side effects.
 *
 * @param {State} state - The current state.
 * @param {Action} action - The action to perform.
 * @returns {State} The new state.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // Side effect! This could be extracted into a dismissToast() action,
      // but is kept here for simplicity.
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Set the `open` prop to false to trigger the exit animation.
              }
            : t,
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// The array of listeners (observers).
const listeners: Array<(state: State) => void> = [];

// The single source of truth for the toast state.
let memoryState: State = { toasts: [] };

/**
 * Dispatches an action to the reducer and notifies all listeners of the state change.
 * @param {Action} action - The action to dispatch.
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'>;

/**
 * The main function to create and show a toast.
 * @param {Toast} props - The properties of the toast (title, description, etc.).
 * @returns An object with `id`, `dismiss`, and `update` methods for controlling the toast.
 */
function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * The custom hook that components use to access the toast state and the `toast` function.
 * It subscribes the component to the global state and ensures it re-renders when toasts change.
 * @returns An object with the current `toasts` array, the `toast` function, and the `dismiss` function.
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    // When the component mounts, add its `setState` function to the listeners array.
    listeners.push(setState);
    // When the component unmounts, remove its `setState` function to prevent memory leaks.
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };
