
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import {
  Sprout,
  Users,
  Globe2,
  Award,
  Cloud,
  Smartphone,
  ChartNoAxesCombined,
  ShieldCheck,
  WandSparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  id: string;
  label: string;
  icon: LucideIcon;
  image: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    id: "sustainable",
    label: "Sustainable Sourcing",
    icon: Sprout,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85",
    description: "Ethically sourced ingredients from local farmers.",
  },
  {
    id: "community",
    label: "Community Focused",
    icon: Users,
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=85",
    description: "Building stronger bonds through shared experiences.",
  },
  {
    id: "global",
    label: "Global Reach",
    icon: Globe2,
    image:
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1000&q=85",
    description: "Connecting visionaries across all continents.",
  },
  {
    id: "award",
    label: "Award Winning",
    icon: Award,
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=85",
    description: "Recognized excellence in design and innovation.",
  },
  {
    id: "cloud",
    label: "Cloud Ready",
    icon: Cloud,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=85",
    description: "Scale your infrastructure with seamless ease.",
  },
  {
    id: "mobile",
    label: "Mobile First",
    icon: Smartphone,
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1000&q=85",
    description: "A world-class experience on every single device.",
  },
  {
    id: "analytics",
    label: "Real-time Analytics",
    icon: ChartNoAxesCombined,
    image:
      "https://images.unsplash.com/photo-1551288049-bbda38a10ad5?auto=format&fit=crop&w=1000&q=85",
    description: "Insights at your fingertips, updated in real time.",
  },
  {
    id: "security",
    label: "Enterprise Security",
    icon: ShieldCheck,
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1000&q=85",
    description: "Security-first protocols that help protect your data.",
  },
  {
    id: "magic",
    label: "Magic Automations",
    icon: WandSparkles,
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=85",
    description: "Let AI handle repetitive tasks so you can focus on more.",
  },
  {
    id: "local",
    label: "Locally Owned",
    icon: Store,
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85",
    description: "Supporting local businesses, independent makers, and creators.",
  },
];

const AUTO_PLAY_INTERVAL = 3000;

