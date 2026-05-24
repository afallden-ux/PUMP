import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

export interface SerializableCookie {
  name: string;
  value: string;
}

function keyFromSecret(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptSessionCookies(
  cookies: SerializableCookie[],
  secret: string
): string {
  const key = keyFromSecret(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const payload = Buffer.from(JSON.stringify(cookies), "utf8");
  const enc = Buffer.concat([cipher.update(payload), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSessionCookies(
  blob: string,
  secret: string
): SerializableCookie[] {
  const buf = Buffer.from(blob, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const key = keyFromSecret(secret);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(dec.toString("utf8")) as SerializableCookie[];
}
