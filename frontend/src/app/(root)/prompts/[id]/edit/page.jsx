"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import {
    useUpdatePrompt,
    useGetPromptById,
} from "@/hooks/usePrompts";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUploadImage } from "@/hooks/useUpload";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetModels } from "@/hooks/useModels";

export default function EditPromptPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { isAuthenticated, isLoading: authLoading } = useAuthContext();
    const updatePromptMutation = useUpdatePrompt();
    const uploadImageMutation = useUploadImage();
    const fileInputRef = useRef(null);

    // Fetch existing prompt data
    const {
        data: promptData,
        isLoading: promptLoading,
        error: promptError
    } = useGetPromptById(id);

    const [tagsList, setTagsList] = useState([]);
    const [currentTag, setCurrentTag] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");

    const { data: categoriesData, isLoading: categoriesLoading } = useGetCategories();
    const { data: modelsData, isLoading: modelsLoading } = useGetModels();
    const categories = categoriesData?.data?.categories || [];
    const models = modelsData?.data?.models || [];

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "",
            categoryId: "",
            modelId: "",
        },
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, authLoading, router]);

    // Populate form with existing data
    useEffect(() => {
        if (promptData?.data) {
            const prompt = promptData.data.prompt || promptData.data;
            reset({
                title: prompt.title || "",
                description: prompt.description || "",
                imageUrl: prompt.imageUrl || "",
                categoryId: prompt.categoryId || "",
                modelId: prompt.modelId || "",
            });
            setUploadedImageUrl(prompt.imageUrl);
            setImagePreview(prompt.imageUrl);
            setTagsList(prompt.tags || []);
        }
    }, [promptData, reset]);

    const handleAddTag = (e) => {
        if (e.key === "Enter" && currentTag.trim()) {
            e.preventDefault();
            const trimmedTag = currentTag.trim();
            if (trimmedTag && !tagsList.includes(trimmedTag)) {
                setTagsList([...tagsList, trimmedTag]);
            }
            setCurrentTag("");
        }
    };

    const removeTag = (tag) => {
        setTagsList(tagsList.filter((t) => t !== tag));
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setSelectedImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            const result = await uploadImageMutation.mutateAsync(file);
            if (result?.data?.url) {
                setUploadedImageUrl(result.data.url);
                setValue('imageUrl', result.data.url, { shouldValidate: true });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setUploadedImageUrl("");
        setValue('imageUrl', '', { shouldValidate: true });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data) => {
        try {
            if (!uploadedImageUrl && !data.imageUrl) {
                alert('Please upload an image');
                return;
            }

            const submitData = {
                ...data,
                imageUrl: uploadedImageUrl || data.imageUrl,
                tags: tagsList,
            };

            await updatePromptMutation.mutateAsync({ id, data: submitData });
            router.push("/prompts");
        } catch (error) {
            console.error("Error updating prompt:", error);
        }
    };

    if (authLoading || promptLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (promptError) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="text-center text-red-500">Error loading prompt data.</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Edit Prompt
                    </CardTitle>
                    <CardDescription>
                        Update your prompt details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {updatePromptMutation.error && (
                        <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                            {updatePromptMutation.error?.response?.data?.message ||
                                updatePromptMutation.error?.message ||
                                "Failed to update prompt. Please try again."}
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title (Mandatory)</Label>
                            <Input
                                id="title"
                                placeholder="Ex. Cyberpunk Noir Detective"
                                {...register("title", {
                                    required: "Title is required",
                                    minLength: {
                                        value: 3,
                                        message: "Title must be at least 3 characters",
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: "Title must be less than 100 characters",
                                    },
                                })}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-400">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Prompt (Mandatory)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your image in detail..."
                                className="min-h-[120px]"
                                {...register("description", {
                                    required: "Prompt description is required",
                                    minLength: {
                                        value: 10,
                                        message: "Prompt must be at least 10 characters",
                                    },
                                    maxLength: {
                                        value: 2000,
                                        message: "Prompt must be less than 2000 characters",
                                    },
                                })}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-400">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Category (Mandatory)</Label>
                                <Controller
                                    name="categoryId"
                                    control={control}
                                    rules={{ required: "Category is required" }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={categoriesLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.categoryId && (
                                    <p className="text-sm text-red-400">{errors.categoryId.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="modelId">AI Model (Mandatory)</Label>
                                <Controller
                                    name="modelId"
                                    control={control}
                                    rules={{ required: "Model is required" }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={modelsLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select a model"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {models.map((model) => (
                                                    <SelectItem key={model.id} value={model.id}>
                                                        {model.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.modelId && (
                                    <p className="text-sm text-red-400">{errors.modelId.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Image (Mandatory)</Label>

                            {!imagePreview ? (
                                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        disabled={uploadImageMutation.isPending}
                                    />
                                    <label
                                        htmlFor="image"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <div className="text-sm">
                                            <span className="text-primary hover:underline">
                                                Click to upload
                                            </span>
                                            <span className="text-muted-foreground"> or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="relative rounded-lg overflow-hidden border border-white/10">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-64 object-cover"
                                        />
                                        {uploadImageMutation.isPending && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                                    <p className="text-sm text-white">Uploading...</p>
                                                </div>
                                            </div>
                                        )}
                                        {uploadedImageUrl && !uploadImageMutation.isPending && (
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                    <ImageIcon className="h-3 w-3 mr-1" />
                                                    Uploaded
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveImage}
                                        className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                        disabled={uploadImageMutation.isPending}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Remove Image
                                    </Button>
                                </div>
                            )}

                            {uploadImageMutation.error && (
                                <p className="text-sm text-red-400">
                                    {uploadImageMutation.error?.response?.data?.message ||
                                        uploadImageMutation.error?.message ||
                                        "Failed to upload image. Please try again."}
                                </p>
                            )}

                            {errors.imageUrl && (
                                <p className="text-sm text-red-400">{errors.imageUrl.message}</p>
                            )}

                            <input
                                type="hidden"
                                {...register("imageUrl", {
                                    required: "Image is required",
                                    validate: (value) => {
                                        if (!uploadedImageUrl && !value) {
                                            return "Please upload an image";
                                        }
                                        return true;
                                    },
                                })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (Optional)</Label>
                            <Input
                                id="tags"
                                placeholder="Press Enter to add tags (e.g., neon, dark)"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tagsList.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                disabled={updatePromptMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary text-primary-foreground min-w-[120px]"
                                disabled={updatePromptMutation.isPending || uploadImageMutation.isPending || !uploadedImageUrl}
                            >
                                {updatePromptMutation.isPending ? "Updating..." : uploadImageMutation.isPending ? "Uploading..." : "Update Prompt"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
