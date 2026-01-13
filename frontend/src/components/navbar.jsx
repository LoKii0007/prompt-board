"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Compass, PlusCircle, LayoutGrid, User, LogOut } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, user, logout, isLoading } = useAuthContext();
    const router = useRouter();

    const navItems = [
        { name: "Discover", href: "/discover", icon: Compass },
        { name: "My Prompts", href: "/prompts", icon: LayoutGrid },
        { name: "Create", href: "/prompts/create", icon: PlusCircle },
    ];

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            PromptBoard
                        </span>
                    </Link>
                </div>

                {isAuthenticated && (
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    ) : isAuthenticated ? (
                        <>
                            <Link href="/profile">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    {user?.name || user?.email || "Profile"}
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="h-4 w-4" />
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
