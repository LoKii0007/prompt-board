"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Copy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useGetMyPrompts, useDeletePrompt } from "@/hooks/usePrompts";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PromptsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { data, isLoading, error } = useGetMyPrompts(1, 100);
  const deletePromptMutation = useDeletePrompt();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      try {
        await deletePromptMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting prompt:", error);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400">
          Error loading prompts: {error?.response?.data?.message || error.message}
        </div>
      </div>
    );
  }

  const prompts = data?.data?.prompts || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Prompts</h1>
        <Link href="/prompts/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Prompt
          </Button>
        </Link>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No prompts yet.</p>
          <Link href="/prompts/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Prompt
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function PromptCard({ prompt, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.description);
    // You could add a toast notification here
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group rounded-xl overflow-hidden border border-white/10 bg-card shadow-lg transition-all duration-300 ease-in-out h-[400px]"
    >
      {/* Container that shifts on hover */}
      <div
        className={`flex h-full transition-transform duration-500 ease-out ${
          isHovered ? "translate-x-0" : ""
        }`}
      >
        {/* Image Section */}
        <div
          className={`relative h-full transition-all duration-500 ${
            isHovered ? "w-1/2" : "w-full"
          }`}
        >
          <img
            src={prompt.imageUrl}
            alt={prompt.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x400?text=Image+Not+Found";
            }}
          />
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100 group-hover:opacity-0"
            }`}
          />

          {/* Title Overlay when NOT hovered */}
          <div
            className={`absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          >
            <h3 className="text-xl font-bold text-white truncate">
              {prompt.title}
            </h3>
          </div>
        </div>

        {/* Details Section (Visible on Hover) */}
        <div
          className={`flex flex-col p-4 w-1/2 bg-card/95 backdrop-blur-sm border-l border-white/10 absolute right-0 top-0 bottom-0 translate-x-full transition-transform duration-500 ${
            isHovered ? "translate-x-0" : ""
          }`}
        >
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <h3 className="font-bold text-lg mb-2">{prompt.title}</h3>
            <Badge variant="outline" className="mb-3">
              {prompt.category?.name || 'Uncategorized'}
            </Badge>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Prompt
              </p>
              <p className="text-sm text-foreground/90 italic leading-relaxed">
                "{prompt.description}"
              </p>
            </div>

            {prompt.tags && prompt.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {prompt.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy prompt"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                title="Edit prompt"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={() => onDelete(prompt.id)}
                title="Delete prompt"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
