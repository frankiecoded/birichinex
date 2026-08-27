// ============================================
// Live call audio codecs.
//
// Twilio Media Streams carry G.711 μ-law audio at 8kHz (8-bit samples).
// The Gemini Live API accepts raw 16-bit little-endian PCM at 16kHz and
// returns 16-bit little-endian PCM at 24kHz. This module bridges the two:
// μ-law <-> PCM conversion and linear interpolation resampling.
// ============================================

const BIAS = 0x84;
const CLIP = 32635;

// Segment end points for μ-law encoding (ascending), per the Sun/sox/audioop
// G.711 reference implementation.
const SEG_UEND = [0x3f, 0x7f, 0xff, 0x1ff, 0x3ff, 0x7ff, 0xfff, 0x1fff];

// Precomputed μ-law -> 16-bit linear decode table (audioop.ulaw2lin).
const ULAW_TO_LIN: Int16Array = (() => {
  const table = new Int16Array(256);
  for (let u = 0; u < 256; u++) {
    const inv = (~u) & 0xff;
    let t = ((inv & 0x0f) << 3) + BIAS;
    t <<= (inv & 0x70) >> 4;
    table[u] = (inv & 0x80) ? (BIAS - t) : (t - BIAS);
  }
  return table;
})();

/** Decode μ-law bytes (8kHz) into 16-bit linear PCM samples. */
export function ulawToPcm16(input: Buffer | Uint8Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = ULAW_TO_LIN[input[i]];
  return out;
}

function linearToUlaw(pcm: number): number {
  let val = pcm >> 2;
  let mask = 0xff;
  if (val < 0) {
    val = -val;
    mask = 0x7f;
  }
  if (val > CLIP) val = CLIP;
  val += BIAS >> 2;

  const seg = SEG_UEND.findIndex((t) => val <= t);
  if (seg < 0 || seg >= 8) return (0x7f ^ mask) & 0xff;
  return (((seg << 4) | ((val >> (seg + 1)) & 0x0f)) ^ mask) & 0xff;
}

/** Encode 16-bit linear PCM samples into μ-law bytes (8kHz). */
export function pcm16ToUlaw(input: Int16Array | Buffer): Buffer {
  const out = Buffer.alloc(input.length);
  for (let i = 0; i < input.length; i++) out[i] = linearToUlaw(input[i]);
  return out;
}

export interface Resampler {
  (input: Int16Array): Int16Array;
  reset(): void;
}

/**
 * Linear-interpolation resampler with continuous state across chunks.
 * `fromRate` is the source sample rate, `toRate` the target sample rate.
 */
export function createResampler(fromRate: number, toRate: number): Resampler {
  const step = fromRate / toRate;
  let pos = 0;
  let inputIndex = 0;
  let prev = 0;
  let prevSet = false;

  const resampler = (input: Int16Array): Int16Array => {
    if (input.length === 0) return new Int16Array(0);
    const out: number[] = [];
    for (let i = 0; i < input.length; i++, inputIndex++) {
      const cur = input[i];
      if (!prevSet) {
        prev = cur;
        prevSet = true;
      }
      while (pos <= inputIndex) {
        let f = pos - (inputIndex - 1);
        if (f < 0) f = 0;
        if (f > 1) f = 1;
        out.push(Math.round(prev + (cur - prev) * f));
        pos += step;
      }
      prev = cur;
    }
    return Int16Array.from(out);
  };

  resampler.reset = () => {
    pos = 0;
    inputIndex = 0;
    prev = 0;
    prevSet = false;
  };

  return resampler;
}

/** Helper to build an Int16Array directly from base64-encoded little-endian PCM. */
export function decodePcm16Base64(base64: string): Int16Array {
  const buf = Buffer.from(base64, "base64");
  const out = new Int16Array(buf.byteLength / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = buf.readInt16LE(i * 2);
  }
  return out;
}
