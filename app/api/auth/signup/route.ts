import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/queries";
import { signSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    if (!username || !email || !password)
      return NextResponse.json({ error: "All fields required" }, { status: 400 });

    const exists = await getUserByEmail(email);
    if (exists) return NextResponse.json({ error: "Email already used" }, { status: 400 });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser(username, email, password_hash);

    const token = await signSession({ id: user.id, email: user.email, username: user.username });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } }, { status: 201 });
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set("auth", token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Signup failed" }, { status: 500 });
  }
}