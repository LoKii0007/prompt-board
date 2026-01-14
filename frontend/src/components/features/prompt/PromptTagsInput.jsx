import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function PromptTagsInput({
    currentTag,
    setCurrentTag,
    handleAddTag,
    tagsList,
    removeTag
}) {
    return (
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
    );
}
