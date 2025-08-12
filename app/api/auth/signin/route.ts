// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/queries";
import { signSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });

    const token = await signSession({ id: user.id, email: user.email, username: user.username });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } }, { status: 200 });
    res.cookies.set("auth", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Signin failed" }, { status: 500 });
  }
}