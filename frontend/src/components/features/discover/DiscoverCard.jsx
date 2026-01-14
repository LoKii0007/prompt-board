"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useVoteOnPrompt } from "@/hooks/useVotes";

const DEBOUNCE_DELAY = 400; // ms

export function DiscoverCard({ prompt }) {
    const [copied, setCopied] = useState(false);
    const [errorToast, setErrorToast] = useState(null);
    const { isAuthenticated } = useAuthContext();
    const voteMutation = useVoteOnPrompt();

    // Local state for instant UI updates
    const [localUserVote, setLocalUserVote] = useState(prompt.userVote);
    const [localUpVotes, setLocalUpVotes] = useState(prompt.upVotes || 0);
    const [localDownVotes, setLocalDownVotes] = useState(prompt.downVotes || 0);

    // Store original server state for rollback
    const serverStateRef = useRef({
        userVote: prompt.userVote,
        upVotes: prompt.upVotes || 0,
        downVotes: prompt.downVotes || 0,
    });

    // Debounce timer ref
    const debounceTimerRef = useRef(null);
    const pendingVoteRef = useRef(null);

    // Sync local state when prompt prop changes (from server refetch)
    useEffect(() => {
        setLocalUserVote(prompt.userVote);
        setLocalUpVotes(prompt.upVotes || 0);
        setLocalDownVotes(prompt.downVotes || 0);
        serverStateRef.current = {
            userVote: prompt.userVote,
            upVotes: prompt.upVotes || 0,
            downVotes: prompt.downVotes || 0,
        };
    }, [prompt.id, prompt.userVote, prompt.upVotes, prompt.downVotes]);

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.description);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVote = (e, value) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            return;
        }

        // Cancel previous debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        // Update local state instantly
        let newUserVote = localUserVote;
        let newUpVotes = localUpVotes;
        let newDownVotes = localDownVotes;

        // Toggle logic: if clicking same vote, remove it; otherwise switch vote
        if (localUserVote === value) {
            // Remove vote
            if (value === 1) newUpVotes = Math.max(0, newUpVotes - 1);
            if (value === -1) newDownVotes = Math.max(0, newDownVotes - 1);
            newUserVote = null;
        } else {
            // Remove previous vote if exists
            if (localUserVote === 1) newUpVotes = Math.max(0, newUpVotes - 1);
            if (localUserVote === -1) newDownVotes = Math.max(0, newDownVotes - 1);

            // Apply new vote
            if (value === 1) newUpVotes += 1;
            if (value === -1) newDownVotes += 1;
            newUserVote = value;
        }

        // Update UI instantly
        setLocalUserVote(newUserVote);
        setLocalUpVotes(newUpVotes);
        setLocalDownVotes(newDownVotes);

        // Store pending vote
        pendingVoteRef.current = newUserVote;

        // Debounce API call
        debounceTimerRef.current = setTimeout(async () => {
            try {
                // Backend expects 1 or -1. If we want to remove vote, send the current server vote value
                // (backend will remove it). Otherwise send the new vote value.
                let valueToSend;
                if (newUserVote === null) {
                    // Want to remove vote - send current server vote to toggle it off
                    valueToSend = serverStateRef.current.userVote;
                    // If no server vote exists, skip API call (shouldn't happen)
                    if (valueToSend === null) {
                        debounceTimerRef.current = null;
                        pendingVoteRef.current = null;
                        return;
                    }
                } else {
                    // New vote value
                    valueToSend = newUserVote;
                }

                await voteMutation.mutateAsync({
                    promptId: prompt.id,
                    value: valueToSend
                });
                // Update server state ref on success
                serverStateRef.current = {
                    userVote: newUserVote,
                    upVotes: newUpVotes,
                    downVotes: newDownVotes,
                };
            } catch (error) {
                // Rollback to server state on error
                console.error("Failed to submit vote:", error);
                setLocalUserVote(serverStateRef.current.userVote);
                setLocalUpVotes(serverStateRef.current.upVotes);
                setLocalDownVotes(serverStateRef.current.downVotes);

                const message = error?.message || "Failed to update vote. Please try again.";
                setErrorToast(message);
                setTimeout(() => setErrorToast(null), 3000);
            } finally {
                pendingVoteRef.current = null;
                debounceTimerRef.current = null;
            }
        }, DEBOUNCE_DELAY);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const userVote = localUserVote; // Use local state for UI

    return (
        <Link href={`/discover/${prompt.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: 0 }}
                className="break-inside-avoid relative group rounded-xl overflow-hidden mb-4 bg-card border border-white/5 cursor-pointer"
            >
                <img
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110 origin-center ease-in-out "
                    onError={(e) => {
                        e.target.src =
                            "https://via.placeholder.com/400x400?text=Image+Not+Found";
                    }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
                    <div className="flex justify-end p-4">
                        <Badge className="bg-black/50 backdrop-blur-md hover:bg-black/70 text-white/90 capitalize">
                            {prompt.category?.name || "Uncategorized"}
                        </Badge>
                    </div>

                    <div className="space-y-2 bg-linear-to-b from-transparent to-black/70 p-4">
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
                                    disabled={!isAuthenticated}
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <span className="text-xs text-white/80">
                                    {localUpVotes}
                                </span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-8 w-8 rounded-full ${userVote === -1
                                        ? "text-red-400 bg-red-400/20 hover:bg-red-400/30"
                                        : "text-white hover:bg-white/20"
                                        }`}
                                    onClick={(e) => handleVote(e, -1)}
                                    disabled={!isAuthenticated}
                                >
                                    <ThumbsDown className="h-4 w-4" />
                                </Button>
                                <span className="text-xs text-white/80">
                                    {localDownVotes}
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
                {errorToast && (
                    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-red-500 text-white px-3 py-2 shadow-lg text-sm">
                        {errorToast}
                    </div>
                )}
            </motion.div>
        </Link>
    );
}
