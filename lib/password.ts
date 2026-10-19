import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto"
import { promisify } from "util"

const scrypt = promisify(scryptCallback) as (password: string, salt: string, keylen: number) => Promise<Buffer>

const KEY_LENGTH = 64

export const MIN_PASSWORD_LENGTH = 8

// Stored format: "scrypt$<salt hex>$<hash hex>"
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const hash = await scrypt(password, salt, KEY_LENGTH)
  return `scrypt$${salt}$${hash.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, hashHex] = stored.split("$")
  if (algorithm !== "scrypt" || !salt || !hashHex) return false

  const expected = Buffer.from(hashHex, "hex")
  const actual = await scrypt(password, salt, expected.length)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

// Never send password material to the client
export function toPublicUser(user: any) {
  const { password, passwordHash, sessionVersion, ...publicUser } = user
  return publicUser
}
