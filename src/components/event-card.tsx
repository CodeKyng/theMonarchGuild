import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";

interface EventItem {
  id: string;
  title?: string;
  presenter?: string;
  status?: string;
  venue?: string;
  location?: string;
  date?: string | number | Date | { toDate: () => Date };
  time?: string;
  description?: string;
  image?: string;
  ticketLink?: string;
}

function formatEventDate(date: EventItem["date"]) {
  if (!date) return "Date to be announced";
  const parsedDate =
    date instanceof Date
      ? date
      : typeof date === "object"
        ? date.toDate()
        : new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? String(date)
    : parsedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function AdmitOneTicket({ event }: { event: EventItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-9, 9]), {
    stiffness: 180,
    damping: 22,
  });

  function handleMouseMove(pointerEvent: MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((pointerEvent.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((pointerEvent.clientY - rect.top) / rect.height - 0.5);
  }

  function resetTilt() {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }

  const style = {
    rotateX,
    rotateY,
    transformStyle: "preserve-3d",
  } as CSSProperties;

  const ticket = (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetTilt}
      onBlur={resetTilt}
      style={style}
      className="relative w-full overflow-hidden rounded-2xl border border-orange-200/20 bg-[#21170f] text-[#f9eddb] shadow-2xl shadow-black/30 transition-shadow duration-300 sm:rounded-3xl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 15%, #a66a36 0%, transparent 45%),
            radial-gradient(ellipse at 85% 85%, #75442a 0%, transparent 40%),
            repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.025) 4px)
          `,
        }}
      />

      <div className="relative grid min-h-[330px] grid-cols-1 sm:min-h-[390px] sm:grid-cols-[1fr_160px]">
        <div className="relative flex flex-col justify-between p-6 sm:p-9 md:p-11">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-300 sm:text-xs">
              <Ticket size={15} aria-hidden="true" />
              <span>{event.presenter ?? "The Monarch Guild presents"}</span>
            </div>

            <div className="mt-10 sm:mt-14">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-orange-200/60">
                  You are invited
                </p>
                {event.status && (
                  <span className="rounded-full border border-orange-200/25 px-2 py-0.5 text-[9px] uppercase tracking-wider text-orange-200/70">
                    {event.status}
                  </span>
                )}
              </div>

              <h2 className="max-w-lg break-words text-[clamp(2rem,7vw,3.75rem)] font-black leading-[0.98] tracking-[-0.055em]">
                {event.title ?? "Guild Event"}
                <span className="text-orange-300">.</span>
              </h2>

              {event.description && (
                <p className="mt-4 max-w-lg break-words text-sm leading-6 text-orange-50/60 sm:text-base">
                  {event.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 border-t border-orange-100/15 pt-5 sm:mt-10 sm:grid-cols-2 sm:gap-3">
            <div className="flex items-start gap-3">
              <CalendarDays
                size={17}
                className="mt-0.5 shrink-0 text-orange-300"
                aria-hidden="true"
              />
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-orange-100/40">
                  Date & time
                </p>
                <p className="mt-1 break-words text-xs font-medium sm:text-sm">
                  {[formatEventDate(event.date), event.time]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-orange-300"
                aria-hidden="true"
              />
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-orange-100/40">
                  Location
                </p>
                <p className="mt-1 break-words text-xs font-medium sm:text-sm">
                  {event.venue ?? event.location ?? "To be announced"}
                </p>
              </div>
            </div>
          </div>

          {event.ticketLink && (
            <a
              href={event.ticketLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-orange-200 transition-colors hover:bg-orange-200/10"
            >
              Get tickets <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="relative flex flex-row items-center justify-between border-t border-dashed border-orange-100/30 bg-orange-100/[0.04] px-6 py-5 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:px-4 sm:py-8">
          <span className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-[#21170f] sm:block" />
          <span className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-[#21170f] sm:block" />

          <div className="flex items-center gap-3 sm:flex-col sm:gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-200/25 text-orange-300 sm:h-16 sm:w-16">
              <Ticket size={25} strokeWidth={1.2} aria-hidden="true" />
            </div>
            <div className="sm:text-center">
              <p className="text-[9px] uppercase tracking-[0.25em] text-orange-100/40">
                Entry pass
              </p>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] sm:mt-2 sm:text-base">
                Admit one
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:mt-8 sm:flex-col sm:gap-3">
            <div
              aria-hidden="true"
              className="flex h-10 items-stretch gap-[2px] opacity-80 sm:h-12"
            >
              {Array.from({ length: 23 }, (_, index) => (
                <span
                  key={index}
                  className="block bg-orange-100"
                  style={{
                    width: index % 4 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
                    opacity: index % 5 === 0 ? 0.45 : 0.9,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-orange-100/50">
              NO. {event.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <ArrowUpRight
            size={16}
            className="hidden text-orange-300/60 sm:block"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="h-1 w-full bg-gradient-to-r from-orange-900 via-orange-300 to-orange-900" />
      <motion.div
        aria-hidden="true"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-orange-200/30"
      />
    </motion.div>
  );

  return (
    <div className="w-full" style={{ perspective: "1400px" }}>
      {ticket}
    </div>
  );
}

export default function EventCard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function fetchEvents() {
      try {
        const snapshot = await getDocs(query(collection(db, "events")));
        if (isCurrent) {
          setEvents(
            snapshot.docs.map((eventDoc) => ({
              ...(eventDoc.data() as Omit<EventItem, "id">),
              id: eventDoc.id,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load events:", error);
        if (isCurrent) {
          setErrorMessage("Events could not be loaded. Please try again later.");
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void fetchEvents();
    return () => {
      isCurrent = false;
    };
  }, []);

  if (isLoading) {
    return (
      <p role="status" className="py-12 text-center text-muted-foreground">
        Loading events…
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p role="alert" className="py-12 text-center text-muted-foreground">
        {errorMessage}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No community events have been announced yet. Check back for updates.
      </p>
    );
  }

  return (
    <section
      aria-label="Guild events"
      className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-5 px-4 sm:gap-6 sm:px-6 xl:grid-cols-2"
    >
      {events.map((event) => (
        <AdmitOneTicket key={event.id} event={event} />
      ))}
    </section>
  );
}
