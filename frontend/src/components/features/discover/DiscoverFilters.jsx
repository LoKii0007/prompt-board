"use client";

import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

export function DiscoverFilters({
    hasActiveFilters,
    clearFilters,
    categoryId,
    setCategoryId,
    categoriesLoading,
    categories,
    modelId,
    setModelId,
    modelsLoading,
    models,
    tag,
    setTag,
}) {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="sticky top-[80px] md:top-[96px] z-40 w-full mb-8 px-4"
        >
            <div className="mx-auto max-w-5xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
                {/* Search Input - Always Visible */}
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        className="pl-10 bg-transparent border-transparent focus-visible:ring-0 text-white focus-visible:ring-offset-0 h-10 placeholder:text-muted-foreground/50"
                        placeholder="Search by tag (e.g. cyberpunk, nature)..."
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                    />
                </div>

                {/* Desktop Filters */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="h-8 w-px bg-white/10 mx-2" />

                    <Select
                        value={categoryId || "all"}
                        onValueChange={(value) =>
                            setCategoryId(value === "all" ? "" : value)
                        }
                        disabled={categoriesLoading}
                    >
                        <SelectTrigger className="w-[160px] rounded-xl border-white/5 bg-white/5 hover:bg-white/10 focus:ring-0 focus:ring-offset-0 text-xs font-medium">
                            <SelectValue
                                placeholder={
                                    categoriesLoading ? "Loading..." : "Category"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={modelId || "all"}
                        onValueChange={(value) =>
                            setModelId(value === "all" ? "" : value)
                        }
                        disabled={modelsLoading}
                    >
                        <SelectTrigger className="w-[160px] rounded-xl border-white/5 bg-white/5 hover:bg-white/10 focus:ring-0 focus:ring-offset-0 text-xs font-medium">
                            <SelectValue
                                placeholder={modelsLoading ? "Loading..." : "Model"}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Models</SelectItem>
                            {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearFilters}
                            className="h-10 w-10 shrink-0 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            title="Clear all filters"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Mobile Filter Button (Dialog) */}
                <div className="md:hidden">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl hover:bg-white/10 bg-white/5 border border-white/5">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Filter Prompts</DialogTitle>
                                <DialogDescription>
                                    Refine your search by category and AI model.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={categoryId || "all"}
                                        onValueChange={(value) =>
                                            setCategoryId(value === "all" ? "" : value)
                                        }
                                        disabled={categoriesLoading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={
                                                    categoriesLoading ? "Loading..." : "Category"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Model</Label>
                                    <Select
                                        value={modelId || "all"}
                                        onValueChange={(value) =>
                                            setModelId(value === "all" ? "" : value)
                                        }
                                        disabled={modelsLoading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={modelsLoading ? "Loading..." : "Model"}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Models</SelectItem>
                                            {models.map((model) => (
                                                <SelectItem key={model.id} value={model.id}>
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {hasActiveFilters && (
                                    <Button
                                        variant="destructive"
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </motion.div>
    );
}
