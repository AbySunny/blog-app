import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
  
) {
  try {
    const { searchParams } = new URL(req.url);
    const follower_id = searchParams.get("follower_id");
    
    if (!follower_id) {
      return NextResponse.json({ error: "follower_id required" }, { status: 400 });
    }

    const rows = await sql`
      SELECT 1 
      FROM follows 
      WHERE follower_id = ${follower_id} AND following_id = ${params.id}
      LIMIT 1;
    `;

    return NextResponse.json({ isFollowing: rows.length > 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
