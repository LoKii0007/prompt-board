"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useVoteOnPrompt } from "@/hooks/useVotes";

export function DiscoverCard({ prompt }) {
    const [copied, setCopied] = useState(false);
    const { isAuthenticated } = useAuthContext();
    const voteMutation = useVoteOnPrompt();

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.description);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVote = async (e, value) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // Redirect to login or show a message
            return;
        }

        voteMutation.mutate({ promptId: prompt.id, value });
    };

    const userVote = prompt.userVote; // 1 for upvote, -1 for downvote, null for no vote

    return (
        <Link href={`/discover/${prompt.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="break-inside-avoid relative group rounded-xl overflow-hidden mb-4 bg-card border border-white/5 cursor-pointer"
            >
                <img
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src =
                            "https://via.placeholder.com/400x400?text=Image+Not+Found";
                    }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                    <div className="flex justify-end">
                        <Badge className="bg-black/50 backdrop-blur-md hover:bg-black/70 capitalize">
                            {prompt.category?.name || "Uncategorized"}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-white font-bold text-lg leading-tight">
                            {prompt.title}
                        </h3>
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-8 w-8 rounded-full ${userVote === 1
                                            ? "text-green-400 bg-green-400/20 hover:bg-green-400/30"
                                            : "text-white hover:bg-white/20"
                                        }`}
                                    onClick={(e) => handleVote(e, 1)}
                                    disabled={!isAuthenticated || voteMutation.isPending}
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <span className="text-xs text-white/80">
                                    {prompt.upVotes || 0}
                                </span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-8 w-8 rounded-full ${userVote === -1
                                            ? "text-red-400 bg-red-400/20 hover:bg-red-400/30"
                                            : "text-white hover:bg-white/20"
                                        }`}
                                    onClick={(e) => handleVote(e, -1)}
                                    disabled={!isAuthenticated || voteMutation.isPending}
                                >
                                    <ThumbsDown className="h-4 w-4" />
                                </Button>
                                <span className="text-xs text-white/80">
                                    {prompt.downVotes || 0}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 text-xs gap-1 bg-white/90 hover:bg-white text-black"
                                onClick={handleCopy}
                            >
                                <Copy className="h-3 w-3" />
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
