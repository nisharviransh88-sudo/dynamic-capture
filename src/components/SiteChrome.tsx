import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/camera", label: "Live lab" },
  { to: "/science", label: "How it works" },
  { to: "/applications", label: "Applications" },
  { to: "/presentation", label: "Presentation" },
] as const;


export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Eye size={18} />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            RETINA<span className="text-primary">/</span>SENSE
          </span>
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>RETINA/SENSE — a browser simulation of neuromorphic event vision.</p>
        <p className="font-mono">Power and data figures are modelled estimates, not measurements.</p>
      </div>
    </footer>
  );
}
