/* Synchronous SHA-256 used to store account passwords hashed instead of plaintext.
   Web Crypto's SubtleCrypto is async-only, but the store's auth actions are
   synchronous, so a compact pure-JS implementation is used.

   Password formats:
   - "s1$" + hex digest of sha256(domainSalt + ":" + emailSalt + ":" + password)
     Legacy format (pre-salt-kitchen-sink). Still verified for backward compat.
   - "s2$" + randomSalt$ + hex digest of
     sha256(domainSalt + ":" + emailSalt + ":" + randomSalt + ":" + password)
     Current format. Per-account random salt means identical passwords hash
     differently, and legacy s1 hashes are upgraded in place on next login.

   One-time credentials (2FA codes, recovery codes) are stored via
   hashCredential/verifyCredential ("c$" + sha256Hex(domainSalt + ":cred:" + value))
   instead of plaintext.

   Legacy plaintext records are still verified and upgraded on use. */

const ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

export function sha256Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const paddedLen = (bytes.length + 9 + 63) & ~63;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes, 0);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000));
  view.setUint32(paddedLen - 4, bitLen >>> 0);

  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  const state = new Uint32Array(8);

  for (let off = 0; off < paddedLen; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    for (let i = 0; i < 8; i++) state[i] = h[i];
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(state[4], 6) ^ rotr(state[4], 11) ^ rotr(state[4], 25);
      const ch = (state[4] & state[5]) ^ (~state[4] & state[6]);
      const temp1 = (state[7] + S1 + ch + ROUND_CONSTANTS[i] + w[i]) | 0;
      const S0 = rotr(state[0], 2) ^ rotr(state[0], 13) ^ rotr(state[0], 22);
      const maj = (state[0] & state[1]) ^ (state[0] & state[2]) ^ (state[1] & state[2]);
      const temp2 = (S0 + maj) | 0;
      state[7] = state[6];
      state[6] = state[5];
      state[5] = state[4];
      state[4] = (state[3] + temp1) | 0;
      state[3] = state[2];
      state[2] = state[1];
      state[1] = state[0];
      state[0] = (temp1 + temp2) | 0;
    }
    for (let i = 0; i < 8; i++) h[i] = (h[i] + state[i]) | 0;
  }

  let out = "";
  for (let i = 0; i < 8; i++) out += (h[i] >>> 0).toString(16).padStart(8, "0");
  return out;
}

const DOMAIN_SALT = "birichi-nex::acct/v1";

function randomSalt(): string {
  try {
    const bytes = new Uint8Array(8);
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 8; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
  }
}

export function isHashedPassword(stored: string): boolean {
  return stored.startsWith("s1$") || stored.startsWith("s2$");
}

export function hashPassword(password: string, accountSalt: string): string {
  const salt = randomSalt();
  return `s2$${salt}$${sha256Hex(`${DOMAIN_SALT}:${accountSalt.trim().toLowerCase()}:${salt}:${password}`)}`;
}

export function verifyPassword(password: string, accountSalt: string, stored: string): boolean {
  if (stored.startsWith("s2$")) {
    const parts = stored.split("$");
    if (parts.length !== 3) return false;
    const [, salt, hash] = parts;
    return sha256Hex(`${DOMAIN_SALT}:${accountSalt.trim().toLowerCase()}:${salt}:${password}`) === hash;
  }
  if (stored.startsWith("s1$")) {
    return stored === "s1$" + sha256Hex(`${DOMAIN_SALT}:${accountSalt.trim().toLowerCase()}:${password}`);
  }
  return false;
}

export function isHashedCredential(stored: string): boolean {
  return stored.startsWith("c$");
}

export function hashCredential(value: string): string {
  return "c$" + sha256Hex(`${DOMAIN_SALT}:cred:${value}`);
}

export function verifyCredential(value: string, stored: string): boolean {
  if (stored.startsWith("c$")) {
    return stored === hashCredential(value);
  }
  return stored === value;
}