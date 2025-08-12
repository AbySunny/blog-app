import { NextResponse } from "next/server";
import { replacePostImages } from "@/lib/queries";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { images } = await req.json();
    if (!params.id || !Array.isArray(images)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await replacePostImages(params.id, images);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
