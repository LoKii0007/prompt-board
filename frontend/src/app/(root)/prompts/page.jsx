"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useGetMyPrompts, useDeletePrompt } from "@/hooks/usePrompts";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { PromptCard } from "@/components/features/prompt/PromptCard";

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
    try {
      await deletePromptMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-700 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-400 p-8 border border-red-500/20 rounded-xl bg-red-500/5">
          Error loading prompts: {error?.response?.data?.message || error.message}
        </div>
      </div>
    );
  }

  const prompts = data?.data?.prompts || [];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col gap-4 md:flex-row items-center md:justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Collections</h1>
          <p className="text-muted-foreground">Manage and organize your AI masterpieces.</p>
        </div>
        <Link href="/prompts/create">
          <Button className="gap-2 rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all w-full md:w-auto max-w-sm">
            <Plus className="h-4 w-4" />
            Create Prompt
          </Button>
        </Link>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-zinc-900 rounded-full">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No prompts created yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Start your journey by creating your first AI prompt collection. It only takes a minute.</p>
          <Link href="/prompts/create">
            <Button variant="outline" className="gap-2">
              Create Your First Prompt
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onDelete={handleDelete}
                isDeleting={deletePromptMutation.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
