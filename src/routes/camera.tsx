import { createFileRoute } from "@tanstack/react-router";
import { EventCameraLab } from "@/components/EventCameraLab";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/camera")({
  head: () => ({
    meta: [
      { title: "Live Event Camera Lab — Normal vs Event Vision" },
      {
        name: "description",
        content:
          "Run your webcam or upload a video and watch a normal camera and a simulated event camera side by side, with live power and data savings.",
      },
      { property: "og:title", content: "Live Event Camera Lab — Normal vs Event Vision" },
      {
        property: "og:description",
        content:
          "Capture photos and videos from a simulated retina-inspired event camera and compare energy use with a normal camera.",
      },
    ],
  }),
  component: CameraPage,
});

function CameraPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="text-4xl font-semibold">Live camera lab</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Start your camera or drop in a video. The left panel is an ordinary camera; the right one
          runs a retina-style event sensor over the same light, spiking only where brightness
          changes. Wave your hand to fill it with spikes, then hold still and watch it go quiet.
        </p>
        <div className="mt-10">
          <EventCameraLab />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
