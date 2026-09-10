import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CircleStop,
  Download,
  Gauge,
  Play,
  Radio,
  RefreshCw,
  Square,
  Upload,
  Video,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { formatBytes, powerModel, renderEventFrame, type EventStats } from "@/lib/event-camera";

type Source = "webcam" | "file";
type ColorMode = "polarity" | "mono" | "heat";

const W = 480;
const H = 360;

export function EventCameraLab() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rawRef = useRef<HTMLCanvasElement | null>(null);
  const eventRef = useRef<HTMLCanvasElement | null>(null);
  const workRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<{
    w: CanvasRenderingContext2D | null;
    r: CanvasRenderingContext2D | null;
    e: CanvasRenderingContext2D | null;
  }>({ w: null, r: null, e: null });
  const statsRef = useRef<EventStats>({
    onEvents: 0,
    offEvents: 0,
    pixels: W * H,
    activityRatio: 0,
  });
  const lastUiRef = useRef(0);
  const prevLogRef = useRef<Float32Array>(new Float32Array(W * H));
  const outRef = useRef<ImageData | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const lastTickRef = useRef<number>(0);
  const fpsRef = useRef<number>(30);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastClickRef = useRef(0);

  const [source, setSource] = useState<Source>("webcam");
  const [running, setRunning] = useState(false);
  const [threshold, setThreshold] = useState(0.09);
  const [decay, setDecay] = useState(0.55);
  const [colorMode, setColorMode] = useState<ColorMode>("polarity");
  const [recording, setRecording] = useState<"none" | "event" | "raw">("none");
  const [status, setStatus] = useState("Camera idle");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [soundOn, setSoundOn] = useState(false);
  const [stats, setStats] = useState<EventStats>({
    onEvents: 0,
    offEvents: 0,
    pixels: W * H,
    activityRatio: 0,
  });
  const [fps, setFps] = useState(0);
  const [shots, setShots] = useState<{ url: string; label: string }[]>([]);

  const settings = useRef({ threshold, decay, colorMode, soundOn });
  settings.current = { threshold, decay, colorMode, soundOn };

  const playClick = useCallback((intensity: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 850 + intensity * 700;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(Math.min(0.18, 0.05 + intensity * 0.12), now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }, []);

  const toggleSound = useCallback(async () => {
    if (!soundOn) {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
      }
      setSoundOn(true);
    } else {
      setSoundOn(false);
    }
  }, [soundOn]);

  const stopEverything = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording("none");
    setRunning(false);
    setStatus("Camera idle");
  }, []);

  useEffect(() => () => stopEverything(), [stopEverything]);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const work = workRef.current;
    const raw = rawRef.current;
    const evt = eventRef.current;
    if (!video || !work || !raw || !evt) return;

    if (video.readyState >= 2) {
      if (!ctxRef.current.w) {
        ctxRef.current = {
          w: work.getContext("2d", { willReadFrequently: true }),
          r: raw.getContext("2d"),
          e: evt.getContext("2d"),
        };
      }
      const { w: wctx, r: rctx, e: ectx } = ctxRef.current;
      if (wctx && rctx && ectx) {
        wctx.drawImage(video, 0, 0, W, H);
        rctx.drawImage(video, 0, 0, W, H);
        const frame = wctx.getImageData(0, 0, W, H);
        if (!outRef.current) outRef.current = ectx.createImageData(W, H);
        const s = renderEventFrame(frame, prevLogRef.current, outRef.current, {
          threshold: settings.current.threshold,
          decay: settings.current.decay,
          colorMode: settings.current.colorMode,
          background: "black",
        });
        ectx.putImageData(outRef.current, 0, 0);
        // Smooth the readouts instead of jittering every frame.
        const prevS = statsRef.current;
        statsRef.current = {
          onEvents: prevS.onEvents * 0.8 + s.onEvents * 0.2,
          offEvents: prevS.offEvents * 0.8 + s.offEvents * 0.2,
          pixels: s.pixels,
          activityRatio: prevS.activityRatio * 0.8 + s.activityRatio * 0.2,
        };

        // Audible "click" per burst of activity — rate scales with how much changed,
        // like a Geiger counter, so quiet scenes stay silent.
        if (settings.current.soundOn) {
          const activity = s.activityRatio;
          const minActivity = 0.003;
          if (activity > minActivity) {
            const clicksPerSec = Math.min(18, 2 + activity * 350);
            const minGap = 1000 / clicksPerSec;
            const now = performance.now();
            if (now - lastClickRef.current > minGap) {
              lastClickRef.current = now;
              playClick(Math.min(1, activity * 15));
            }
          }
        }
      }
    }

    const now = performance.now();
    if (lastTickRef.current) {
      const inst = 1000 / Math.max(1, now - lastTickRef.current);
      fpsRef.current = fpsRef.current * 0.9 + inst * 0.1;
    }
    lastTickRef.current = now;

    // Only touch React state a few times a second — re-rendering the whole
    // panel at 60 fps is what made the numbers feel laggy.
    if (now - lastUiRef.current > 250) {
      lastUiRef.current = now;
      setStats(statsRef.current);
      setFps(fpsRef.current);
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);


  const startWebcam = useCallback(async () => {
    try {
      setStatus("Requesting camera…");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: { ideal: facingMode } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      v.muted = true;
      await v.play();
      setSource("webcam");
      setRunning(true);
      setStatus(`Live · webcam (${facingMode === "user" ? "front" : "back"})`);
      prevLogRef.current = new Float32Array(W * H);
      outRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setStatus("Camera access blocked — allow it in your browser, or upload a video instead.");
    }
  }, [loop, facingMode]);

  const flipCamera = useCallback(async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    if (!(running && source === "webcam")) return;
    try {
      setStatus("Switching camera…");
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: { ideal: next } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      v.muted = true;
      await v.play();
      setStatus(`Live · webcam (${next === "user" ? "front" : "back"})`);
    } catch {
      setStatus("Couldn't switch camera — this device may only have one.");
    }
  }, [facingMode, running, source]);

  const onUpload = useCallback(
    async (file: File) => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const v = videoRef.current!;
      v.srcObject = null;
      v.src = URL.createObjectURL(file);
      v.loop = true;
      v.muted = true;
      await v.play();
      setSource("file");
      setRunning(true);
      setStatus(`Playing · ${file.name}`);
      prevLogRef.current = new Float32Array(W * H);
      outRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    },
    [loop],
  );

  const snapshot = useCallback(() => {
    const raw = rawRef.current;
    const evt = eventRef.current;
    if (!raw || !evt) return;
    const c = document.createElement("canvas");
    c.width = W * 2 + 12;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(raw, 0, 0);
    ctx.drawImage(evt, W + 12, 0);
    const url = c.toDataURL("image/png");
    setShots((prev) => [{ url, label: new Date().toLocaleTimeString() }, ...prev].slice(0, 6));
  }, []);

  const toggleRecord = useCallback(
    (which: "event" | "raw") => {
      if (recording !== "none") {
        recorderRef.current?.stop();
        return;
      }
      const canvas = which === "event" ? eventRef.current : rawRef.current;
      if (!canvas) return;
      const stream = canvas.captureStream(30);
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${which}-camera-${Date.now()}.webm`;
        a.click();
        setRecording("none");
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(which);
    },
    [recording],
  );

  const power = powerModel(stats.activityRatio, Math.max(1, Math.round(fps)), W * H);

  return (
    <div className="space-y-6">
      <video ref={videoRef} className="hidden" playsInline />
      <canvas ref={workRef} width={W} height={H} className="hidden" />

      {/* Controls */}
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <button
          onClick={running && source === "webcam" ? stopEverything : startWebcam}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {running && source === "webcam" ? <CircleStop size={16} /> : <Play size={16} />}
          {running && source === "webcam" ? "Stop camera" : "Start live camera"}
        </button>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-muted">
          <Upload size={16} /> Upload a video
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </label>

        <button
          onClick={snapshot}
          disabled={!running}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
        >
          <Camera size={16} /> Take photo
        </button>

        <button
          onClick={() => toggleRecord("event")}
          disabled={!running}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
        >
          {recording !== "none" ? <Square size={16} /> : <Video size={16} />}
          {recording !== "none" ? "Stop recording" : "Record event video"}
        </button>

        <button
          onClick={flipCamera}
          disabled={!(running && source === "webcam")}
          title="Switch between front and back camera"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
        >
          <RefreshCw size={16} /> Flip camera
        </button>

        <button
          onClick={toggleSound}
          title="Play a click for each burst of event activity"
          className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition ${
            soundOn
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-secondary hover:bg-muted"
          }`}
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {soundOn ? "Sound on" : "Sound off"}
        </button>

        <span className="ml-auto inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Radio size={14} className={running ? "text-primary spark" : "text-muted-foreground"} />
          {status} · {fps.toFixed(0)} fps
        </span>
      </div>

      {/* Views */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ViewCard title="Normal camera" subtitle="Every pixel, every frame">
          <canvas ref={rawRef} width={W} height={H} className="h-auto w-full rounded-lg bg-black" />
        </ViewCard>
        <ViewCard title="Event camera" subtitle="Only pixels that changed" accent>
          <canvas
            ref={eventRef}
            width={W}
            height={H}
            className="h-auto w-full rounded-lg bg-black"
          />
        </ViewCard>
      </div>

      {/* Tuning */}
      <div className="panel grid gap-6 p-5 md:grid-cols-3">
        <Slider
          label="Contrast sensitivity"
          value={threshold}
          min={0.02}
          max={0.35}
          step={0.01}
          onChange={setThreshold}
          hint="Lower = more events, like a dark-adapted eye"
        />
        <Slider
          label="Event persistence"
          value={decay}
          min={0}
          max={0.92}
          step={0.02}
          onChange={setDecay}
          hint="How long a spike stays visible"
        />
        <div>
          <p className="text-sm font-medium">Event colouring</p>
          <div className="mt-3 flex gap-2">
            {(["polarity", "mono", "heat"] as ColorMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setColorMode(m)}
                className={`rounded-md border px-3 py-1.5 text-xs capitalize transition ${
                  colorMode === m
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:bg-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Cyan = brightening (ON), amber = darkening (OFF).
          </p>
        </div>
      </div>

      {/* Telemetry */}
      <div className="grid gap-4 md:grid-cols-4">
        <Metric
          icon={<Zap size={16} />}
          label="Power saved"
          value={`${power.savedPercent.toFixed(1)}%`}
          sub={`${power.eventPower.toFixed(0)} mW vs ${power.framePower.toFixed(0)} mW`}
          highlight
        />
        <Metric
          icon={<Gauge size={16} />}
          label="Sensor activity"
          value={`${(stats.activityRatio * 100).toFixed(2)}%`}
          sub={`${Math.round(stats.onEvents + stats.offEvents).toLocaleString()} events / frame`}
        />
        <Metric
          icon={<Radio size={16} />}
          label="Data rate"
          value={formatBytes(power.eventBytesPerSec)}
          sub={`${formatBytes(power.frameBytesPerSec)} for frames · ${power.dataReduction.toFixed(0)}× less`}
        />
        <Metric
          icon={<Zap size={16} />}
          label="ON / OFF balance"
          value={`${Math.round(stats.onEvents).toLocaleString()} / ${Math.round(stats.offEvents).toLocaleString()}`}
          sub="Brightening vs darkening spikes"
        />
      </div>

      {/* Power bar */}
      <div className="panel p-5">
        <p className="text-sm font-medium">Energy per second of vision</p>
        <div className="mt-4 space-y-3">
          <Bar label="Normal camera" value={power.framePower} max={power.framePower} tone="muted" />
          <Bar label="Event camera" value={power.eventPower} max={power.framePower} tone="primary" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Modelled from the fraction of pixels that actually changed — the same principle that lets
          the retina run your vision on roughly the power of a dim LED.
        </p>
      </div>

      {shots.length > 0 && (
        <div className="panel p-5">
          <p className="text-sm font-medium">Captured photos</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {shots.map((s) => (
              <figure key={s.url.slice(-24)} className="space-y-2">
                <img src={s.url} alt={`Comparison capture at ${s.label}`} className="rounded-lg" />
                <figcaption className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.label}</span>
                  <a
                    href={s.url}
                    download={`event-capture-${s.label}.png`}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Download size={12} /> Download
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ViewCard({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`panel p-4 ${accent ? "glow-ring" : ""}`}>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className={`text-base font-semibold ${accent ? "text-primary" : ""}`}>{title}</h3>
        <span className="font-mono text-[11px] text-muted-foreground">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">{label}</p>
        <span className="font-mono text-xs text-primary">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[oklch(0.82_0.14_197)]"
      />
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`panel p-4 ${highlight ? "glow-ring" : ""}`}>
      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </p>
      <p
        className={`mt-2 font-display text-2xl font-semibold ${highlight ? "text-gradient" : ""}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "muted" | "primary";
}) {
  const pct = Math.max(2, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(0)} mW</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: tone === "primary" ? "var(--grad-pulse)" : "var(--muted-foreground)",
          }}
        />
      </div>
    </div>
  );
}
