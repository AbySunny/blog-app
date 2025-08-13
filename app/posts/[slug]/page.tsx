import { getPostBySlug, getPostStats } from "@/lib/queries";
import TiptapViewer from "@/components/TiptapViewer";
import PostActions from "@/components/PostActions";
import FollowButton from "@/components/FollowButton";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) return <div className="max-w-3xl mx-auto p-6">Not found</div>;

  const stats = await getPostStats(post.id);

  return (
    <div className="mt-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold mb-4">{post.title}</h1>
      <div className="mb-4 flex items-center gap-4">
        <div className="font-semibold">Author: {post.author_username}</div>
        <FollowButton targetUserId={post.author_id} />
      </div>
      <TiptapViewer html={post.content_html} />
      <PostActions postId={post.id} initialLikes={stats.likes} initialShares={stats.shares} />
    </div>
  );
}
