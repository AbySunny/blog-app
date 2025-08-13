import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { listPostsWithContent } from "@/lib/queries";
import FollowButton from "@/components/FollowButton";

function firstParagraph(html: string): string {
  const match = html?.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return "";
  const raw = match[1] || "";
  return raw.replace(/<[^>]+>/g, "").trim();
}

export default async function AllBlogsPage() {
  const posts: any[] = await listPostsWithContent(30, 0);

  return (
    <div className="max-w-7xl mt-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-4">All Blogs</h1>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const excerpt = firstParagraph(p.content_html || "");
            return (
              <div
                key={p.id}
                className="group rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 bg-card/50 flex flex-col"
              >
                <Link
                  href={`/posts/${p.slug}`}
                  className="block flex-grow"
                >
                  {p.cover_image_url && (
                    <div className="relative w-full h-48">
                      <Image
                        src={p.cover_image_url}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
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
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{p.author_username}</div>
                    <FollowButton targetUserId={p.author_id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
