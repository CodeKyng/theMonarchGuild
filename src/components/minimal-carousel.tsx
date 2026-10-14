"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Copy, ExternalLink } from "lucide-react";

export interface CarouselCard {
  id: string;
  title: string;
  value: string;
  image: string;
  imageAlt: string;
  color?: string;
  description?: string;
}

interface MinimalCarouselProps {
  cards?: CarouselCard[];
  onCopyClick?: (card: CarouselCard) => void;
  onCustomizeClick?: (card: CarouselCard) => void;
}

const defaultCards: CarouselCard[] = [
  {
    id: "nfts",
    title: "Guild NFTs",
    value: "Own your legend",
    image:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Colorful digital abstract art representing collectible NFTs",
    description: "Collect one of a kind pieces and carry your story across the guild.",
  },
  {
    id: "merch",
    title: "Guild Merch",
    value: "Wear your colors",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Fashion model wearing contemporary streetwear",
    description: "Rep the Monarch Guild with apparel made for the journey.",
  },
  {
    id: "tokens",
    title: "Guild Tokens",
    value: "Power the game",
    image:
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Golden cryptocurrency coin on a dark surface",
    description: "Put your tokens to work in the experiences you help shape.",
  },
  {
    id: "community",
    title: "Our Community",
    value: "Better together",
    image:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Friends gathering together at an outdoor celebration",
    description: "Meet your people, share ideas, and make the next adventure happen.",
  },
];

export const MinimalCarousel = ({
  cards = defaultCards,
  onCopyClick,
  onCustomizeClick,
}: MinimalCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const activeCard = cards[activeIndex];

  if (!activeCard) return null;

  const goTo = (index: number) => {
    setActiveIndex((index + cards.length) % cards.length);
    setCopied(false);
  };

  return (
    <section aria-label="Explore the Monarch Guild" className="w-full px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300 sm:text-sm">
              Discover the guild
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Made for your next chapter.</h2>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="mr-2 text-sm tabular-nums text-white/50">{String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => goTo(activeIndex - 1)} aria-label="Previous slide" className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition hover:border-amber-300/60 hover:bg-white/10">
              <ArrowLeft className="size-4" />
            </button>
            <button type="button" onClick={() => goTo(activeIndex + 1)} aria-label="Next slide" className="grid size-11 place-items-center rounded-full bg-amber-300 text-black transition hover:bg-amber-200">
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.55fr_0.75fr]">
          <div className="relative min-h-[390px] overflow-hidden rounded-[28px] bg-[#171717] sm:min-h-[500px] sm:rounded-[36px]">
            <AnimatePresence mode="wait">
              <motion.div key={activeCard.id} initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
                <img src={activeCard.image} alt={activeCard.imageAlt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
                  <div className="max-w-xl">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">{activeCard.value}</p>
                    <h3 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">{activeCard.title}</h3>
                    {activeCard.description && <p className="mt-3 max-w-lg text-sm leading-6 text-white/75 sm:text-base">{activeCard.description}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {onCopyClick && <button type="button" onClick={() => { onCopyClick(activeCard); setCopied(true); }} className="flex h-11 items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"><Copy className="size-4" />{copied ? "Copied" : "Copy"}</button>}
                    {onCustomizeClick && <button type="button" onClick={() => onCustomizeClick(activeCard)} className="flex h-11 items-center gap-2 rounded-full bg-amber-300 px-4 text-sm font-semibold text-black transition hover:bg-amber-200">Explore <ExternalLink className="size-4" /></button>}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {cards.map((card, index) => (
              <button key={card.id} type="button" onClick={() => goTo(index)} aria-current={index === activeIndex ? "true" : undefined} className={`group relative min-h-36 overflow-hidden rounded-2xl text-left sm:min-h-40 lg:min-h-0 lg:flex-1 ${index === activeIndex ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-[#090b10]" : "opacity-70 transition hover:opacity-100"}`}>
                <img src={card.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">{card.value}</span>
                  <span className="mt-1 block text-base font-semibold text-white sm:text-lg">{card.title}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
