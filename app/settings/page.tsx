"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LLM_PROVIDERS, getProvider } from "@/lib/llm/providers";
import { buildSummaryPrompt } from "@/lib/llm/prompts";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { ArrowLeft, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const router = useRouter();
  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const sessionOnly = useLLMSettingsStore((state) => state.sessionOnly);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const tone = useLLMSettingsStore((state) => state.tone);
  const localEndpoint = useLLMSettingsStore((state) => state.localEndpoint);
  const localModel = useLLMSettingsStore((state) => state.localModel);
  const localApiType = useLLMSettingsStore((state) => state.localApiType);
  const setProviderId = useLLMSettingsStore((state) => state.setProviderId);
  const setApiKey = useLLMSettingsStore((state) => state.setApiKey);
  const clearApiKey = useLLMSettingsStore((state) => state.clearApiKey);
  const setSessionOnly = useLLMSettingsStore((state) => state.setSessionOnly);
  const setConsent = useLLMSettingsStore((state) => state.setConsent);
  const setRedaction = useLLMSettingsStore((state) => state.setRedaction);
  const setTone = useLLMSettingsStore((state) => state.setTone);
  const setLocalEndpoint = useLLMSettingsStore((state) => state.setLocalEndpoint);
  const setLocalModel = useLLMSettingsStore((state) => state.setLocalModel);
  const setLocalApiType = useLLMSettingsStore((state) => state.setLocalApiType);

  const provider = useMemo(() => getProvider(providerId), [providerId]);
  const currentKey = apiKeys[providerId] || "";

  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");

  const [testInput, setTestInput] = useState(
    "Senior frontend engineer with 7 years of experience building B2B SaaS products, leading UI migrations, and improving performance.",
  );
  const [testOutput, setTestOutput] = useState("");
  const [testError, setTestError] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [privacyNoticeOpen, setPrivacyNoticeOpen] = useState(true);

  const handleValidate = async () => {
    if (!provider || provider.status !== "ready") {
      setValidationStatus("invalid");
      setValidationMessage("Selected provider is not available yet.");
      return;
    }
    const requiresKey = !(providerId === "local" && localApiType !== "huggingface");
    if (requiresKey && !currentKey) {
      setValidationStatus("invalid");
      setValidationMessage("Please provide an API key.");
      return;
    }
    setValidationStatus("validating");
    setValidationMessage("");
    try {
      const isValid = await provider.validateKey(currentKey);
      setValidationStatus(isValid ? "valid" : "invalid");
      if (isValid) {
        setValidationMessage(
          providerId === "local"
            ? `Connected to ${localApiType} at ${localEndpoint} (${localModel})`
            : `${provider.label} connected successfully.`
        );
      } else {
        setValidationMessage(
          providerId === "local"
            ? `Connection failed. Check: endpoint=${localEndpoint}, model=${localModel}, type=${localApiType}`
            : "API key validation failed."
        );
      }
    } catch (err) {
      setValidationStatus("invalid");
      setValidationMessage(`Error: ${(err as Error).message}`);
    }
  };

  const handleTestSummary = async () => {
    if (!provider || provider.status !== "ready") {
      setTestError("Selected provider is not available yet.");
      return;
    }
    const requiresKey = !(providerId === "local" && localApiType !== "huggingface");
    if (requiresKey && !currentKey) {
      setTestError("Please provide an API key first.");
      return;
    }
    setIsTesting(true);
    setTestError("");
    setTestOutput("");
    try {
      const output = await provider.generateText(currentKey, {
        prompt: buildSummaryPrompt(testInput),
        temperature: 0.5,
        maxTokens: 256,
      });
      setTestOutput(output);
    } catch (err) {
      setTestError((err as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="landing-container mx-auto px-4 h-16 flex items-center justify-between relative">
          <Button variant="ghost" size="sm" className="gap-2 pl-2 pr-2 sm:pr-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-lg flex items-center gap-2 whitespace-nowrap">
            <Settings className="h-5 w-5" />
            <span className="">LLM Settings</span>
            <Badge variant="outline" className="ml-1">Beta</Badge>
          </div>

          <div className="w-25 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-900 dark:text-amber-100">Privacy Notice</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPrivacyNoticeOpen(!privacyNoticeOpen)}
                className="h-6 w-6 p-0"
              >
                <ChevronUp
                  className={`h-4 w-4 text-amber-900 dark:text-amber-100 transition-transform ${
                    privacyNoticeOpen ? "" : "rotate-180"
                  }`}
                />
              </Button>
            </div>
          </CardHeader>
          {privacyNoticeOpen && (
            <CardContent className="space-y-3">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                When you use LLM features like text generation, grammar checking, and content improvement, your resume data is sent to your selected AI provider (Google, OpenAI, Anthropic, or your local model).
              </p>
              <ul className="text-sm text-amber-900 dark:text-amber-100 space-y-2 pl-4">
                <li>• <strong>Local models:</strong> Data stays on your machine. No external requests.</li>
                <li>• <strong>Cloud providers:</strong> Data is sent to their servers and subject to their privacy policies.</li>
                <li>• <strong>No local storage:</strong> PrivateCV never stores your data. Your resume stays with you.</li>
                <li>• <strong>Redaction option:</strong> Enable contact info stripping below to remove sensitive data before sending.</li>
              </ul>
              <p className="text-xs text-amber-800 dark:text-amber-200 pt-2">
                Review each provider&apos;s privacy policy before enabling AI features. By using these features, you consent to data being sent to your chosen provider.
              </p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider & Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={providerId}
                onValueChange={(value) =>
                  setProviderId(value as typeof providerId)
                }
              >
                <SelectTrigger id="provider" className="w-full">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {LLM_PROVIDERS.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      disabled={item.status !== "ready"}
                    >
                      {item.label}
                      {item.status !== "ready" ? " (coming soon)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={currentKey}
                onChange={(event) => setApiKey(providerId, event.target.value)}
                placeholder={
                  providerId === "local" && localApiType !== "huggingface"
                    ? "Not required for local models"
                    : "Paste your API key"
                }
                disabled={providerId === "local" && localApiType !== "huggingface"}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidate}
                  disabled={
                    (providerId !== "local" && !currentKey) ||
                    (providerId === "local" &&
                      localApiType === "huggingface" &&
                      !currentKey) ||
                    provider?.status !== "ready"
                  }
                >
                  {validationStatus === "validating"
                    ? "Validating..."
                    : "Validate Key"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearApiKey(providerId)}
                  disabled={!currentKey}
                >
                  Clear
                </Button>
                {validationMessage ? (
                  <span className="text-sm text-muted-foreground">
                    {validationMessage}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {providerId === "local" && localApiType !== "huggingface"
                  ? "API key not required for local models (Ollama, LM Studio, OpenAI-compatible)."
                  : "Google keys must allow browser usage and have the Generative Language API enabled."}
              </p>
            </div>

            {providerId === "local" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="localApiType">Local API Type</Label>
                  <Select
                    value={localApiType}
                    onValueChange={(value) =>
                      setLocalApiType(value as typeof localApiType)
                    }
                  >
                    <SelectTrigger className="w-full" id="localApiType">
                      <SelectValue placeholder="Select API type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI-Compatible</SelectItem>
                      <SelectItem value="ollama">Ollama</SelectItem>
                      <SelectItem value="lmstudio">LM Studio</SelectItem>
                      <SelectItem value="huggingface">
                        Hugging Face Inference
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localEndpoint">Local Endpoint</Label>
                  <Input
                    id="localEndpoint"
                    value={localEndpoint}
                    onChange={(event) => setLocalEndpoint(event.target.value)}
                    placeholder="http://localhost:1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localModel">Model</Label>
                  <Input
                    id="localModel"
                    value={localModel}
                    onChange={(event) => setLocalModel(event.target.value)}
                    placeholder="google/gemma-3-4b"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>LM Studio:</strong> /v1/chat/completions (OpenAI-compatible, also supports /api/v1/chat, /v1/messages). 
                  <strong>OpenAI-compatible:</strong> /v1/chat/completions. 
                  <strong>Ollama:</strong> /api/generate. 
                  <strong>Hugging Face:</strong> /models/{"{model}"}.
                </p>
              </div>
            ) : null}

            <Separator />

            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Session-only key storage</Label>
                <p className="text-xs text-muted-foreground">
                  If enabled, API keys are not persisted after you close the
                  browser.
                </p>
              </div>
              <Switch
                checked={sessionOnly}
                onCheckedChange={setSessionOnly}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consent & Redaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Content generation</Label>
                <p className="text-xs text-muted-foreground">
                  Allow the LLM to generate or expand resume sections.
                </p>
              </div>
              <Switch
                checked={consent.generation}
                onCheckedChange={(value) => setConsent("generation", value)}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Analysis & matching</Label>
                <p className="text-xs text-muted-foreground">
                  Allow job description analysis and keyword suggestions.
                </p>
              </div>
              <Switch
                checked={consent.analysis}
                onCheckedChange={(value) => setConsent("analysis", value)}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Rewriting</Label>
                <p className="text-xs text-muted-foreground">
                  Allow style and tone rewrites of existing text.
                </p>
              </div>
              <Switch
                checked={consent.rewriting}
                onCheckedChange={(value) => setConsent("rewriting", value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Tone for Rewrites</Label>
              <Select value={tone} onValueChange={(value) => setTone(value as typeof tone)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used for rewrite and improvement actions.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Redact contact info by default</Label>
                <p className="text-xs text-muted-foreground">
                  Email, phone, and links are removed unless you explicitly
                  allow them.
                </p>
              </div>
              <Switch
                checked={redaction.stripContactInfo}
                onCheckedChange={(value) =>
                  setRedaction("stripContactInfo", value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test: Generate Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testInput">Input</Label>
              <Textarea
                id="testInput"
                value={testInput}
                onChange={(event) => setTestInput(event.target.value)}
              />
            </div>
            <Button
              onClick={handleTestSummary}
              disabled={
                isTesting ||
                (providerId !== "local" && !currentKey) ||
                (providerId === "local" && localApiType === "huggingface" && !currentKey) ||
                provider?.status !== "ready" ||
                !consent.generation
              }
            >
              {isTesting ? "Generating..." : "Generate Summary"}
            </Button>
            {!consent.generation ? (
              <p className="text-xs text-muted-foreground">
                Enable content generation consent to run the test.
              </p>
            ) : null}
            {testOutput ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                {testOutput}
              </div>
            ) : null}
            {testError ? (
              <p className="text-sm text-destructive">{testError}</p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
