// ============================================
// Client-side live audio codecs for the in-app Gemini voice chat.
//
// Mirrors the server codecs in ai/src/live-audio.ts. The browser mic produces
// Float32 audio at the AudioContext sample rate; Gemini Live wants 16-bit
// little-endian PCM at 16kHz. Inbound server audio is already 16-bit PCM at
// 16kHz, which we convert back to Float32 for playback.
// ============================================

export function float32ToPcm16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export function pcm16ToFloat32(input: Int16Array): Float32Array {
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = input[i] / 0x8000;
  return out;
}

export interface Resampler16 {
  (input: Int16Array): Int16Array;
  reset(): void;
}

/**
 * Linear-interpolation resampler with continuous state across chunks.
 * `fromRate` is the source sample rate, `toRate` the target sample rate.
 */
export function createResampler16(fromRate: number, toRate: number): Resampler16 {
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

/** Encode little-endian PCM16 samples as base64. */
export function pcm16Base64Encode(input: Int16Array): string {
  const bytes = new Uint8Array(input.length * 2);
  for (let i = 0; i < input.length; i++) {
    const v = input[i];
    bytes[i * 2] = v & 0xff;
    bytes[i * 2 + 1] = (v >> 8) & 0xff;
  }
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(binary);
}

/** Decode base64 into little-endian PCM16 samples. */
export function pcm16Base64Decode(base64: string): Int16Array {
  const binary = atob(base64);
  const out = new Int16Array(binary.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
  }
  return out;
}