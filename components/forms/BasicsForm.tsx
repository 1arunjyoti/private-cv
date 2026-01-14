"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Upload, User } from "lucide-react";
import type { ResumeBasics } from "@/db";
import { useRef, useState } from "react";

interface BasicsFormProps {
  data: ResumeBasics;
  onChange: (data: ResumeBasics) => void;
}

export function BasicsForm({ data, onChange }: BasicsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const updateField = <K extends keyof ResumeBasics>(
    field: K,
    value: ResumeBasics[K]
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

  const addProfile = () => {
    onChange({
      ...data,
      profiles: [...data.profiles, { network: "", username: "", url: "" }],
    });
  };

  const removeProfile = (index: number) => {
    onChange({
      ...data,
      profiles: data.profiles.filter((_, i) => i !== index),
    });
  };

  const updateProfile = (
    index: number,
    field: "network" | "username" | "url",
    value: string
  ) => {
    const newProfiles = [...data.profiles];
    newProfiles[index] = { ...newProfiles[index], [field]: value };
    onChange({ ...data, profiles: newProfiles });
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/25">
              {imagePreview || data.image ? (
                <img
                  src={
                    imagePreview ||
                    (data.image ? URL.createObjectURL(data.image) : "")
                  }
                  alt="Profile"
                  className="h-full w-full object-cover"
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
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                placeholder="+1 (555) 123-4567"
                value={data.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
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
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              placeholder="A brief summary of your professional background and career objectives..."
              className="min-h-[120px]"
              value={data.summary}
              onChange={(e) => updateField("summary", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Social Profiles
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProfile}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
