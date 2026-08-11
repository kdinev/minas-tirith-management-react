import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query.
 *
 * `useSyncExternalStore` rather than `useEffect` + state: the browser is the
 * store, so reading it during render keeps the first paint from flashing the
 * wrong layout, and the server snapshot is the desktop case.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
