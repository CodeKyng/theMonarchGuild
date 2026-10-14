import React from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaPlus, FaMinus } from "react-icons/fa";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  date?: string;
}

export interface Faq1Props {
  badge?: string;
  title?: React.ReactNode;
  faqs?: FaqItem[];
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  className?: string;
}

const guildFaqs: FaqItem[] = [
  {
    id: "what-is-the-guild",
    question: "What is The Monarch Guild?",
    answer:
      "The Monarch Guild brings Web3 jobbers and enthusiasts together to connect, share knowledge, discover ways to earn, and grow their skills and networks. It is a place to build alongside people who want to move forward in Web3.",
  },
  {
    id: "who-its-for",
    question: "Who is the guild for?",
    answer:
      "Anyone interested in Web3 is welcome, whether you are already working in the space, looking for your first opportunity, building a project, or learning and meeting like-minded people.",
  },
  {
    id: "join",
    question: "How do I join the community?",
    answer:
      "Create an account from the Sign up page to get started as a guild member. Keep an eye on the site for community events and updates.",
  },
  {
    id: "earning",
    question: "Can I find ways to earn through the guild?",
    answer:
      "The guild is built around helping members discover opportunities and grow together. Specific jobs, gigs, and earning opportunities depend on what the community shares, so follow guild updates and participate to stay connected.",
  },
  {
    id: "growth",
    question: "How can I learn and grow with other members?",
    answer:
      "Join conversations, share what you know, and take part in guild events. The community is a place to exchange ideas, build relationships, and support each other's progress in Web3.",
  },
  {
    id: "events",
    question: "Where can I find guild events?",
    answer:
      "Check the Guild events and meetups section on the home page for events shared by the guild. Event details such as the date, time, and venue appear when they have been provided.",
  },
  {
    id: "account-help",
    question: "I need help with my account. What should I do?",
    answer:
      "If you run into trouble creating an account or signing in, try the login and sign up pages first. For access or profile issues that persist, contact the guild team through its official community channels.",
  },
];

export function Faq1({
  badge = "Web3, together",
  title = <>Build your place in <span className="text-amber-300">Web3</span>.</>,
  faqs = guildFaqs,
  footerText = "Ready to grow with the community?",
  footerLinkText = "Join the guild",
  footerLinkHref = "/signup",
  className,
}: Faq1Props) {
  return (
    <section
      aria-labelledby="guild-faq-heading"
      className={cn("w-full border-y border-white/10 bg-white/[0.02] px-4 py-16 sm:px-6 sm:py-20 lg:py-24", className)}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <span className="mb-4 inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            {badge}
          </span>
          <h2 id="guild-faq-heading" className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {footerText && (
            <p className="mt-5 flex flex-wrap items-center gap-x-2 text-sm text-white/55 sm:text-base">
              {footerText}
              {footerLinkText && footerLinkHref && (
                <Link to={footerLinkHref} className="inline-flex items-center gap-1 font-semibold text-amber-200 transition hover:text-amber-100">
                  {footerLinkText}<ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </p>
          )}
        </div>

        <Accordion multiple={false} className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-b border-white/10 first:border-t first:border-white/10"
            >
              <AccordionTrigger className="group flex items-center gap-4 py-5 text-left hover:no-underline sm:py-6 [&_[data-slot=accordion-trigger-icon]]:hidden">
                <span className="w-8 shrink-0 text-xs font-medium tabular-nums text-amber-200/65">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-base font-medium text-white sm:text-lg">{faq.question}</span>
                <span className="ml-auto grid size-8 shrink-0 place-items-center rounded-full border border-white/15 text-white/60 transition group-hover:border-amber-200/50 group-hover:text-amber-200">
                  <FaPlus className="size-3 group-aria-expanded:hidden" aria-hidden="true" />
                  <FaMinus className="hidden size-3 group-aria-expanded:block" aria-hidden="true" />
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pl-12 pr-10 sm:pb-7">
                <p className="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">{faq.answer}</p>
                {faq.date && <p className="mt-3 text-xs font-medium text-white/35">{faq.date}</p>}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
