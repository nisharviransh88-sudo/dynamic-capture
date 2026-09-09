import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Battery, Eye, Gauge, Sun, Zap } from "lucide-react";
import heroImg from "@/assets/hero-eye-camera.jpg";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RETINA/SENSE — Event Cameras Inspired by the Human Eye" },
      {
        name: "description",
        content:
          "See how an event-based camera senses motion like the human retina. Compare it live with a normal camera and watch the power savings in real time.",
      },
      { property: "og:title", content: "RETINA/SENSE — Event Cameras Inspired by the Human Eye" },
      {
        property: "og:description",
        content:
          "A live browser lab comparing frame cameras with retina-inspired event cameras, including power and data savings.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <Eye size={13} /> Neuromorphic vision
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] sm:text-6xl">
              The camera that <span className="text-gradient">blinks like an eye</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Your retina never sends a full picture to your brain. Each photoreceptor fires only
              when the light in front of it changes. An event-based camera copies that trick:
              microsecond response, no motion blur, and a tiny fraction of the power a normal
              camera burns.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/camera"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Open the live camera lab <ArrowRight size={16} />
              </Link>
              <Link
                to="/science"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-5 py-3 text-sm font-medium transition hover:bg-muted"
              >
                How the eye does it
              </Link>
            </div>
          </div>

          <figure className="relative">
            <div className="panel glow-ring overflow-hidden p-2">
              <img
                src={heroImg}
                alt="A human eye dissolving into pixels that reform as an event-based camera sensor"
                width={1600}
                height={1008}
                className="h-auto w-full rounded-xl"
              />
            </div>
            <figcaption className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
              eye → spikes → silicon retina
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Battery size={16} />, k: "10–100 mW", v: "sensor power, vs 1–3.5 W for an industrial colour camera" },
            { icon: <Zap size={16} />, k: "< 1 ms", v: "latency per event — like a virtual 1000+ fps camera" },
            { icon: <Sun size={16} />, k: "120–143 dB", v: "dynamic range, vs ~60–70 dB on normal sensors" },
            { icon: <Gauge size={16} />, k: "~0 data", v: "bandwidth on a still scene, vs ~27 MB/s at 720p30" },
          ].map((s) => (
            <div key={s.k} className="panel p-5">
              <p className="text-primary">{s.icon}</p>
              <p className="mt-3 font-display text-2xl font-semibold">{s.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-semibold">The problem with normal cameras</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="panel p-6">
            <h3 className="text-lg font-semibold">Normal (frame) camera</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Captures full frames at a fixed rate, even when nothing changes.</li>
              <li>• Motion blur at speed, and struggles in low-light or high-contrast scenes.</li>
              <li>• Constant power and data even for an empty room — 720p30 is roughly 27 MB/s.</li>
            </ul>
          </article>
          <article className="panel glow-ring p-6">
            <h3 className="text-lg font-semibold text-primary">Event (retina) camera</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Each pixel signals only change in light, like a retinal ON/OFF cell.</li>
              <li>• Every event is (x, y, timestamp, polarity) — asynchronous and sparse.</li>
              <li>• A still scene produces almost no output; bandwidth scales with motion.</li>
            </ul>
          </article>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Even so, event cameras are complementary rather than a replacement: event data wins on
          motion and timing, frame data still wins on spatial and colour detail. And the retina is
          still far ahead — around 20 specialised ganglion cell types with rich spatial processing,
          against the single change-detection trick silicon copies today.
        </p>

        <div className="panel mt-10 flex flex-wrap items-center gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            This site is built around a student presentation on event-based vision — slides included.
          </p>
          <Link
            to="/presentation"
            className="ml-auto rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            View the presentation
          </Link>
        </div>
      </section>


      <SiteFooter />
    </div>
  );
}
