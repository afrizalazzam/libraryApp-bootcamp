"use client";

import Image from "next/image";
import Link from "next/link";
import { useCategoriesQuery } from "@/lib/api/categories";

type Category = {
  slug: string;
  label: string;
  matchName: string;
};

const categories: Category[] = [
  { slug: "fiction", label: "Fiction", matchName: "fiction" },
  { slug: "non-fiction", label: "Non-Fiction", matchName: "non-fiction" },
  { slug: "self-improvement", label: "Self-Improvement", matchName: "self-improvement" },
  { slug: "finance", label: "Finance", matchName: "finance" },
  { slug: "science", label: "Science & Technology", matchName: "science" },
  { slug: "education", label: "Education", matchName: "education" },
];

export function CategoryPills() {
  const { data } = useCategoriesQuery();
  const apiCategories = data?.categories ?? [];

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      {categories.map(({ slug, label, matchName }) => {
        const match = apiCategories.find(
          (category) => category.name.toLowerCase() === matchName
        );

        return (
          <Link
            key={slug}
            href={match ? `/books?categoryId=${match.id}` : "/books"}
            className="overflow-hidden rounded-3xl bg-card p-3 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-24 items-center justify-center rounded-2xl bg-primary-100">
              <Image
                src={`/icons/category/${slug}.png`}
                alt=""
                width={48}
                height={48}
                className="size-12"
              />
            </div>
            <span className="mt-3 block px-1 text-sm font-medium break-words text-foreground sm:text-lg">
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
