import heroBg from "@/assets/hero.mp4"
import { buttonVariants } from "../ui/button"
import Header from "./Header"
import { Link } from "react-router-dom"

function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[min(760px,100svh)] w-full flex-col overflow-hidden bg-[#090b10]">
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 -z-20 size-full object-cover"
      >
        <source src={heroBg} type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/15"
      />
      <div className="flex min-h-[min(760px,100svh)] flex-1 flex-col">
        <Header />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-amber-300 sm:text-base">
              THE WEB3 COMMUNITY FOR BUILDERS
            </p>
            <h1 className="max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.96] tracking-tight">
              Find your people.
              <span className="block text-white/75">Build what’s next.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 sm:mt-7 sm:text-lg sm:leading-8">
              The Monarch Guild brings Web3 jobbers and enthusiasts together to
              share knowledge, discover opportunities, and grow together.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
              <Link
                to="/signup"
                className={buttonVariants({
                  className:
                    "h-11 bg-amber-400 px-5 text-base font-heading text-black hover:bg-amber-300 sm:h-12 sm:px-7 sm:text-lg",
                })}
              >
                Join the guild
              </Link>
              <Link
                to="/login"
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "h-11 border-white/40 bg-white/5 px-5 text-white hover:bg-white/15 hover:text-white sm:h-12 sm:px-7",
                })}
              >
                Member login
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-5 pb-5 text-right text-white/75 sm:px-8 sm:pb-7 lg:px-12">
          <p className="font-serif text-xs font-semibold tracking-[0.25em] sm:text-sm">
            EST. 2026
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
