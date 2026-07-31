import Image from "next/image";
import { BookyLogo } from "@/components/booky-logo";

const socialLinks = [
  { label: "Facebook", src: "/icons/sosmed/fb.png", width: 22, height: 41, href: "#" },
  { label: "Instagram", src: "/icons/sosmed/ig.png", width: 41, height: 41, href: "#" },
  { label: "LinkedIn", src: "/icons/sosmed/linkedin.png", width: 34, height: 33, href: "#" },
  { label: "TikTok", src: "/icons/sosmed/tiktok.png", width: 35, height: 40, href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <BookyLogo />

        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-md">
          Discover inspiring stories & timeless knowledge, ready to borrow anytime. Explore
          online or visit our nearest library branch.
        </p>

        <p className="mt-8 font-semibold text-foreground">Follow on Social Media</p>

        <div className="mt-4 flex items-center gap-3">
          {socialLinks.map(({ label, src, width, height, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="flex size-10 items-center justify-center rounded-full border border-border hover:bg-muted"
            >
              <Image src={src} alt="" width={width} height={height} className="h-4 w-auto" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
