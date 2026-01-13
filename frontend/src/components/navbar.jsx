"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Compass, PlusCircle, LayoutGrid, User, LogOut, Menu, X } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, user, logout, isLoading } = useAuthContext();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: "Discover", href: "/discover", icon: Compass },
        { name: "My Prompts", href: "/prompts", icon: LayoutGrid },
        { name: "Create", href: "/prompts/create", icon: PlusCircle },
    ];

    const handleLogout = () => {
        logout();
        router.push("/");
        setIsMobileMenuOpen(false);
    };

    return (
        <>
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

                    {/* Desktop Navigation */}
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

                    {/* Desktop Auth/Profile */}
                    <div className="hidden md:flex items-center gap-4">
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

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="text-muted-foreground hover:text-primary"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop with blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[60] bg-background/20 backdrop-blur-sm"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 z-[70] w-3/4 max-w-sm border-l border-white/10 bg-background/95 backdrop-blur-md p-6 shadow-2xl"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-lg font-bold">Menu</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-6 flex-1">
                                    {isAuthenticated && navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary",
                                                    isActive ? "text-primary" : "text-muted-foreground"
                                                )}
                                            >
                                                <Icon className="h-5 w-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}

                                    {!isAuthenticated && (
                                        <div className="flex flex-col gap-4">
                                            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Button variant="ghost" size="lg" className="w-full justify-start gap-2">
                                                    <User className="h-5 w-5" />
                                                    Sign In
                                                </Button>
                                            </Link>
                                            <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Button size="lg" className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                                                    Get Started
                                                </Button>
                                            </Link>
                                        </div>
                                    )}

                                    {isAuthenticated && (
                                        <div className="flex flex-col gap-4 mt-auto border-t border-white/10 pt-6">
                                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Button variant="ghost" size="lg" className="w-full justify-start gap-2">
                                                    <User className="h-5 w-5" />
                                                    {user?.name || user?.email || "Profile"}
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="lg"
                                                className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Logout
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
