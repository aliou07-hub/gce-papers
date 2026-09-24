import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionAdmin, SessionUser } from "../types";

const STUDENT_COOKIE = "kaolo_session";
const ADMIN_COOKIE = "kaolo_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days — "stay signed in"

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set in .env.local");
  }
  return new TextEncoder().encode(secret);
}

async function sign(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

async function verify<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as T;
  } catch {
    return null;
  }
}

export async function createStudentSession(user: { id: string; phone_number: string }) {
  const token = await sign({ sub: user.id, phone: user.phone_number, role: "student" });
  const store = await cookies();
  store.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getStudentSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(STUDENT_COOKIE)?.value;
  if (!token) return null;
  return verify<SessionUser>(token);
}

export async function clearStudentSession() {
  const store = await cookies();
  store.delete(STUDENT_COOKIE);
}

export async function createAdminSession(admin: { id: string; username: string }) {
  const token = await sign({ sub: admin.id, username: admin.username, role: "admin" });
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours — shorter-lived admin session
  });
}

export async function getAdminSession(): Promise<SessionAdmin | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verify<SessionAdmin>(token);
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
