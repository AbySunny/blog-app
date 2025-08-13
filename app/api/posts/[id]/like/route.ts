import { NextResponse } from "next/server";
import { likePost, unlikePost } from "@/lib/queries";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });
    
    const { id } = await params;
    await likePost(user_id, id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });
    
    const { id } = await params;
    await unlikePost(user_id, id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
