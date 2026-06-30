// HMAC-SHA256 session tokens — Web Crypto only, works in Edge Runtime + Node.js

const ALG = { name: "HMAC", hash: "SHA-256" } as const;

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET ?? "dev-secret-not-for-production";
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), ALG, false, [
    "sign",
    "verify",
  ]);
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): ArrayBuffer {
  const pairs = hex.match(/.{2}/g);
  if (!pairs) return new ArrayBuffer(0);
  const buf = new ArrayBuffer(pairs.length);
  const view = new DataView(buf);
  pairs.forEach((b, i) => view.setUint8(i, parseInt(b, 16)));
  return buf;
}

export async function signSessionToken(email: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
  const payload = `${email}|${expires}`;
  const encoded = btoa(payload);
  const key = await getKey(getSecret());
  const sig = await crypto.subtle.sign(ALG, key, new TextEncoder().encode(encoded));
  return `${encoded}.${toHex(sig)}`;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload: string;
  try {
    payload = atob(encoded);
  } catch {
    return null;
  }
  try {
    const key = await getKey(getSecret());
    const valid = await crypto.subtle.verify(
      ALG,
      key,
      fromHex(sig),
      new TextEncoder().encode(encoded)
    );
    if (!valid) return null;
    const [email, expiresStr] = payload.split("|");
    if (!email || !expiresStr) return null;
    if (Math.floor(Date.now() / 1000) > parseInt(expiresStr, 10)) return null;
    return email;
  } catch {
    return null;
  }
}
