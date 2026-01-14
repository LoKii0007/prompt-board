import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PromptBasicDetails({ register, errors }) {
    return (
        <div className="space-y-6">
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
        </div>
    );
}
