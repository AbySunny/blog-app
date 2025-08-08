import CategoriesSection from "@/components/CategoriesSection";
import FeaturedSection from "./categories/page";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import QuotesSection from "@/components/QuotesSection";
import Tiptap from "@/components/Tiptap";
import CarouselComponent from "@/shared/CarouselComponent";


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <CarouselComponent data={"Featured"} />
        <CarouselComponent data={"Followers"} />
        <CategoriesSection />
        <QuotesSection />
        <Footer />
      </main>
    </div>
  );
}
