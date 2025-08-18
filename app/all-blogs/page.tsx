import PaginatedBlogs from "./PaginatedBlogs";
import { listPostsWithContent, getTotalPostsCount } from "@/lib/queries";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export default async function AllBlogsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const me = token ? await verifySession(token) : null;
  
  // Get all posts and filter out current user's posts
  const allPosts: any[] = await listPostsWithContent(1000, 0);
  const filteredPosts = me 
    ? allPosts.filter(post => post.author_id !== me.id)
    : allPosts;
  
  return (
    <PaginatedBlogs 
      initialPosts={filteredPosts} 
      totalPosts={filteredPosts.length} 
      me={me} 
    />
  );
}
