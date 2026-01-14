import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export function PromptImageUploader({
    imagePreview,
    uploadedImageUrl,
    uploadImageMutation,
    handleImageSelect,
    handleRemoveImage,
    register,
    errors,
    fileInputRef
}) {
    return (
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
    );
}
