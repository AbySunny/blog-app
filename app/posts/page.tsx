import { listPosts } from "@/lib/queries";
import Link from "next/link";

export default async function PostsPage() {
  const posts = await listPosts(20, 0);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-4">Posts</h1>
      <div className="grid gap-4">
        {posts.map((p: any) => (
          <Link key={p.id} href={`/posts/${p.slug}`} className="block rounded border border-border p-4 hover:bg-accent">
            {p.cover_image_url && (
              <img src={p.cover_image_url} alt="" className="mb-3 h-40 w-full object-cover rounded border border-border" />
            )}
            <div className="text-lg font-medium">{p.title}</div>
            <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
