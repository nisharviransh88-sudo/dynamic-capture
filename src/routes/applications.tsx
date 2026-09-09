import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Where Event Cameras Are Used — Applications" },
      {
        name: "description",
        content:
          "Drone flight, visual SLAM, driver monitoring, pedestrian detection, object recognition and space debris tracking with retina-inspired event cameras.",
      },
      { property: "og:title", content: "Where Event Cameras Are Used — Applications" },
      {
        property: "og:description",
        content:
          "Six proven application areas for event-based vision, plus measured results and future prospects.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplicationsPage,
});

const apps: Array<[string, string[]]> = [
  [
    "1. High-speed robotics & drone control",
    [
      "Vision-based state estimation for fast flight",
      "Deep learning for obstacle avoidance (learning high-speed flight in the wild)",
      "Trajectory planning through narrow spaces",
      "Perception-aware model predictive control (PAMPC)",
      "Sim-to-real transfer for agile flight",
    ],
  ],
  [
    "2. Visual SLAM & navigation",
    [
      "ORB-SLAM style camera-based mapping",
      "Feature matching between frames",
      "Loop closure — recognising revisited places",
      "Fusing camera with motion sensors (IMU)",
      "Removing moving objects from the map",
    ],
  ],
  [
    "3. Driver monitoring — face, eye and blink tracking",
    [
      "Facial landmark detection with Dlib or MediaPipe models",
      "Eye Aspect Ratio (EAR) for blink detection from landmark geometry",
      "CNN-based drowsiness classification on eye-region images",
    ],
  ],
  [
    "4. Autonomous driving — pedestrian detection",
    [
      "Deep CNN detectors: Faster R-CNN, YOLO and SSD for real-time localisation",
      "Multi-sensor fusion of camera, LiDAR and radar for low-light and occlusion",
      "Speed-accuracy trade-offs with lightweight models on in-vehicle edge hardware",
    ],
  ],
  [
    "5. Object detection & recognition",
    [
      "Driving: pedestrians, vehicles and traffic signs in real time",
      "Medical imaging: tumours and lesions in CT, MRI and X-ray",
      "Video surveillance: intrusion detection, crowd monitoring, activity tracking",
    ],
  ],
  [
    "6. Space situational awareness",
    [
      "Telescope-mounted event sensors tracking satellites and debris",
      "Objects detected from LEO all the way to GEO orbits",
      "Works in daylight as well as at night — very hard for conventional CCDs",
      "Low data rate, low power and high speed suit space hardware constraints",
    ],
  ],
];

const results = [
  ["< 5 ms", "end-to-end latency for event-based drone navigation (IoU 0.78–0.83), with up to 20% less flight time than depth-only pipelines", "Sanyal et al., 2025"],
  ["AUC ≈ 0.79", "object-tracking accuracy for event-based traffic monitoring using a 0.1M-parameter CNN, inside a sub-1 mW power budget suitable for IoT", "Mohan et al., 2020"],
  ["5,000 fps-equivalent", "latency from fusing a 20 fps RGB camera with an event stream — using only the bandwidth of a 45 fps camera", "Gehrig & Scaramuzza, Nature, 2024"],
];

const future = [
  ["Autonomous vehicles", "High temporal resolution catches fast-moving objects and sudden traffic changes, handles extreme lighting shifts, and fuses with conventional cameras for reliable perception."],
  ["UAVs (drones)", "Indoor navigation where GNSS is unreliable, motion-blur resistance for rapid manoeuvres, and real-time pose estimation when paired with IMU and visual-inertial odometry."],
  ["Smart surveillance", "Detects rapid movement, accidents and suspicious activity in poor lighting — well suited to public spaces, transport hubs, hospitals and smart cities."],
];

function ApplicationsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-4xl font-semibold">Where this sensor wins</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Event cameras are not a replacement for photography — they are a replacement for watching.
          Anywhere a machine stares at a scene waiting for something to move, the retina approach
          costs less and reacts faster.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {apps.map(([t, points]) => (
            <article key={t} className="panel p-5">
              <h2 className="font-semibold text-primary">{t}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {points.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Measured results</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {results.map(([k, d, src]) => (
            <div key={k} className="panel p-5">
              <p className="font-display text-2xl font-semibold text-primary">{k}</p>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">{src}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Future prospects</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {future.map(([t, d]) => (
            <div key={t} className="panel p-5">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <div className="panel glow-ring mt-12 flex flex-wrap items-center gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            Try it on your own scene — the lab measures the savings live.
          </p>
          <Link
            to="/camera"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Open the live lab
          </Link>
          <Link
            to="/presentation"
            className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            View the slides
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
