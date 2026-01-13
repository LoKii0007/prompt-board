"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Copy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PromptCard({ prompt, onDelete, isDeleting }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.description);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-md hover:shadow-xl transition-all duration-500"
        >
            {/* Image Display */}
            <div className="aspect-4/5 overflow-hidden relative">
                <img
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    onError={(e) => {
                        e.target.src =
                            "https://via.placeholder.com/400x400?text=Image+Not+Found";
                    }}
                />

                {/* Gradient Overlay - Always there but stronger on hover */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Top Actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                    <Badge className="bg-black/50 backdrop-blur border-none hover:bg-black/70">
                        {prompt.category?.name || "General"}
                    </Badge>
                </div>

                {/* Content Content (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                        {prompt.title}
                    </h3>

                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                            {prompt.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-none"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <span className="text-green-400">Copied!</span>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3 mr-1.5" /> Copy Prompt
                                    </>
                                )}
                            </Button>

                            <div className="flex gap-1">
                                <Link href={`/prompts/${prompt.id}/edit`}>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                </Link>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-full"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-zinc-900 border-white/10 text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-400">
                                                This action cannot be undone. This will permanently delete
                                                your prompt "{prompt.title}" and remove it from our
                                                servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => onDelete(prompt.id)}
                                                className="bg-red-500 hover:bg-red-600 border-none text-white"
                                            >
                                                {isDeleting ? "Deleting..." : "Delete"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
