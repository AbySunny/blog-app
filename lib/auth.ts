import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret");
const alg = "HS256";

export type Session = { id: string; email: string; username: string };

export async function signSession(session: Session) {
  return await new SignJWT(session)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret, { algorithms: [alg] });
  return payload as Session;
}
