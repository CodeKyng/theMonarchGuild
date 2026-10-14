import { ArrowRight, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import EventCard from "@/components/event-card";
import HeroSection from "@/components/layout/HeroSection";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Bento1 from "@/components/watermelon/bento-01";
import { MinimalCarousel } from "@/components/minimal-carousel";
import { Faq1 } from "@/components/ui/faq-1";

function Dashboard() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#090b10] text-white">
      <HeroSection />

      <main>
        <section
          id="guild"
          className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-[1fr_auto] md:items-end lg:px-8 lg:py-24"
        >
          <div className="max-w-3xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300 sm:text-sm">
              <UsersRound className="size-4" aria-hidden="true" />
              The Monarch Guild
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Web3 moves forward when we grow together.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
              Meet people building in Web3, exchange what you know, and find
              your next opportunity to learn, contribute, and earn.
            </p>
          </div>
          <Link
            to="/signup"
            className={buttonVariants({
              className: "w-fit bg-amber-400 text-black hover:bg-amber-300",
            })}
          >
            Join the guild <ArrowRight className="size-4" />
          </Link>
        </section>

        <section
          id="events"
          aria-labelledby="events-heading"
          className="border-y border-white/10 bg-white/[0.025]"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300 sm:text-sm">
                  Learn, connect, move forward
                </p>
                <h2
                  id="events-heading"
                  className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
                >
                  Guild events and meetups
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-white/55 sm:text-right">
                Find the dates, locations, and details for events shared by the
                guild. New events appear here when they are announced.
              </p>
            </div>
            <EventCard />
          </div>
        </section>

        <Bento1 />
        <MinimalCarousel />
        <Faq1 />

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Card className="border-amber-200/15 bg-gradient-to-br from-amber-400/10 to-white/[0.03] text-white shadow-none">
            <CardHeader className="p-5 sm:p-8">
              <CardTitle className="text-xl sm:text-2xl">
                Your next Web3 connection could change everything.
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                Join the Monarch Guild to meet fellow builders, share your
                skills, and grow alongside the community.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-8 sm:pb-8">
              <Link
                to="/signup"
                className={buttonVariants({
                  className:
                    "w-full bg-amber-400 text-black hover:bg-amber-300 sm:w-auto",
                })}
              >
                Join the community <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/40 sm:px-6">
        © 2026 The Monarch Guild. Connect. Contribute. Grow.
      </footer>
    </div>
  );
}

export default Dashboard;
