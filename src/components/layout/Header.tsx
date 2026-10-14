import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="relative z-30 w-full border-b border-white/10 bg-black/45 text-white backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center gap-2.5"
        >
          <img
            src="/theMonarchGuildLogo.png"
            alt=""
            className="size-9 shrink-0 rounded-full sm:size-10"
          />
          <span className="truncate font-heading text-base font-extrabold tracking-tight sm:text-xl">
            The Monarch Guild
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
          <Link className="text-sm font-semibold text-white/80 transition hover:text-white" to="/">
            Home
          </Link>
          <Link className="text-sm font-semibold text-white/80 transition hover:text-white" to="/marketplace">
            Marketplace
          </Link>
          <a className="text-sm font-semibold text-white/80 transition hover:text-white" href="#events">
            Events
          </a>
          <Link className="text-sm font-semibold text-white/80 transition hover:text-white" to="/">
            Resources
          </Link>
        </nav>
        <div className="hidden lg:block">
          <Link
            to="/login"
            className="inline-flex h-9 items-center justify-center rounded-4xl bg-white px-5 text-sm font-medium text-black transition hover:bg-white/85"
          >
            Login
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/login"
            className="inline-flex h-8 items-center justify-center rounded-4xl bg-white px-3 text-sm font-medium text-black transition hover:bg-white/85"
          >
            Login
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="shrink-0 text-white hover:bg-white/10 hover:text-white"
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b border-white/10 bg-[#090b10]/95 px-4 py-3 shadow-xl backdrop-blur-lg lg:hidden"
        >
          <Link className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10" to="/" onClick={closeMenu}>
            Home
          </Link>
          <Link className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10" to="/marketplace" onClick={closeMenu}>
            Marketplace
          </Link>
          <a className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10" href="#events" onClick={closeMenu}>
            Events
          </a>
          <Link className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-white/10" to="/" onClick={closeMenu}>
            Resources
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;
