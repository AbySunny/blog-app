import { listPostsByUserWithContent } from "@/lib/queries";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Lock, Unlock } from "lucide-react";

function firstParagraph(html: string): string {
  const match = html?.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return "";
  const raw = match[1] || "";
  return raw.replace(/<[^>]+>/g, "").trim();
}

export default async function MyBlogsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) redirect("/signin");

  const me = await verifySession(token);
  const posts: any[] = await listPostsByUserWithContent(me.id);

  return (
    <div className="max-w-7xl mt-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-4">My Blogs</h1>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const excerpt = firstParagraph(p.content_html || "");
            return (
              <Link
                key={p.id}
                href={`/posts/${p.slug}`}
                className="group relative rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 bg-card/50"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={p.cover_image_url || "/no-image.jpg"}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-3 right-3 p-2 rounded-full">
                  {p.is_public ? (
                    <div className="bg-black/60 text-green-300 p-2 rounded-full">
                      <Unlock className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="bg-black/60 text-red-400 p-2 rounded-full">
                      <Lock className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {p.title}
                  </h3>
                  {excerpt && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {excerpt}
                    </p>
                  )}
                  <div className="inline-flex items-center text-primary font-medium group-hover:underline">
                    Read more
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