export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const nextStep = useCallback(() => {
    setCurrentIndex((previous) => (previous + 1) % FEATURES.length);
  }, []);

  const selectFeature = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused || reduceMotion) return;

    const interval = window.setInterval(
      nextStep,
      AUTO_PLAY_INTERVAL
    );

    return () => window.clearInterval(interval);
  }, [isPaused, nextStep, reduceMotion]);

  const getStatus = (index: number) => {
    const length = FEATURES.length;
    const diff =
      ((index - currentIndex + length / 2) % length + length) %
        length -
      length / 2;

    if (diff === 0) return "active";
    if (diff === -1) return "prev";
    if (diff === 1) return "next";
    return "hidden";
  };

  return (
    <section className="m-4 max-h-full max-w-full md:p-6 lg:p-8">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsPaused(false);
          }
        }}
        className="relative flex min-h-[700px] flex-col overflow-hidden
          rounded-[2rem] border border-slate-200 md:rounded-[2.5rem]
          lg:min-h-0 lg:aspect-[16/9] lg:flex-row"
      >
        {/* Feature selector */}
        <div className="relative z-20 flex min-h-[330px] w-full
          flex-col justify-center overflow-hidden
          px-5 py-10 sm:px-10 lg:w-[40%] lg:px-12">
          <div className="pointer-events-none absolute inset-x-0 top-0
            z-30 h-12 bg-gradient-to-b from-[#62B2FE] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0
            z-30 h-12 bg-gradient-to-t from-[#62B2FE] to-transparent" />

          <div className="absolute left-7 top-7 z-10 sm:left-10 sm:top-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              What we offer
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Built around you.
            </h2>
          </div>

          <div className="relative mt-16 flex h-[310px] w-full items-center
            justify-center lg:mt-20 lg:justify-start">
            {FEATURES.map((feature, index) => {
              const distance =
                ((index - currentIndex + FEATURES.length / 2) %
                  FEATURES.length +
                  FEATURES.length) %
                  FEATURES.length -
                FEATURES.length / 2;

              const active = index === currentIndex;
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    y: distance * 57,
                    opacity: Math.max(0.2, 1 - Math.abs(distance) * 0.22),
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 100,
                          damping: 22,
                        }
                  }
                  className="absolute left-1/2 w-max max-w-full -translate-x-1/2
                    sm:left-0 sm:translate-x-0"
                >
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectFeature(index)}
                    className={cn(
                      "group flex max-w-full items-center gap-3 rounded-full border px-4 py-3 text-left transition-colors duration-300 sm:gap-4 sm:px-6 sm:py-4",
                      active
                        ? "border-white bg-white text-[#318bd8] shadow-lg"
                        : "border-white/25 bg-transparent text-white/75 hover:border-white/60 hover:text-white"
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      size={19}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />
                    <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.08em] sm:text-sm">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="absolute bottom-6 left-7 flex items-center gap-2 text-xs text-white/70 sm:bottom-8 sm:left-10">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            Explore our features
          </div>
        </div>

        {/* Image carousel */}
        <div className="relative flex min-h-[420px] flex-1 items-center
          justify-center overflow-hidden border-t border-slate-200
          bg-slate-50 px-5 py-12 sm:px-10 lg:min-h-0 lg:border-l
          lg:border-t-0 lg:px-12 lg:py-10">
          <div className="relative aspect-[4/5] w-full max-w-[340px] sm:max-w-[380px]">
            {FEATURES.map((feature, index) => {
              const status = getStatus(index);
              const active = status === "active";
              const neighbor = status === "prev" || status === "next";

              return (
                <motion.article
                  key={feature.id}
                  initial={false}
                  animate={{
                    x:
                      status === "prev"
                        ? "-25%"
                        : status === "next"
                          ? "25%"
                          : "0%",
                    scale: active ? 1 : neighbor ? 0.84 : 0.7,
                    opacity: active ? 1 : neighbor ? 0.35 : 0,
                    rotate: status === "prev" ? -4 : status === "next" ? 4 : 0,
                    zIndex: active ? 20 : neighbor ? 10 : 0,
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 240,
                          damping: 28,
                        }
                  }
                  aria-hidden={!active}
                  className="absolute inset-0 overflow-hidden rounded-[1.75rem]
                    border-[5px] border-white bg-slate-200 shadow-2xl
                    shadow-slate-950/15 sm:rounded-[2rem] sm:border-[7px]"
                >
                  <img
                    src={feature.image}
                    alt={feature.label}
                    loading={active ? "eager" : "lazy"}
                    className={cn(
                      "h-full w-full object-cover transition-all duration-700",
                      active
                        ? "scale-100 grayscale-0"
                        : "scale-105 grayscale brightness-75"
                    )}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t
                    from-black/85 via-black/10 to-black/10" />

                  {active && (
                    <>
                      <div className="absolute left-5 top-5 flex items-center gap-2 sm:left-7 sm:top-7">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                        <span className="text-[10px] font-medium uppercase
                          tracking-[0.22em] text-white/90">
                          Featured
                        </span>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={feature.id}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.35 }}
                          className="absolute inset-x-0 bottom-0 flex
                            flex-col items-start p-5 pt-24 sm:p-7 sm:pt-28"
                        >
                          <span className="mb-3 rounded-full border
                            border-white/20 bg-white/15 px-3 py-1.5
                            text-[10px] font-medium uppercase tracking-wider
                            text-white backdrop-blur-md">
                            {String(index + 1).padStart(2, "0")} /{" "}
                            {feature.label}
                          </span>

                          <h3 className="text-2xl font-semibold leading-tight
                            tracking-tight text-white sm:text-3xl">
                            {feature.label}
                          </h3>

                          <p className="mt-3 max-w-sm text-sm leading-relaxed
                            text-white/80 sm:text-base">
                            {feature.description}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </>
                  )}
                </motion.article>
              );
            })}
          </div>

          {/* Carousel controls */}
          <div className="absolute bottom-4 right-5 flex items-center gap-2
            sm:bottom-6 sm:right-8">
            <span className="mr-2 text-xs tabular-nums text-slate-500">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(FEATURES.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex(
                  (currentIndex - 1 + FEATURES.length) % FEATURES.length
                )
              }
              aria-label="Previous feature"
              className="flex h-10 w-10 items-center justify-center rounded-full
                border border-slate-200 bg-white text-slate-700
                transition hover:bg-slate-100 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={nextStep}
              aria-label="Next feature"
              className="flex h-10 w-10 items-center justify-center rounded-full
                border border-slate-200 bg-white text-slate-700
                transition hover:bg-slate-100 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
