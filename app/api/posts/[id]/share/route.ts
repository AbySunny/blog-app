import { NextResponse } from "next/server";
import { sharePost } from "@/lib/queries";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });
    await sharePost(user_id, params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
