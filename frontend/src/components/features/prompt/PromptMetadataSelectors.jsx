import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function PromptMetadataSelectors({
    control,
    errors,
    categories,
    models,
    categoriesLoading,
    modelsLoading
}) {
    return (
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
    );
}
