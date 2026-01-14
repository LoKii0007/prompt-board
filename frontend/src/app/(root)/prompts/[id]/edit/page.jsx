"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import {
    useUpdatePrompt,
    useGetPromptById,
} from "@/hooks/usePrompts";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUploadImage } from "@/hooks/useUpload";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetModels } from "@/hooks/useModels";

// Import new sub-components
import { PromptBasicDetails } from "@/components/features/prompt/PromptBasicDetails";
import { PromptMetadataSelectors } from "@/components/features/prompt/PromptMetadataSelectors";
import { PromptImageUploader } from "@/components/features/prompt/PromptImageUploader";
import { PromptTagsInput } from "@/components/features/prompt/PromptTagsInput";
import { PromptFormActions } from "@/components/features/prompt/PromptFormActions";

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

                        <PromptBasicDetails
                            register={register}
                            errors={errors}
                        />

                        <PromptMetadataSelectors
                            control={control}
                            errors={errors}
                            categories={categories}
                            models={models}
                            categoriesLoading={categoriesLoading}
                            modelsLoading={modelsLoading}
                        />

                        <PromptImageUploader
                            imagePreview={imagePreview}
                            uploadedImageUrl={uploadedImageUrl}
                            uploadImageMutation={uploadImageMutation}
                            handleImageSelect={handleImageSelect}
                            handleRemoveImage={handleRemoveImage}
                            register={register}
                            errors={errors}
                            fileInputRef={fileInputRef}
                        />

                        <PromptTagsInput
                            currentTag={currentTag}
                            setCurrentTag={setCurrentTag}
                            handleAddTag={handleAddTag}
                            tagsList={tagsList}
                            removeTag={removeTag}
                        />

                        <PromptFormActions
                            updatePromptMutation={updatePromptMutation}
                            uploadImageMutation={uploadImageMutation}
                            uploadedImageUrl={uploadedImageUrl}
                            onCancel={() => router.back()}
                        />

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
