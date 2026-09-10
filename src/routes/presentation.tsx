import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import slides from "@/assets/slides.json";

const deck = { url: "/Event-Based-Eye-Inspired-Presentation.pptx" };

export const Route = createFileRoute("/presentation")({
  head: () => ({
    meta: [
      { title: "Presentation — Event-Based Cameras Inspired by the Human Eye" },
      {
        name: "description",
        content:
          "View and download the full slide deck on event-based cameras: retina biology, sensor working, applications, research timeline, statistics and future prospects.",
      },
      { property: "og:title", content: "Presentation — Event-Based Cameras Inspired by the Human Eye" },
      {
        property: "og:description",
        content:
          "All 27 slides of the event-based camera presentation, viewable online and downloadable as PowerPoint.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PresentationPage,
});

const titles: Record<number, string> = {
  1: "Title — Event-Based Cameras: Inspired by the human eye",
  2: "Flow of contents",
  3: "Problem statement",
  4: "Biological phenomenon",
  5: "How the retina works",
  6: "Frame vs event capture over time",
  7: "Working of an event-based camera",
  8: "Standard vs event camera output",
  9: "Frame-based vs event-based view",
  10: "Applications — high-speed robotics & drones",
  11: "Visual SLAM & navigation",
  12: "Driver monitoring — face/eye/blink tracking",
  13: "Autonomous driving — pedestrian detection",
  14: "Detection overlays in the wild",
  15: "Object detection & recognition",
  16: "Space situational awareness",
  17: "Pros & cons",
  18: "Research timeline 1991–2014",
  19: "Research timeline 2017–2025",
  20: "Statistical data",
  21: "Human retina by the numbers",
  22: "Future prospects — autonomous vehicles",
  23: "Future prospects — UAVs",
  24: "Future prospects — smart surveillance",
  25: "Citations",
  26: "Conclusion",
  27: "Thank you",
};

function PresentationPage() {
  const [i, setI] = useState(0);
  const total = slides.length;
  const current = slides[i]!;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-4xl font-semibold">The presentation</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          “Event-Based Cameras: Inspired by human eye” — by Neel Patil (C351), Viransh Nishar (C335),
          Akshat Pandey (C339) and Atharv Patidar (C348). Browse all {total} slides below, or
          download the original PowerPoint file.
        </p>

        <a
          href={deck.url}
          download="Event-Based-Eye-Inspired-Presentation.pptx"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Download size={16} /> Download the slides (.pptx)
        </a>

        <h2 className="mt-12 text-2xl font-semibold">Presented by</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { name: "Neel Patil", id: "C351", photo: "/team/neel.jpg" },
            { name: "Viransh Nishar", id: "C335", photo: "/team/viransh.jpg" },
            { name: "Akshat Pandey", id: "C339", photo: "/team/akshat.jpg" },
            { name: "Atharv Patidar", id: "C348", photo: "/team/atharv.jpg" },
          ].map((person) => (
            <div key={person.id} className="panel flex flex-col items-center gap-3 p-4 text-center">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/40"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-secondary text-xs text-muted-foreground ring-2 ring-border">
                  Photo coming soon
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{person.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{person.id}</p>
              </div>
            </div>
          ))}
        </div>

        <figure className="panel glow-ring mt-10 overflow-hidden p-2">
          <img
            key={current.n}
            src={current.url}
            alt={`Slide ${current.n}: ${titles[current.n] ?? "presentation slide"}`}
            className="h-auto w-full rounded-lg bg-black"
            loading="eager"
          />
          <figcaption className="flex items-center gap-3 px-3 py-3 text-sm">
            <button
              type="button"
              onClick={() => setI((v) => (v - 1 + total) % total)}
              aria-label="Previous slide"
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-secondary transition hover:bg-muted"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setI((v) => (v + 1) % total)}
              aria-label="Next slide"
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-secondary transition hover:bg-muted"
            >
              <ChevronRight size={16} />
            </button>
            <span className="text-muted-foreground">
              <span className="font-mono text-primary">
                {String(current.n).padStart(2, "0")}/{total}
              </span>{" "}
              — {titles[current.n]}
            </span>
          </figcaption>
        </figure>

        <h2 className="mt-12 text-2xl font-semibold">All slides</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {slides.map((s, idx) => (
            <button
              key={s.n}
              type="button"
              onClick={() => setI(idx)}
              className={`overflow-hidden rounded-lg border text-left transition hover:opacity-90 ${
                idx === i ? "border-primary" : "border-border"
              }`}
            >
              <img
                src={s.url}
                alt={`Slide ${s.n}: ${titles[s.n] ?? "presentation slide"}`}
                loading="lazy"
                className="h-auto w-full bg-black"
              />
              <span className="block px-2 py-1 font-mono text-[10px] text-muted-foreground">
                {String(s.n).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
