"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop({ target }: { target?: React.RefObject<HTMLElement> }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = target?.current ?? window;
    const getY = () =>
      target?.current ? target.current.scrollTop : window.scrollY;
    const onScroll = () => setShow(getY() > 600);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [target]);

  const toTop = () => {
    if (target?.current) target.current.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          onClick={toTop}
          className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full border border-[var(--border-neon)] bg-bg-secondary/90 text-neon-blue shadow-neon-blue backdrop-blur"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
