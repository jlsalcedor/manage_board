import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"
import fs from "fs/promises"
import path from "path"

export const SESSION_COOKIE = "session_token"
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000 // 12 hours
const USERS_DB_PATH = path.join(process.cwd(), "data", "bd_users.json")

// What the signed cookie carries. Authorization data for standard users
// (boards, pending password change) is re-read from the DB on every request.
interface TokenPayload {
  user: string
  role: "admin" | "user"
  sessionVersion: number
  expiresAt: number
}

export interface Session {
  user: string
  role: "admin" | "user"
  assignedBoardIds: string[]
  mustChangePassword: boolean
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET no está configurado o tiene menos de 32 caracteres")
  }
  return secret
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url")
}

// Token format: "<base64url(JSON payload)>.<base64url(HMAC-SHA256)>"
function encodeToken(payload: TokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${data}.${sign(data)}`
}

function decodeToken(token: string | undefined): TokenPayload | null {
  if (!token) return null
  const [data, signature] = token.split(".")
  if (!data || !signature) return null

  const expected = Buffer.from(sign(data))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"))
    if (!payload.user || !payload.role || Date.now() > payload.expiresAt) return null
    return payload
  } catch {
    return null
  }
}

async function findUser(username: string) {
  try {
    const users = JSON.parse(await fs.readFile(USERS_DB_PATH, "utf-8"))
    return users.find((u: any) => u.username === username) ?? null
  } catch {
    return null
  }
}

export function setSessionCookie(
  response: NextResponse,
  session: { user: string; role: "admin" | "user"; sessionVersion?: number }
) {
  const token = encodeToken({
    user: session.user,
    role: session.role,
    sessionVersion: session.sessionVersion ?? 0,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  })

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // HTTPS-only in production; set COOKIE_SECURE=false only if prod is served over plain HTTP
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE)
}

// Verifies the signed cookie and, for standard users, that the account still exists
// and its password hasn't changed since the session was issued.
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const payload = decodeToken(cookieStore.get(SESSION_COOKIE)?.value)
  if (!payload) return null

  if (payload.role === "admin") {
    if (payload.user !== process.env.ADMIN_USER) return null
    return { user: payload.user, role: "admin", assignedBoardIds: [], mustChangePassword: false }
  }

  const user = await findUser(payload.user)
  if (!user || (user.sessionVersion ?? 0) !== payload.sessionVersion) return null

  return {
    user: user.username,
    role: "user",
    assignedBoardIds: user.assignedBoardIds || [],
    mustChangePassword: user.mustChangePassword === true,
  }
}

// Route guard. Usage:
//   const auth = await requireSession({ role: "admin" })
//   if (!auth.ok) return auth.response
export async function requireSession(
  options: { role?: "admin"; allowPendingPasswordChange?: boolean } = {}
): Promise<{ ok: true; session: Session } | { ok: false; response: NextResponse }> {
  const session = await getSession()
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: "No autenticado" }, { status: 401 }) }
  }
  if (session.mustChangePassword && !options.allowPendingPasswordChange) {
    return { ok: false, response: NextResponse.json({ error: "Debes cambiar tu contraseña" }, { status: 403 }) }
  }
  if (options.role && session.role !== options.role) {
    return { ok: false, response: NextResponse.json({ error: "No autorizado" }, { status: 403 }) }
  }
  return { ok: true, session }
}
