import { DiscoverContent } from "@/components/features/discover/DiscoverContent";

export const metadata = {
  title: "Discover Cool & Trendy AI Prompts | Prompt Board",
  description:
    "Explore a curated collection of cool, trendy, and creative AI prompts. Discover the best prompts for image generation, find inspiration, and share your favorites. Your Pinterest for AI prompts.",
  keywords: [
    "AI prompts",
    "image generation prompts",
    "trendy prompts",
    "cool prompts",
    "prompt discovery",
    "AI art prompts",
    "creative prompts",
    "prompt inspiration",
    "DALL-E prompts",
    "Midjourney prompts",
    "Stable Diffusion prompts",
  ],
  openGraph: {
    title: "Discover Cool & Trendy AI Prompts | Prompt Board",
    description:
      "Explore a curated collection of cool, trendy, and creative AI prompts. Discover the best prompts for image generation and find inspiration.",
    type: "website",
    siteName: "Prompt Board",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Cool & Trendy AI Prompts | Prompt Board",
    description:
      "Explore a curated collection of cool, trendy, and creative AI prompts. Your Pinterest for AI prompts.",
  },
  alternates: {
    canonical: "/discover",
  },
};

export default function DiscoverPage() {
  return <DiscoverContent />;
}
