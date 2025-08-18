import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import QuotesSection from "@/components/QuotesSection";
import CarouselComponent from "@/shared/CarouselComponent";
import { listTopLikedPosts, listTopSharedPosts, listPostsFromFollowedUsers } from "@/lib/queries";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";


function firstParagraph(html: string): string {
  const m = html?.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const raw = m?.[1] || "";
  return raw.replace(/<[^>]+>/g, "").trim();
}

export default async function Home() {
  // Get current user session
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  let currentUser = null;
  
  if (token) {
    try {
      currentUser = await verifySession(token);
    } catch (error) {
      // Invalid token, user not logged in
    }
  }

  // Fetch posts based on authentication state
  const [liked, shared] = await Promise.all([
    listTopLikedPosts(10),
    listTopSharedPosts(10),
  ]);
  
  let followedPosts: any[] = [];
  if (currentUser) {
    try {
      followedPosts = await listPostsFromFollowedUsers(currentUser.id, 10);
    } catch (error) {
      console.error("Error fetching followed posts:", error);
      followedPosts = [];
    }
  }

  const itemsLiked = liked.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    image: p.cover_image_url || "/no-image.jpg",
    title: p.title,
    date: new Date(p.created_at).toLocaleDateString(),
    excerpt: firstParagraph(p.content_html || ""),
    category: "Most Liked",
  }));

  const itemsShared = shared.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    image: p.cover_image_url || "/no-image.jpg",
    title: p.title,
    date: new Date(p.created_at).toLocaleDateString(),
    excerpt: firstParagraph(p.content_html || ""),
    category: "Most Shared",
  }));

  const itemsFollowed = followedPosts.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    image: p.cover_image_url || "/no-image.jpg",
    title: p.title,
    date: new Date(p.created_at).toLocaleDateString(),
    excerpt: firstParagraph(p.content_html || ""),
    category: "From Users You Follow",
  }));

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <CarouselComponent data={"Most Liked"} items={itemsLiked} />
        <CarouselComponent data={"Most Shared"} items={itemsShared} />

        {currentUser && itemsFollowed.length > 0 && (
          <CarouselComponent data={"From Users You Follow"} items={itemsFollowed} />
        )}
        
        <QuotesSection />
        <Footer />
      </main>
    </div>
  );
}
