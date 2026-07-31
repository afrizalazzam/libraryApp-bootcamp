"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/admin/top-nav";
import { useAppSelector } from "@/lib/redux/hooks";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== "ADMIN") {
      router.replace("/login");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
