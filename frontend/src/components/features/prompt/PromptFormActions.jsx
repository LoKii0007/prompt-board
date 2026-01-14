import { Button } from "@/components/ui/button";

export function PromptFormActions({
    updatePromptMutation,
    uploadImageMutation,
    uploadedImageUrl,
    onCancel
}) {
    return (
        <div className="pt-4 flex justify-end gap-4">
            <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
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
    );
}
