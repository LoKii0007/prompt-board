"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetDiscoverPrompts } from "@/hooks/usePrompts";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetModels } from "@/hooks/useModels";
import { DiscoverFilters } from "@/components/features/discover/DiscoverFilters";
import { DiscoverCard } from "@/components/features/discover/DiscoverCard";
import { DiscoverSkeleton } from "@/components/features/discover/DiscoverSkeleton";

export default function DiscoverPage() {
  const [categoryId, setCategoryId] = useState("");
  const [modelId, setModelId] = useState("");
  const [tag, setTag] = useState("");
  // Removed showFilters state as the new design is always visible/sleek

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategories();
  const { data: modelsData, isLoading: modelsLoading } = useGetModels();
  const categories = categoriesData?.data?.categories || [];
  const models = modelsData?.data?.models || [];

  const {
    data,
    isLoading: promptsLoading,
    error,
  } = useGetDiscoverPrompts(
    1,
    50,
    categoryId || null,
    modelId || null,
    tag || null
  );

  const hasActiveFilters = categoryId || modelId || tag;

  const clearFilters = () => {
    setCategoryId("");
    setModelId("");
    setTag("");
  };

  const prompts = data?.data?.prompts || [];

  // Determine if we should show the large header
  // logic: show header if loading OR if there is no content (empty state)
  // hide header if content is loaded and length > 0
  const showHeader = promptsLoading || prompts.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <AnimatePresence>
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="mb-8 overflow-hidden"
          >
            <div className="text-center py-10">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-white via-white/80 to-white/50"
              >
                Discover
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-lg max-w-2xl mx-auto"
              >
                Explore the community's finest AI-generated masterpieces.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DiscoverFilters
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categoriesLoading={categoriesLoading}
        categories={categories}
        modelId={modelId}
        setModelId={setModelId}
        modelsLoading={modelsLoading}
        models={models}
        tag={tag}
        setTag={setTag}
      />

      {promptsLoading ? (
        <DiscoverSkeleton />
      ) : error ? (
        <div className="text-center py-20 text-red-400 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-lg font-semibold mb-2">Error loading prompts</p>
          <p className="text-sm opacity-80">
            {error?.response?.data?.message || error.message}
          </p>
        </div>
      ) : prompts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm"
        >
          <p className="text-xl text-muted-foreground mb-4">
            {hasActiveFilters
              ? "No prompts found matching your filters."
              : "No prompts available yet."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-2"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mx-auto pb-20"
        >
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="break-inside-avoid mb-4">
              <DiscoverCard prompt={prompt} />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
