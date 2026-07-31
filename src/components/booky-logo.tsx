import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BookyLogo({
  className,
  hideLabelOnMobile,
}: {
  className?: string;
  hideLabelOnMobile?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <Image src="/logo.png" alt="Booky" width={84} height={84} className="size-8" priority />
      <span
        className={cn(
          "text-2xl font-bold text-foreground",
          hideLabelOnMobile && "hidden sm:inline"
        )}
      >
        Booky
      </span>
    </Link>
  );
}
