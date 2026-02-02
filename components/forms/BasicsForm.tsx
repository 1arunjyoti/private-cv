"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, User, Camera, X, Loader2 } from "lucide-react";
import type { ResumeBasics } from "@/db";
import { useCallback, useRef, useState } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { compressImage, validateImageFile } from "@/lib/image-utils";

// Moved outside component to prevent recreation on every render
const SOCIAL_NETWORKS = [
  "LinkedIn",
  "GitHub",
  "Twitter",
  "Portfolio",
  "Instagram",
  "Facebook",
];

interface BasicsFormProps {
  data: ResumeBasics;
  onChange: (data: ResumeBasics) => void;
}

export function BasicsForm({ data, onChange }: BasicsFormProps) {
  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSizeKB, setImageSizeKB] = useState<number | null>(null);

  const updateField = useCallback(
    <K extends keyof ResumeBasics>(field: K, value: ResumeBasics[K]) => {
      onChange({ ...data, [field]: value });
    },
    [data, onChange],
  );

  // Image upload handler
  const handleImageSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setImageError(validation.error || "Invalid file");
        return;
      }

      setImageError(null);
      setIsCompressing(true);

      try {
        const result = await compressImage(file, 500);
        setImageSizeKB(result.sizeKB);
        updateField("image", result.dataUrl);
      } catch (err) {
        setImageError("Failed to process image. Please try another.");
        console.error("Image compression error:", err);
      } finally {
        setIsCompressing(false);
        // Reset file input so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [updateField],
  );

  const handleRemoveImage = useCallback(() => {
    updateField("image", "");
    setImageSizeKB(null);
    setImageError(null);
  }, [updateField]);

  const updateLocation = useCallback(
    (field: "city" | "country", value: string) => {
      onChange({
        ...data,
        location: { ...data.location, [field]: value },
      });
    },
    [data, onChange],
  );

  const addProfile = useCallback(
    (network?: string) => {
      onChange({
        ...data,
        profiles: [
          ...data.profiles,
          {
            network: network || "",
            username: "",
            url: "",
          },
        ],
      });
    },
    [data, onChange],
  );

  const removeProfile = useCallback(
    (index: number) => {
      onChange({
        ...data,
        profiles: data.profiles.filter((_, i) => i !== index),
      });
    },
    [data, onChange],
  );

  const detectNetworkFromUrl = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("linkedin.com")) return "LinkedIn";
    if (lowerUrl.includes("github.com")) return "GitHub";
    if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com"))
      return "Twitter";
    if (lowerUrl.includes("instagram.com")) return "Instagram";
    if (lowerUrl.includes("facebook.com")) return "Facebook";
    return "";
  };

  const updateProfile = (
    index: number,
    field: "network" | "username" | "url",
    value: string,
  ) => {
    const newProfiles = [...data.profiles];
    const updatedProfile = { ...newProfiles[index], [field]: value };

    if (field === "url" && !updatedProfile.network) {
      const detected = detectNetworkFromUrl(value);
      if (detected) {
        updatedProfile.network = detected;
      }
    }

    newProfiles[index] = updatedProfile;
    onChange({ ...data, profiles: newProfiles });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Basics
        </h2>
      </div>

      {/* Personal Info */}
      <CollapsibleSection title="Personal Information" defaultOpen={true}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => updateField("name", e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Professional Title</Label>
              <Input
                id="label"
                name="label"
                placeholder="Software Engineer"
                value={data.label}
                onChange={(e) => updateField("label", e.target.value)}
                autoComplete="organization-title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={data.email}
                onChange={(e) => updateField("email", e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={data.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                autoComplete="tel"
              />
              <p className="text-[10px] text-muted-foreground">
                Include country code (e.g. +91)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Website / Portfolio</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://johndoe.com"
              value={data.url}
              onChange={(e) => updateField("url", e.target.value)}
              autoComplete="url"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="San Francisco"
                value={data.location.city}
                onChange={(e) => updateLocation("city", e.target.value)}
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="United States"
                value={data.location.country}
                onChange={(e) => updateLocation("country", e.target.value)}
                autoComplete="country-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="summary">Description</Label>
              <span className="text-xs text-muted-foreground">
                {(data.summary || "").length} characters
              </span>
            </div>
            <RichTextEditor
              id="summary"
              value={data.summary}
              onChange={(value) => updateField("summary", value)}
              placeholder="A brief summary of your professional background and career objectives..."
              minHeight="min-h-[60px]"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Profile Photo */}
      <CollapsibleSection title="Profile Photo" defaultOpen={true}>
        <div className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageSelect}
            id="profile-photo-input"
          />

          {/* Upload area or preview */}
          {data.image ? (
            <div className="flex items-center gap-4">
              {/* Image preview */}
              <div className="relative">
                <img
                  src={data.image}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Photo uploaded</p>
                {imageSizeKB && (
                  <p className="text-xs text-muted-foreground">
                    Size: {imageSizeKB}KB
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {isCompressing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Compressing...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload Profile Photo</p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, or WebP (max 5MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {imageError && (
            <p className="text-sm text-destructive">{imageError}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Photo will be automatically compressed to optimize file size. Only
            templates that support profile photos will display it.
          </p>
        </div>
      </CollapsibleSection>

      {/* Social Profiles */}
      <CollapsibleSection
        title="Social Profiles"
        defaultOpen={true}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addProfile()}
          >
            <Plus className="h-4 w-4" />
            Add Profile
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {SOCIAL_NETWORKS.map((network) => (
              <Button
                key={network}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full text-xs h-7"
                onClick={() => addProfile(network)}
              >
                <Plus className="h-3 w-3" />
                {network}
              </Button>
            ))}
          </div>

          {data.profiles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No social profiles added yet. Click &quot;Add Profile&quot; to add
              one.
            </p>
          )}
          {data.profiles.map((profile, index) => (
            <div key={index}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`profile-network-${index}`}>Network</Label>
                    <Input
                      id={`profile-network-${index}`}
                      name={`profile-network-${index}`}
                      placeholder="LinkedIn"
                      value={profile.network}
                      onChange={(e) =>
                        updateProfile(index, "network", e.target.value)
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`profile-username-${index}`}>
                      Username
                    </Label>
                    <Input
                      id={`profile-username-${index}`}
                      name={`profile-username-${index}`}
                      placeholder="johndoe"
                      value={profile.username}
                      onChange={(e) =>
                        updateProfile(index, "username", e.target.value)
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`profile-url-${index}`}>URL</Label>
                    <Input
                      id={`profile-url-${index}`}
                      name={`profile-url-${index}`}
                      type="url"
                      placeholder="https://linkedin.com/in/johndoe"
                      value={profile.url}
                      onChange={(e) =>
                        updateProfile(index, "url", e.target.value)
                      }
                      autoComplete="off"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive mt-6"
                  onClick={() => removeProfile(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
