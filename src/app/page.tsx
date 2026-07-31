"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { TopNav as UserTopNav } from "@/components/user/top-nav";
import { TopNav as PublicTopNav } from "@/components/public/top-nav";
import { HeroCarousel } from "@/components/user/home-page";
import { CategoryPills } from "@/components/user/category-pills";
import { BookRecommendations } from "@/components/user/book-recommendations";
import { PopularAuthors } from "@/components/user/popular-authors";
import { Footer } from "@/components/footer";

export default function Home() {
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated) return null;

  return (
    <main className="min-h-screen bg-background">
      {user ? <UserTopNav /> : <PublicTopNav />}
      <div className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <HeroCarousel />
        </div>
        <div className="mx-auto mt-8 max-w-6xl px-8">
          <CategoryPills />
        </div>
        <div className="mx-auto mt-12 max-w-6xl px-8">
          <BookRecommendations />
        </div>
        <div className="mx-auto mt-12 max-w-6xl px-8">
          <PopularAuthors />
        </div>
      </div>
      <Footer />
    </main>
  );
}
