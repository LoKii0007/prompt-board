"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetModels } from "@/hooks/useModels";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateModel,
  useUpdateModel,
  useDeleteModel,
} from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";

export default function AdminCMSPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("categories");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if admin is authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push("/auth/admin/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Admin CMS</h1>
        <p className="text-muted-foreground">
          Manage categories and models for the platform.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <Button
          variant={activeTab === "categories" ? "default" : "ghost"}
          onClick={() => setActiveTab("categories")}
          className="rounded-b-none"
        >
          Categories
        </Button>
        <Button
          variant={activeTab === "models" ? "default" : "ghost"}
          onClick={() => setActiveTab("models")}
          className="rounded-b-none"
        >
          Models
        </Button>
      </div>

      {activeTab === "categories" ? (
        <CategoriesManager
          editingId={editingCategory}
          setEditingId={setEditingCategory}
        />
      ) : (
        <ModelsManager
          editingId={editingModel}
          setEditingId={setEditingModel}
        />
      )}
    </div>
  );
}

function CategoriesManager({ editingId, setEditingId }) {
  const { data, isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const categories = data?.data?.categories || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const editingCategory = categories.find((c) => c.id === editingId);

  // Load editing data
  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        description: editingCategory.description,
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [editingCategory, reset]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        setEditingId(null);
      } else {
        await createMutation.mutateAsync(data);
      }
      reset();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(
          error?.response?.data?.message ||
            "Failed to delete category. It may have associated prompts."
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Category" : "Create Category"}
          </CardTitle>
          <CardDescription>
            {editingId
              ? "Update category information"
              : "Add a new category to the platform"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(createMutation.error || updateMutation.error) && (
            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {createMutation.error?.response?.data?.message ||
                updateMutation.error?.response?.data?.message ||
                "Failed to save category"}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Category name"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Name must be less than 50 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Category description"
                className="min-h-[100px]"
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 5,
                    message: "Description must be at least 5 characters",
                  },
                  maxLength: {
                    value: 500,
                    message: "Description must be less than 500 characters",
                  },
                })}
              />
              {errors.description && (
                <p className="text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
                className="flex-1"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? "Update" : "Create"}
                  </>
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    reset();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
          <CardDescription>All available categories</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No categories yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(category.id)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ModelsManager({ editingId, setEditingId }) {
  const { data, isLoading } = useGetModels();
  const createMutation = useCreateModel();
  const updateMutation = useUpdateModel();
  const deleteMutation = useDeleteModel();
  const models = data?.data?.models || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const editingModel = models.find((m) => m.id === editingId);

  // Load editing data
  useEffect(() => {
    if (editingModel) {
      reset({
        name: editingModel.name,
        description: editingModel.description,
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [editingModel, reset]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        setEditingId(null);
      } else {
        await createMutation.mutateAsync(data);
      }
      reset();
    } catch (error) {
      console.error("Error saving model:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this model?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting model:", error);
        alert(
          error?.response?.data?.message ||
            "Failed to delete model. It may have associated prompts."
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Model" : "Create Model"}</CardTitle>
          <CardDescription>
            {editingId
              ? "Update model information"
              : "Add a new model to the platform"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(createMutation.error || updateMutation.error) && (
            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {createMutation.error?.response?.data?.message ||
                updateMutation.error?.response?.data?.message ||
                "Failed to save model"}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">Name</Label>
              <Input
                id="model-name"
                placeholder="Model name"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Name must be less than 50 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-description">Description</Label>
              <Textarea
                id="model-description"
                placeholder="Model description"
                className="min-h-[100px]"
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 5,
                    message: "Description must be at least 5 characters",
                  },
                  maxLength: {
                    value: 500,
                    message: "Description must be less than 500 characters",
                  },
                })}
              />
              {errors.description && (
                <p className="text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
                className="flex-1"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? "Update" : "Create"}
                  </>
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    reset();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Models ({models.length})</CardTitle>
          <CardDescription>All available models</CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No models yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{model.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {model.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(model.id)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(model.id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
