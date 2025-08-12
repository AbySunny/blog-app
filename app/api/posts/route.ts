// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { createPost } from "@/lib/queries";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { title, content_html, cover_image_url, is_public = true } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await verifySession(token);

    if (!title || !content_html)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const post = await createPost({
      user_id: me.id,
      title,
      content_html,
      cover_image_url: cover_image_url ?? null,
      is_public,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create post" }, { status: 500 });
  }
}
