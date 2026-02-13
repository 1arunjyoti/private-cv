/* eslint-disable @next/next/no-img-element */
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, User, Camera, X, Loader2, Sparkles } from "lucide-react";
import type { ResumeBasics } from "@/db";
import { useCallback, useRef, useState } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { compressImage, validateImageFile } from "@/lib/image-utils";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import {
  generatePromptTextAction,
  improveSectionTextAction,
  grammarCheckSectionTextAction,
} from "@/lib/llm/form-actions";
import {
  buildSummaryPrompt,
} from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";
import { removeBackground } from "@/lib/image-processing";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");

  const [llmError, setLlmError] = useState<string | null>(null);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const tone = useLLMSettingsStore((state) => state.tone);

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

  const handleRemoveBackground = useCallback(async () => {
    if (!data.image) return;
    setIsRemovingBackground(true);
    setImageError(null);

    try {
      // Convert base64/URL to Blob for processing
      const response = await fetch(data.image);
      const blob = await response.blob();

      const processedBlob = await removeBackground(blob);
      const processedFile = new File([processedBlob], "profile-nobg.png", {
        type: "image/png",
      });

      // Re-compress/process using existing logic to ensure consistency
      const result = await compressImage(processedFile, 500);
      setImageSizeKB(result.sizeKB);
      updateField("image", result.dataUrl);
    } catch (err) {
      console.error(err);
      setImageError("Failed to remove background. Please try again.");
    } finally {
      setIsRemovingBackground(false);
    }
  }, [data.image, updateField]);

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

  /** Build context about the person for AI prompts */
  const buildPersonContext = useCallback(() => {
    const parts: string[] = [];
    if (data.name) parts.push(`Full Name: ${data.name}`);
    if (data.label) parts.push(`Professional Title: ${data.label}`);
    if (data.location?.city || data.location?.country) {
      parts.push(
        `Location: ${[data.location?.city, data.location?.country]
          .filter(Boolean)
          .join(", ")}`,
      );
    }
    if (data.email) parts.push(`Email: ${data.email}`);
    if (data.url) parts.push(`Website: ${data.url}`);
    if (data.profiles.length > 0) {
      const profileInfo = data.profiles
        .filter((p) => p.network || p.url)
        .map((p) => `${p.network}: ${p.username || p.url}`)
        .join(", ");
      if (profileInfo) parts.push(`Profiles: ${profileInfo}`);
    }
    const raw = parts.join("\n");
    return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
  }, [data, redaction.stripContactInfo]);

  const buildSummaryInput = useCallback(() => {
    const parts: string[] = [];
    if (data.name) parts.push(`Name: ${data.name}`);
    if (data.label) parts.push(`Title: ${data.label}`);
    if (data.location?.city || data.location?.country) {
      parts.push(
        `Location: ${[data.location?.city, data.location?.country]
          .filter(Boolean)
          .join(", ")}`,
      );
    }
    if (data.summary) parts.push(`Current Summary: ${data.summary}`);
    const raw = parts.join("\n");
    return redaction.stripContactInfo ? redactContactInfo(raw) : raw;
  }, [data, redaction.stripContactInfo]);

  const handleGenerateSummary = useCallback(async () => {
    setLlmError(null);
    setGeneratedSummary("");

    setIsGenerating(true);
    const result = await generatePromptTextAction({
      provider: { providerId, apiKeys, consent },
      requiredConsent: "generation",
      prompt: buildSummaryPrompt(buildSummaryInput()),
      temperature: 0.3,
      maxTokens: 256,
    });
    if (!result.ok) {
      setLlmError(result.error);
    } else {
      setGeneratedSummary(result.text);
    }
    setIsGenerating(false);
  }, [apiKeys, buildSummaryInput, consent, providerId]);

  const handleImproveSummary = useCallback(async () => {
    setLlmError(null);
    setGeneratedSummary("");

    if (!data.summary?.trim()) {
      setLlmError("Add a summary before improving it.");
      return;
    }

    setIsGenerating(true);
    const raw = redaction.stripContactInfo
      ? redactContactInfo(data.summary)
      : data.summary;
    const result = await improveSectionTextAction({
      provider: { providerId, apiKeys, consent },
      section: "summary",
      text: raw,
      tone,
      context: buildPersonContext(),
      temperature: 0.2,
      maxTokens: 256,
    });
    if (!result.ok) {
      setLlmError(result.error);
    } else {
      setGeneratedSummary(result.text);
    }
    setIsGenerating(false);
  }, [
    apiKeys,
    buildPersonContext,
    consent,
    data.summary,
    providerId,
    redaction.stripContactInfo,
    tone,
  ]);

  const handleGrammarSummary = useCallback(async () => {
    setLlmError(null);
    setGeneratedSummary("");

    if (!data.summary?.trim()) {
      setLlmError("Add a summary before checking grammar.");
      return;
    }

    setIsGenerating(true);
    const raw = redaction.stripContactInfo
      ? redactContactInfo(data.summary)
      : data.summary;
    const result = await grammarCheckSectionTextAction({
      provider: { providerId, apiKeys, consent },
      section: "summary",
      text: raw,
      temperature: 0.1,
      maxTokens: 256,
    });
    if (!result.ok) {
      setLlmError(result.error);
    } else if (result.noChanges) {
      setLlmError("✓ No grammar issues found.");
    } else {
      setGeneratedSummary(result.text);
    }
    setIsGenerating(false);
  }, [apiKeys, consent, data.summary, providerId, redaction.stripContactInfo]);

  const handleApplySummary = useCallback(() => {
    if (!generatedSummary) return;
    updateField("summary", generatedSummary);
    setGeneratedSummary("");
    setLlmError(null);
  }, [generatedSummary, updateField]);

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
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {(data.summary || "").length} characters
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImproveSummary}
                  disabled={isGenerating}
                >
                  Improve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGrammarSummary}
                  disabled={isGenerating}
                >
                  Grammar
                </Button>
              </div>
            </div>
            <RichTextEditor
              id="summary"
              value={data.summary}
              onChange={(value) => updateField("summary", value)}
              placeholder="A brief summary of your professional background and career objectives..."
              minHeight="min-h-[60px]"
            />
            {llmError ? (
              <p className="text-xs text-destructive">{llmError}</p>
            ) : null}
            {generatedSummary ? (
              <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Generated Summary
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {generatedSummary}
                </p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={handleApplySummary}>
                    Apply
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                  >
                    Regenerate
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setGeneratedSummary("")}
                  >
                    Discard
                  </Button>
                </div>
              </div>
            ) : null}
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
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRemovingBackground}
                  >
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveBackground}
                    disabled={isRemovingBackground}
                  >
                    {isRemovingBackground ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 mr-2" />
                    )}
                    Remove Background
                  </Button>
                </div>
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

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Photo will be automatically compressed to optimize file size. Only
              templates that support profile photos will display it.
            </p>
            <p className="text-amber-600 dark:text-amber-400">
              Note: JPEG images do not support transparency. Background removal
              will automatically convert images to PNG.
            </p>
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
