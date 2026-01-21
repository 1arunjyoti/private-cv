"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Award, Plus, Trash2 } from "lucide-react";
import type { Certificate } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface CertificatesFormProps {
  data: Certificate[];
  onChange: (data: Certificate[]) => void;
}

export function CertificatesForm({ data, onChange }: CertificatesFormProps) {
  const addCertificate = useCallback(() => {
    const newCert: Certificate = {
      id: uuidv4(),
      name: "",
      issuer: "",
      date: "",
      url: "",
      summary: "",
    };
    onChange([...data, newCert]);
  }, [data, onChange]);

  const removeCertificate = useCallback(
    (id: string) => {
      onChange(data.filter((cert) => cert.id !== id));
    },
    [data, onChange],
  );

  const updateCertificate = useCallback(
    (id: string, field: keyof Certificate, value: string) => {
      onChange(
        data.map((cert) =>
          cert.id === id ? { ...cert, [field]: value } : cert,
        ),
      );
    },
    [data, onChange],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificates
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCertificate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certificate
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted rounded-lg">
          No certificates added yet. Click &quot;Add Certificate&quot; to get
          started.
        </div>
      )}

      {data.map((cert, index) => (
        <CollapsibleSection
          key={cert.id}
          title={
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                #{index + 1}
              </span>
              {cert.name || "New Certificate"}
            </span>
          }
          defaultOpen={true}
          actions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeCertificate(cert.id);
              }}
              aria-label="Remove certificate"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certificate Name</Label>
                <Input
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={cert.name}
                  onChange={(e) =>
                    updateCertificate(cert.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input
                  placeholder="e.g. Amazon Web Services"
                  value={cert.issuer}
                  onChange={(e) =>
                    updateCertificate(cert.id, "issuer", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={cert.date}
                  onChange={(e) =>
                    updateCertificate(cert.id, "date", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder="https://..."
                  value={cert.url}
                  onChange={(e) =>
                    updateCertificate(cert.id, "url", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                placeholder="Brief description of the certification..."
                minHeight="min-h-[60px]"
                value={cert.summary}
                onChange={(value) =>
                  updateCertificate(cert.id, "summary", value)
                }
              />
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </div>
  );
}
