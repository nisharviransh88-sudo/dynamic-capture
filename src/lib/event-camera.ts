export type EventStats = {
  onEvents: number;
  offEvents: number;
  pixels: number;
  activityRatio: number;
};

/**
 * Convert a grayscale-log-intensity difference between two frames into a
 * sparse ON/OFF event image, the way a real event (neuromorphic) sensor does.
 */
export function renderEventFrame(
  current: ImageData,
  prevLog: Float32Array,
  out: ImageData,
  opts: {
    threshold: number; // contrast sensitivity (log units)
    decay: number; // 0..1 persistence of older events
    colorMode: "polarity" | "mono" | "heat";
    background: "black" | "grey";
  },
): EventStats {
  const src = current.data;
  const dst = out.data;
  const n = current.width * current.height;
  let onEvents = 0;
  let offEvents = 0;

  const bgVal = opts.background === "grey" ? 26 : 8;
  const keep = Math.max(0, Math.min(0.95, opts.decay));

  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const lum = 0.299 * src[p]! + 0.587 * src[p + 1]! + 0.114 * src[p + 2]!;
    const logI = Math.log(lum + 8);
    const prev = prevLog[i]!;
    const diff = prev === 0 ? 0 : logI - prev;
    prevLog[i] = logI;

    // fade existing event image
    dst[p] = bgVal + (dst[p]! - bgVal) * keep;
    dst[p + 1] = bgVal + (dst[p + 1]! - bgVal) * keep;
    dst[p + 2] = bgVal + (dst[p + 2]! - bgVal) * keep;
    dst[p + 3] = 255;

    if (diff > opts.threshold) {
      onEvents++;
      paint(dst, p, 1, Math.min(1, diff / (opts.threshold * 4)), opts.colorMode);
    } else if (diff < -opts.threshold) {
      offEvents++;
      paint(dst, p, -1, Math.min(1, -diff / (opts.threshold * 4)), opts.colorMode);
    }
  }

  return {
    onEvents,
    offEvents,
    pixels: n,
    activityRatio: (onEvents + offEvents) / n,
  };
}

function paint(
  dst: Uint8ClampedArray,
  p: number,
  polarity: 1 | -1,
  strength: number,
  mode: "polarity" | "mono" | "heat",
) {
  const s = 0.45 + 0.55 * strength;
  if (mode === "mono") {
    const v = 245 * s;
    dst[p] = v;
    dst[p + 1] = v;
    dst[p + 2] = v;
    return;
  }
  if (mode === "heat") {
    dst[p] = 255 * s;
    dst[p + 1] = 120 * s * (polarity > 0 ? 1.4 : 0.5);
    dst[p + 2] = 40 * s;
    return;
  }
  if (polarity > 0) {
    dst[p] = 40 * s;
    dst[p + 1] = 225 * s;
    dst[p + 2] = 255 * s;
  } else {
    dst[p] = 255 * s;
    dst[p + 1] = 165 * s;
    dst[p + 2] = 45 * s;
  }
}

/**
 * Rough energy model. A frame camera pays for every pixel of every frame;
 * an event camera only pays for pixels that changed (plus a small idle draw).
 */
export function powerModel(activityRatio: number, fps: number, pixels: number) {
  const megaPixelsPerSecond = (pixels * fps) / 1e6;
  // ~mW figures in the ballpark of published CMOS / DVS sensor numbers
  const framePower = 15 + megaPixelsPerSecond * 45;
  const eventPower = 3 + megaPixelsPerSecond * activityRatio * 45;
  const saved = Math.max(0, 1 - eventPower / framePower);

  const frameBytesPerSec = pixels * fps * 1.5; // YUV420 raw
  const eventBytesPerSec = pixels * fps * activityRatio * 8; // 8 bytes / event (x,y,t,p)

  return {
    framePower,
    eventPower,
    savedPercent: saved * 100,
    frameBytesPerSec,
    eventBytesPerSec,
    dataReduction: frameBytesPerSec / Math.max(1, eventBytesPerSec),
  };
}

export function formatBytes(bytesPerSec: number) {
  if (bytesPerSec > 1e6) return `${(bytesPerSec / 1e6).toFixed(1)} MB/s`;
  if (bytesPerSec > 1e3) return `${(bytesPerSec / 1e3).toFixed(0)} kB/s`;
  return `${bytesPerSec.toFixed(0)} B/s`;
}
