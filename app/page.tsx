import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import QuotesSection from "@/components/QuotesSection";
import CarouselComponent from "@/shared/CarouselComponent";
import { listTopLikedPosts, listTopSharedPosts } from "@/lib/queries";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function firstParagraph(html: string): string {
  const m = html?.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const raw = m?.[1] || "";
  return raw.replace(/<[^>]+>/g, "").trim();
}

export default async function Home() {
  const [liked, shared]: any[] = await Promise.all([
    listTopLikedPosts(10),
    listTopSharedPosts(10),
  ]);

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

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <CarouselComponent data={"Most Liked"} items={itemsLiked} />
        <CarouselComponent data={"Most Shared"} items={itemsShared} />
        <QuotesSection />
        <Footer />
      </main>
    </div>
  );
}
