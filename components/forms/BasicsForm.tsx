"use client";

import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Upload, User } from "lucide-react";
import type { ResumeBasics } from "@/db";
import { useRef, useState, useEffect, useMemo } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface BasicsFormProps {
  data: ResumeBasics;
  onChange: (data: ResumeBasics) => void;
}

export function BasicsForm({ data, onChange }: BasicsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // imagePreview is for URLs created from file uploads (user action)
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Create blob URL for data.image using useMemo (for persisted images)
  // This avoids calling setState in useEffect
  const dataImageUrl = useMemo(() => {
    if (data.image && !imagePreview) {
      return URL.createObjectURL(data.image);
    }
    return null;
  }, [data.image, imagePreview]);

  // Cleanup dataImageUrl when it changes or on unmount
  useEffect(() => {
    return () => {
      if (dataImageUrl) {
        URL.revokeObjectURL(dataImageUrl);
      }
    };
  }, [dataImageUrl]);

  // Cleanup imagePreview on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // The display URL is either from user upload or from persisted data
  const displayImageUrl = imagePreview || dataImageUrl;

  const SOCIAL_NETWORKS = [
    "LinkedIn",
    "GitHub",
    "Twitter",
    "Portfolio",
    "Instagram",
    "Facebook",
  ];

  const updateField = <K extends keyof ResumeBasics>(
    field: K,
    value: ResumeBasics[K],
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateLocation = (field: "city" | "country", value: string) => {
    onChange({
      ...data,
      location: { ...data.location, [field]: value },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous URL to prevent memory leak
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Convert to Blob and store
      file.arrayBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: file.type });
        updateField("image", blob);
      });
    }
  };

  const handleRemoveImage = () => {
    // Revoke URL to prevent memory leak
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    updateField("image", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addProfile = (network?: string) => {
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
  };

  const removeProfile = (index: number) => {
    onChange({
      ...data,
      profiles: data.profiles.filter((_, i) => i !== index),
    });
  };

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

      {/* Profile Photo */}
      <CollapsibleSection title="Profile Photo" icon={User} defaultOpen={true}>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/25">
            {displayImageUrl ? (
              <Image
                src={displayImageUrl}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
            {displayImageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive ml-2"
                onClick={handleRemoveImage}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 2MB
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Personal Info */}
      <CollapsibleSection title="Personal Information" defaultOpen={true}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Professional Title</Label>
              <Input
                id="label"
                placeholder="Software Engineer"
                value={data.label}
                onChange={(e) => updateField("label", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={data.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={data.phone}
                onChange={(e) => updateField("phone", e.target.value)}
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
              type="url"
              placeholder="https://yourportfolio.com"
              value={data.url}
              onChange={(e) => updateField("url", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="San Francisco"
                value={data.location.city}
                onChange={(e) => updateLocation("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="United States"
                value={data.location.country}
                onChange={(e) => updateLocation("country", e.target.value)}
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
              value={data.summary}
              onChange={(value) => updateField("summary", value)}
              placeholder="A brief summary of your professional background and career objectives..."
              minHeight="min-h-[60px]"
            />
          </div>
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
            <Plus className="h-4 w-4 mr-2" />
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
                <Plus className="h-3 w-3 mr-1" />
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
                    <Label>Network</Label>
                    <Input
                      placeholder="LinkedIn"
                      value={profile.network}
                      onChange={(e) =>
                        updateProfile(index, "network", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      placeholder="johndoe"
                      value={profile.username}
                      onChange={(e) =>
                        updateProfile(index, "username", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      type="url"
                      placeholder="https://linkedin.com/in/johndoe"
                      value={profile.url}
                      onChange={(e) =>
                        updateProfile(index, "url", e.target.value)
                      }
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
