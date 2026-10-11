import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "bizadvisor-super-secure-jwt-key-minimum-32-chars-long";
const SESSION_COOKIE_NAME = "bizadvisor_session";

export interface UserSessionPayload {
  userId: string;
  email: string;
  fullName: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  try {
    const profile = await db.profile.findUnique({
      where: { id: payload.userId },
      include: {
        business_profile: true,
      },
    });

    return profile;
  } catch (err) {
    console.error("Error retrieving session user:", err);
    return null;
  }
}

export async function getSessionUserFromRequest(request: NextRequest) {
  // Check authorization header first
  const authHeader = request.headers.get("authorization");
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  }

  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  try {
    const profile = await db.profile.findUnique({
      where: { id: payload.userId },
      include: {
        business_profile: true,
      },
    });

    return profile;
  } catch (err) {
    console.error("Error retrieving session user from request:", err);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please log in to continue." },
        { status: 401 }
      ),
    };
  }
  return { user, errorResponse: null };
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
