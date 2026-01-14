"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy, ThumbsUp, ThumbsDown, Share2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useGetDiscoverPromptById } from "@/hooks/usePrompts";
import { useGetDiscoverPrompts } from "@/hooks/usePrompts";
import { useVoteOnPrompt } from "@/hooks/useVotes";
import { useAuthContext } from "@/contexts/AuthContext";

const DEBOUNCE_DELAY = 400; // ms

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [copied, setCopied] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const { isAuthenticated } = useAuthContext();
  const voteMutation = useVoteOnPrompt();

  const { data, isLoading, error } = useGetDiscoverPromptById(id);
  const { data: relatedData } = useGetDiscoverPrompts(1, 4, null, null, null);
  
  const prompt = data?.data?.prompt;
  const relatedPrompts = relatedData?.data?.prompts?.filter((p) => p.id !== id).slice(0, 4) || [];
  
  // Local state for instant UI updates
  const [localUserVote, setLocalUserVote] = useState(prompt?.userVote);
  const [localUpVotes, setLocalUpVotes] = useState(prompt?.upVotes || 0);
  const [localDownVotes, setLocalDownVotes] = useState(prompt?.downVotes || 0);
  
  // Store original server state for rollback
  const serverStateRef = useRef({
    userVote: prompt?.userVote,
    upVotes: prompt?.upVotes || 0,
    downVotes: prompt?.downVotes || 0,
  });
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null);
  const pendingVoteRef = useRef(null);

  // Sync local state when prompt prop changes (from server refetch)
  useEffect(() => {
    if (prompt) {
      setLocalUserVote(prompt.userVote);
      setLocalUpVotes(prompt.upVotes || 0);
      setLocalDownVotes(prompt.downVotes || 0);
      serverStateRef.current = {
        userVote: prompt.userVote,
        upVotes: prompt.upVotes || 0,
        downVotes: prompt.downVotes || 0,
      };
    }
  }, [prompt?.id, prompt?.userVote, prompt?.upVotes, prompt?.downVotes]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleVote = (value) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
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
          promptId: id, 
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

  const userVote = localUserVote; // Use local state for UI

  const handleCopy = () => {
    if (prompt?.description) {
      navigator.clipboard.writeText(prompt.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt?.title,
          text: prompt?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Prompt Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error?.response?.data?.message || "The prompt you're looking for doesn't exist or is not available."}
        </p>
        <Link href="/discover">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Discover
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const timeAgo = formatDate(prompt.createdAt);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Image */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            src={prompt.imageUrl}
            alt={prompt.title}
            className="w-full h-auto object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x800?text=Image+Not+Found";
            }}
          />
        </div>

        {/* Right: Details */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant="outline" className="text-sm py-1 capitalize">
                {prompt.category?.name || "Uncategorized"}
              </Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {prompt.model?.name || "Unknown Model"}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {timeAgo}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight mb-4">
              {prompt.title}
            </h1>

            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {prompt.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-secondary/50"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Prompt"}
              </Button>
              <Button variant="outline" size="lg" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm p-6 border-white/10">
            <h3 className="font-semibold text-lg mb-2">Prompt</h3>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground p-4 bg-black/20 rounded-md border border-white/5 whitespace-pre-wrap">
              {prompt.description}
            </p>
          </Card>

          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className={`gap-2 ${
                  userVote === 1
                    ? "text-green-400 bg-green-400/20 hover:bg-green-400/30"
                    : "hover:text-green-400 hover:bg-green-400/10"
                }`}
                onClick={() => handleVote(1)}
                disabled={!isAuthenticated}
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="font-bold">{localUpVotes}</span>
              </Button>
              <Button
                variant="ghost"
                className={`gap-2 ${
                  userVote === -1
                    ? "text-red-400 bg-red-400/20 hover:bg-red-400/30"
                    : "hover:text-red-400 hover:bg-red-400/10"
                }`}
                onClick={() => handleVote(-1)}
                disabled={!isAuthenticated}
              >
                <ThumbsDown className="h-5 w-5" />
                <span className="font-bold">{localDownVotes}</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
            >
              <AlertCircle className="h-4 w-4" /> Report
            </Button>
          </div>
          
          {errorToast && (
            <div className="fixed bottom-4 right-4 z-50 rounded-md bg-red-500 text-white px-3 py-2 shadow-lg text-sm">
              {errorToast}
            </div>
          )}

          {/* Author Info */}
          {prompt.user && (
            <Card className="bg-card/50 backdrop-blur-sm p-4 border-white/10">
              <div className="flex items-center gap-3">
                {prompt.user.profileImageUrl ? (
                  <img
                    src={prompt.user.profileImageUrl}
                    alt={prompt.user.name || prompt.user.email}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {(prompt.user.name || prompt.user.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{prompt.user.name || prompt.user.email}</p>
                  <p className="text-xs text-muted-foreground">Creator</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Related Feed */}
      {relatedPrompts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6">More like this</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {relatedPrompts.map((p) => (
              <Link
                key={p.id}
                href={`/discover/${p.id}`}
                className="group relative rounded-xl overflow-hidden aspect-3/4 border border-white/10 hover:border-primary/50 transition-colors"
              >
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x600?text=Image+Not+Found";
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="font-bold text-white">{p.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
