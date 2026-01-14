"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, User, Lock, Pencil, X, Check, Eye, EyeOff } from "lucide-react";

export function ProfilePage() {
    const { user, isLoading } = useAuthContext();
    const updateProfileMutation = useUpdateProfile();
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register: registerInfo, handleSubmit: handleSubmitInfo, formState: { errors: errorsInfo }, reset: resetInfo } = useForm({
        defaultValues: {
            name: "",
            email: "",
        }
    });

    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, reset: resetPassword, watch } = useForm();

    useEffect(() => {
        if (user) {
            resetInfo({
                name: user.name || "",
                email: user.email || "",
            });
        }
    }, [user, resetInfo]);

    const onUpdateInfo = async (data) => {
        try {
            await updateProfileMutation.mutateAsync({ name: data.name });
            toast.success("Profile updated successfully");
            resetInfo({ ...data, email: user.email }); // Keep email as is
            setIsEditingInfo(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update profile");
        }
    };

    const onUpdatePassword = async (data) => {
        try {
            await updateProfileMutation.mutateAsync({
                oldPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast.success("Password updated successfully");
            resetPassword();
            setIsEditingPassword(false);
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update password");
        }
    };

    const handleCancelInfo = () => {
        resetInfo({
            name: user.name || "",
            email: user.email || "",
        });
        setIsEditingInfo(false);
    };

    const handleCancelPassword = () => {
        resetPassword();
        setIsEditingPassword(false);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center py-10">Please log in to view your profile.</div>;
    }

    const userInitial = user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U");

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{userInitial}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="mt-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-zinc-950/50 border-white/10 relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Update your display name.</CardDescription>
                        </div>
                        {!isEditingInfo && (
                            <Button variant="ghost" size="icon" onClick={() => setIsEditingInfo(true)} className="h-8 w-8 hover:bg-white/10">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmitInfo(onUpdateInfo)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    {...registerInfo("email")}
                                    disabled
                                    className="bg-muted cursor-not-allowed opacity-70"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    {...registerInfo("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })}
                                    placeholder="Your Name"
                                    disabled={!isEditingInfo}
                                    className={!isEditingInfo ? "bg-muted/30 border-transparent focus-visible:ring-0 px-0" : ""}
                                />
                                {errorsInfo.name && <p className="text-sm text-red-400">{errorsInfo.name.message}</p>}
                            </div>

                            {isEditingInfo && (
                                <div className="flex gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={handleCancelInfo} disabled={updateProfileMutation.isPending} className="flex-1">
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateProfileMutation.isPending} className="flex-1">
                                        {updateProfileMutation.isPending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="mr-2 h-4 w-4" />
                                        )}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950/50 border-white/10 relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Security
                            </CardTitle>
                            <CardDescription>Update your password.</CardDescription>
                        </div>
                        {!isEditingPassword && (
                            <Button variant="ghost" size="icon" onClick={() => setIsEditingPassword(true)} className="h-8 w-8 hover:bg-white/10">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
                            {isEditingPassword ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                {...registerPassword("currentPassword", { required: "Current password is required" })}
                                                placeholder="••••••••"
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {errorsPassword.currentPassword && <p className="text-sm text-red-400">{errorsPassword.currentPassword.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                {...registerPassword("newPassword", {
                                                    required: "New password is required",
                                                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                                                })}
                                                placeholder="••••••••"
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {errorsPassword.newPassword && <p className="text-sm text-red-400">{errorsPassword.newPassword.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                {...registerPassword("confirmPassword", {
                                                    required: "Please confirm your new password",
                                                    validate: (val) => {
                                                        if (watch('newPassword') != val) {
                                                            return "Your passwords do not match";
                                                        }
                                                    }
                                                })}
                                                placeholder="••••••••"
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {errorsPassword.confirmPassword && <p className="text-sm text-red-400">{errorsPassword.confirmPassword.message}</p>}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={handleCancelPassword} disabled={updateProfileMutation.isPending} className="flex-1">
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={updateProfileMutation.isPending} className="flex-1">
                                            {updateProfileMutation.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="mr-2 h-4 w-4" />
                                            )}
                                            Update Password
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 text-center text-muted-foreground text-sm">
                                    <p>Password is hidden for security.</p>
                                    <p>Click the edit icon to change your password.</p>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
