import { NextResponse } from "next/server";
import { follow, unfollow } from "@/lib/queries";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { follower_id } = await req.json();
    const { id } = await params;
    if (!follower_id) return NextResponse.json({ error: "follower_id required" }, { status: 400 });
    await follow(follower_id, id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { follower_id } = await req.json();
    const { id } = await params;
    if (!follower_id) return NextResponse.json({ error: "follower_id required" }, { status: 400 });
    await unfollow(follower_id, id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
