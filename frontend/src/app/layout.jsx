import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "PromptBoard - Discover & Share AI Prompts",
    template: "%s | PromptBoard",
  },
  description: "The Pinterest for AI prompts. Discover, share, and organize your favorite Midjourney, Stable Diffusion, and DALL-E prompts. The ultimate visual discovery engine for AI art.",
  keywords: ["AI prompts", "prompt engineering", "Midjourney", "Stable Diffusion", "DALL-E", "AI art", "inspiration", "visual discovery", "creative prompts"],
  authors: [{ name: "PromptBoard" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://promptboard.com",
    title: "PromptBoard - The Pinterest for AI Prompts",
    description: "Join the community of creators. Discover and share the best AI prompts for your next masterpiece.",
    siteName: "PromptBoard",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptBoard - Discover & Share AI Prompts",
    description: "The visual discovery engine for AI prompts. Find inspiration for your next AI art creation.",
  },
};

export default function RootLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-foreground selection:bg-primary/20`}
      >
        <GoogleOAuthProvider clientId={googleClientId || ""}>
          <QueryProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col bg-background">
                <Navbar />
                <main className="flex-1 pt-16">{children}</main>
              </div>
            </AuthProvider>
            <Toaster />
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
