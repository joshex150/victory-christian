import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "ngw_admin";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET || "";
  if (raw.length < 16) {
    throw new Error("AUTH_SECRET must be set (>=16 chars) in .env.local");
  }
  return new TextEncoder().encode(raw);
}

export async function createSession(email: string): Promise<string> {
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
  return token;
}

export async function verifySession(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return null;
    return payload as { email: string; role: "admin" };
  } catch {
    return null;
  }
}

export async function getServerSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export const SESSION_COOKIE = COOKIE_NAME;

export function checkAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return (
    email.trim().toLowerCase() === expectedEmail.trim().toLowerCase() &&
    password === expectedPassword
  );
}
