import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "How Event Cameras Work — From Retina to Silicon" },
      {
        name: "description",
        content:
          "Photoreceptors, ON/OFF pathways, ganglion spikes and the pixel circuit behind event cameras — plus the research timeline from the 1991 silicon retina to today.",
      },
      { property: "og:title", content: "How Event Cameras Work — From Retina to Silicon" },
      {
        property: "og:description",
        content:
          "Retina biology, event-pixel circuitry, dynamic range, power figures and the milestones of event-based vision research.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SciencePage,
});

const retina = [
  ["Photoreceptors", "Rods and cones absorb photons and turn them into a graded voltage signal."],
  ["Horizontal cells", "Sharpen contrast through lateral feedback across neighbouring receptors."],
  ["Bipolar cells", "Split the signal into ON and OFF pathways — brighter versus darker."],
  ["Amacrine cells", "Add temporal processing, emphasising how fast the light is changing."],
  ["Ganglion cells", "Convert everything into spikes sent down the optic nerve."],
  ["Adaptation", "Sensitivity re-tunes over time, so the eye works in sun and in shadow."],
];

const silicon = [
  {
    n: "01",
    t: "Photoreceptor stage",
    d: "A photodiode converts light into current with a logarithmic response, which is where the huge dynamic range comes from.",
  },
  {
    n: "02",
    t: "Change stage",
    d: "A circuit continuously compares the current signal with the last value that pixel recorded.",
  },
  {
    n: "03",
    t: "Comparator stage",
    d: "If the change crosses a contrast threshold, the pixel fires an ON or OFF event — nothing else on the chip is disturbed.",
  },
  {
    n: "04",
    t: "Output",
    d: "Each event is (x, y, timestamp, polarity): asynchronous, sparse, and timestamped to the microsecond. There are no frames.",
  },
];

const timeline = [
  ["1991–92", "Silicon retina", "Mahowald & Mead (Caltech) build the first analog silicon retina."],
  ["2008", "DVS128", "Lichtsteiner, Posch & Delbruck publish the first 128×128 asynchronous DVS — 120 dB, 15 µs latency."],
  ["2011", "ATIS", "Posch, Matolin & Wohlgenannt add time-based intensity readout, 143 dB dynamic range."],
  ["2014", "DAVIS", "Brandli et al. combine DVS events with global-shutter frames — 130 dB, 3 µs latency."],
  ["2017", "640×480 DVS", "Son et al. (Samsung/ISSCC) reach a 9 µm pixel and 300 MEPS readout."],
  ["2019", "Field survey", "Gallego et al. publish the field-defining “Event-Based Vision” survey."],
  ["2020", "HD stacked sensor", "Finateu et al. (Prophesee/Sony) ship a 1280×720 back-illuminated stacked sensor."],
  ["2025", "State-of-the-art review", "Cimarelli et al. review hardware, algorithms and applications across the field."],
];

const stats = [
  ["Dynamic range", "120–143 dB", "~60–70 dB"],
  ["Temporal resolution", "Microsecond-level", "Frame-limited (30–60 fps)"],
  ["Power consumption", "10–100 mW", "1–3.5 W"],
  ["Data bandwidth", "~0 on a static scene", "~27 MB/s (1280×720 @ 30 fps)"],
];

function SciencePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="text-4xl font-semibold">From retina to silicon</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The core idea is one line long: the retina detects <em>change</em> in light, not absolute
          brightness. ON cells fire when light increases, OFF cells when it decreases, and contrast
          and edges are picked out before the signal ever reaches the brain.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">How the retina works</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {retina.map(([t, d]) => (
            <div key={t} className="panel p-5">
              <h3 className="font-semibold text-primary">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Working of an event-based camera</h2>
        <ol className="mt-5 space-y-4">
          {silicon.map((s) => (
            <li key={s.n} className="panel flex gap-5 p-6">
              <span className="font-mono text-sm text-primary">{s.n}</span>
              <div>
                <h3 className="text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-14 text-2xl font-semibold">The numbers</h2>
        <div className="panel mt-5 overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Metric</th>
                <th className="px-4 py-3 font-medium text-primary">Event camera</th>
                <th className="px-4 py-3 font-medium">Conventional camera</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(([m, e, c]) => (
                <tr key={m} className="border-t border-border/70">
                  <td className="px-4 py-3">{m}</td>
                  <td className="px-4 py-3 font-mono text-primary">{e}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          A static scene generates essentially zero output: bandwidth scales with actual motion,
          unlike a frame camera that streams constantly regardless of what is in front of it. For
          scale, one human eye has about 100 million photoreceptors feeding roughly 1 million
          ganglion cells — the same compression trick, in wetware.
        </p>

        <h2 className="mt-14 text-2xl font-semibold">Pros and cons</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="panel p-5">
            <h3 className="font-semibold text-primary">Pros</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Ultra-low latency — microsecond response.</li>
              <li>• Extremely high dynamic range, up to 120–143 dB.</li>
              <li>• Low power and bandwidth — only changed pixels emit data.</li>
              <li>• No motion blur, thanks to asynchronous per-pixel operation.</li>
              <li>• Ideal for high-speed tracking: drones, particles, robotics.</li>
            </ul>
          </div>
          <div className="panel p-5">
            <h3 className="font-semibold text-accent">Cons</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• No absolute intensity or colour in pure DVS mode.</li>
              <li>• Adding intensity readout doubles pixel size and raises latency (ATIS).</li>
              <li>• Data is hard to compress — it does not fit standard video codecs.</li>
              <li>• Immature software ecosystem; legacy computer vision does not transfer.</li>
              <li>• Expensive, niche, and noisy in low-contrast or flickering scenes.</li>
            </ul>
          </div>
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Research timeline</h2>
        <ol className="mt-5 space-y-3">
          {timeline.map(([y, t, d]) => (
            <li key={y} className="panel flex flex-col gap-1 p-5 sm:flex-row sm:gap-5">
              <span className="font-mono text-sm text-primary sm:w-24 sm:shrink-0">{y}</span>
              <div>
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="panel glow-ring mt-12 flex flex-wrap items-center gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            Every section here is drawn from the project presentation.
          </p>
          <Link
            to="/presentation"
            className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            View the slides
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
