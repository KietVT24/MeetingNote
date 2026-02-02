import { useEffect } from 'react';

/**
 * useScrollReveal
 * Observes elements inside a container and toggles a class when they enter the viewport.
 *
 * Contract:
 * - Inputs:
 *   - containerRef: React ref to a DOM element that contains targets to reveal
 *   - targetClass: class name used to select elements to observe (default 'reveal-up')
 *   - visibleClass: class name to add when an element becomes visible (default 'is-visible')
 *   - options: IntersectionObserver options (threshold, rootMargin, root) and `once`
 * - Behavior:
 *   - Adds `visibleClass` when an element intersects. If `once` is true (default), unobserves afterward.
 *   - If IntersectionObserver is not available, immediately adds `visibleClass` to all targets.
 */
export default function useScrollReveal(
  containerRef,
  targetClass = 'reveal-up',
  visibleClass = 'is-visible',
  options = {}
) {
  useEffect(() => {
    const root = containerRef?.current;
    if (!root) return;

    const {
      threshold = 0.15,
      rootMargin = '0px',
      root: ioRoot = null,
      once = true,
    } = options || {};

    const elements = root.querySelectorAll(`.${targetClass}`);

    // Fallback: No IO support
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      elements.forEach((el) => el.classList.add(visibleClass));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(visibleClass);
            if (once) observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin, root: ioRoot }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // containerRef.current is intentionally not in deps to avoid re-observing on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, targetClass, visibleClass, JSON.stringify(options)]);
}
