import { Variants } from "framer-motion";

/**
 * Shared animation variants used across the landing page.
 * All variants respect the user’s `prefers-reduced-motion` setting –
 * Framer Motion will automatically honor that when the `motion` component
 * receives the `transition` with `type: "spring"` and a reasonable duration.
 */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const staggerChildren: Variants = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};
