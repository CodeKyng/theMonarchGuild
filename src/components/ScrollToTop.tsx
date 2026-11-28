import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "cn";

/**
 * Fixed "back to top" button for the public landing page.
 * Stays in one position while the page scrolls and only appears after the user has scrolled down.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show once the user has scrolled past roughly the hero height
      setVisible(window.scrollY > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full",
        "border border-amber-400/40 bg-amber-400 text-black shadow-lg shadow-amber-400/20",
        "transition-all duration-300 ease-out",
        "hover:bg-amber-300 hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090b10]",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp className="size-5" strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}

export default ScrollToTop;
