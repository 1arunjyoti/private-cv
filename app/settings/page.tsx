"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ensureLLMProvider } from "@/lib/llm/ensure-provider";
import { buildSummaryPrompt } from "@/lib/llm/prompts";
import { redactContactInfo } from "@/lib/llm/redaction";
import { useLLMSettingsStore } from "@/store/useLLMSettingsStore";
import { isCloudSyncEnabled, useSyncStore } from "@/store/useSyncStore";
import {
  ArrowLeft,
  Settings,
  ChevronUp,
  Cloud,
  Link2Off,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/badge";

const GOOGLE_MODELS = [
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
];

const OPENAI_MODELS = [
  { value: "gpt-5-mini", label: "GPT-5 Mini" },
  { value: "gpt-5", label: "GPT-5" },
  { value: "gpt-4.1", label: "GPT-4.1" },
];

const ANTHROPIC_MODELS = [
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  { value: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5" },
  { value: "claude-opus-4-5-20251101", label: "Claude Opus 4.5" },
];
const CUSTOM_MODEL_VALUE = "__custom__";
const GOOGLE_MODEL_VALUES = GOOGLE_MODELS.map((model) => model.value);
const OPENAI_MODEL_VALUES = OPENAI_MODELS.map((model) => model.value);
const ANTHROPIC_MODEL_VALUES = ANTHROPIC_MODELS.map((model) => model.value);

export default function SettingsPage() {
  const router = useRouter();
  const providerId = useLLMSettingsStore((state) => state.providerId);
  const apiKeys = useLLMSettingsStore((state) => state.apiKeys);
  const sessionOnly = useLLMSettingsStore((state) => state.sessionOnly);
  const consent = useLLMSettingsStore((state) => state.consent);
  const redaction = useLLMSettingsStore((state) => state.redaction);
  const tone = useLLMSettingsStore((state) => state.tone);
  const googleModel = useLLMSettingsStore((state) => state.googleModel);
  const openaiModel = useLLMSettingsStore((state) => state.openaiModel);
  const anthropicModel = useLLMSettingsStore((state) => state.anthropicModel);
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
  const setGoogleModel = useLLMSettingsStore((state) => state.setGoogleModel);
  const setOpenAIModel = useLLMSettingsStore((state) => state.setOpenAIModel);
  const setAnthropicModel = useLLMSettingsStore((state) => state.setAnthropicModel);
  const setLocalEndpoint = useLLMSettingsStore((state) => state.setLocalEndpoint);
  const setLocalModel = useLLMSettingsStore((state) => state.setLocalModel);
  const setLocalApiType = useLLMSettingsStore((state) => state.setLocalApiType);

  const provider = useMemo(() => getProvider(providerId), [providerId]);
  const selectedCloudModel = useMemo(() => {
    if (providerId === "google") return googleModel;
    if (providerId === "openai") return openaiModel;
    if (providerId === "anthropic") return anthropicModel;
    return "";
  }, [anthropicModel, googleModel, openaiModel, providerId]);
  const googleModelSelectValue = GOOGLE_MODEL_VALUES.includes(googleModel)
    ? googleModel
    : CUSTOM_MODEL_VALUE;
  const openaiModelSelectValue = OPENAI_MODEL_VALUES.includes(openaiModel)
    ? openaiModel
    : CUSTOM_MODEL_VALUE;
  const anthropicModelSelectValue = ANTHROPIC_MODEL_VALUES.includes(anthropicModel)
    ? anthropicModel
    : CUSTOM_MODEL_VALUE;
  const currentKey = apiKeys[providerId] || "";
  const validateLabel =
    providerId === "local" && localApiType !== "huggingface"
      ? "Validate Connection"
      : "Validate Key";
  const syncProviderId = useSyncStore((state) => state.providerId);
  const syncStatus = useSyncStore((state) => state.status);
  const syncLinkedAccount = useSyncStore((state) => state.linkedAccount);
  const syncError = useSyncStore((state) => state.error);
  const syncAuth = useSyncStore((state) => state.auth);
  const syncLastSyncAt = useSyncStore((state) => state.lastSyncAt);
  const syncEncryptionEnabled = useSyncStore((state) => state.encryptionEnabled);
  const syncPassphrase = useSyncStore((state) => state.passphrase);
  const setSyncProvider = useSyncStore((state) => state.setProvider);
  const setSyncEncryptionEnabled = useSyncStore((state) => state.setEncryptionEnabled);
  const setSyncPassphrase = useSyncStore((state) => state.setPassphrase);
  const connectSync = useSyncStore((state) => state.connect);
  const disconnectSync = useSyncStore((state) => state.disconnect);
  const loadLinkedAccount = useSyncStore((state) => state.loadLinkedAccount);
  const deleteCloudData = useSyncStore((state) => state.deleteCloudData);
  const syncNow = useSyncStore((state) => state.syncNow);
  const restoreFromCloud = useSyncStore((state) => state.restoreFromCloud);

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
  const [privacyNoticeOpen, setPrivacyNoticeOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (!isCloudSyncEnabled) return;
    if (!syncAuth) return;
    if (syncLinkedAccount?.email || syncLinkedAccount?.displayName) return;
    loadLinkedAccount().catch(() => {
      // Non-blocking metadata fetch.
    });
  }, [syncAuth, syncLinkedAccount, loadLinkedAccount]);

  const handleValidate = async () => {
    const result = ensureLLMProvider({
      providerId,
      apiKeys,
      consent,
      requiredConsent: null,
    });
    if ("error" in result) {
      setValidationStatus("invalid");
      setValidationMessage(result.error);
      return;
    }
    setValidationStatus("validating");
    setValidationMessage("");
    try {
      const isValid = await result.provider.validateKey(result.apiKey);
      setValidationStatus(isValid ? "valid" : "invalid");
        if (isValid) {
          setValidationMessage(
            providerId === "local"
              ? `Connected to ${localApiType} at ${localEndpoint} (${localModel})`
              : `${result.provider.label} connected successfully (${selectedCloudModel}).`
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
    const result = ensureLLMProvider({
      providerId,
      apiKeys,
      consent,
      requiredConsent: null,
    });
    if ("error" in result) {
      setTestError(result.error);
      return;
    }
    setIsTesting(true);
    setTestError("");
    setTestOutput("");
    try {
      const sanitizedInput = redaction.stripContactInfo
        ? redactContactInfo(testInput)
        : testInput;
      const output = await result.provider.generateText(result.apiKey, {
        prompt: buildSummaryPrompt(sanitizedInput),
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
            <span className="">Settings</span>
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
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Cloud Sync (BYOS)
              <Badge variant="outline">Beta</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {!isCloudSyncEnabled ? (
              <p className="text-sm text-muted-foreground">
                Cloud sync is disabled in this build. Set
                `NEXT_PUBLIC_ENABLE_CLOUD_SYNC=true` to enable.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="syncProvider">Provider</Label>
                  <Select
                    value={syncProviderId}
                    onValueChange={(value) =>
                      setSyncProvider(value as typeof syncProviderId)
                    }
                  >
                    <SelectTrigger id="syncProvider" className="w-full">
                      <SelectValue placeholder="Select a cloud provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google-drive">Google Drive</SelectItem>
                      <SelectItem value="dropbox" disabled>
                        Dropbox (coming soon)
                      </SelectItem>
                      <SelectItem value="onedrive" disabled>
                        OneDrive (coming soon)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!syncAuth ? (
                    <Button onClick={connectSync}>Connect Google Drive</Button>
                  ) : (
                    <Button variant="outline" onClick={disconnectSync}>
                      <Link2Off className="h-4 w-4" />
                      Disconnect
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={syncNow}
                    disabled={!syncAuth || syncStatus === "syncing"}
                  >
                    {syncStatus === "syncing" ? "Syncing..." : "Sync now"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={restoreFromCloud}
                    disabled={!syncAuth || syncStatus === "syncing"}
                  >
                    Restore from cloud
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const ok = window.confirm(
                        "Delete cloud backup data? This removes the sync file content from your cloud account.",
                      );
                      if (ok) {
                        deleteCloudData();
                      }
                    }}
                    disabled={!syncAuth || syncStatus === "syncing"}
                  >
                    Delete cloud backup
                  </Button>
                </div>

                <div className="rounded-md border bg-muted/20 p-3 text-sm">
                  <p className="font-medium">
                    Status:{" "}
                    <span className="text-muted-foreground">{syncStatus}</span>
                  </p>
                  {syncLinkedAccount?.email ? (
                    <p className="text-muted-foreground">
                      Connected account: {syncLinkedAccount.email}
                    </p>
                  ) : null}
                  {!syncLinkedAccount?.email &&
                  syncLinkedAccount?.displayName ? (
                    <p className="text-muted-foreground">
                      Connected account: {syncLinkedAccount.displayName}
                    </p>
                  ) : null}
                  {syncLastSyncAt ? (
                    <p className="text-muted-foreground">
                      Last sync: {new Date(syncLastSyncAt).toLocaleString()}
                    </p>
                  ) : null}
                  {syncError ? (
                    <p className="mt-2 flex items-start gap-2 text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{syncError}</span>
                    </p>
                  ) : null}
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>Encrypt cloud file</Label>
                    <p className="text-xs text-muted-foreground">
                      If enabled, cloud data is encrypted with your passphrase.
                    </p>
                  </div>
                  <Switch
                    checked={syncEncryptionEnabled}
                    onCheckedChange={setSyncEncryptionEnabled}
                  />
                </div>

                {syncEncryptionEnabled ? (
                  <div className="space-y-2">
                    <Label htmlFor="syncPassphrase">Passphrase</Label>
                    <form onSubmit={(event) => event.preventDefault()}>
                      <Input
                        id="syncPassphrase"
                        type="password"
                        placeholder="Enter passphrase for this session"
                        value={syncPassphrase}
                        onChange={(event) =>
                          setSyncPassphrase(event.target.value)
                        }
                      />
                    </form>
                    <p className="text-xs text-muted-foreground">
                      Passphrase is never stored. If lost, encrypted cloud
                      backups cannot be recovered.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
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
              <form onSubmit={(event) => event.preventDefault()}>
                <div className="flex items-center gap-2">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={currentKey}
                    onChange={(event) => setApiKey(providerId, event.target.value)}
                    placeholder={
                      providerId === "local" && localApiType !== "huggingface"
                        ? "Not required for local models"
                        : "Paste your API key"
                    }
                    disabled={providerId === "local" && localApiType !== "huggingface"}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey((value) => !value)}
                    disabled={providerId === "local" && localApiType !== "huggingface"}
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
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
                    : validateLabel}
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
                  : providerId === "google"
                    ? "Google keys must allow browser usage and have the Generative Language API enabled."
                    : providerId === "openai"
                      ? "OpenAI API key must be active in a project with available quota/billing."
                      : providerId === "anthropic"
                        ? "Anthropic API key must be active and enabled for the selected workspace/project."
                        : "Hugging Face Inference API key is required for Hugging Face local mode."}
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
            ) : (
              <div className="space-y-3">
                {providerId === "google" ? (
                  <div className="space-y-2">
                    <Label htmlFor="googleModel">Google Model</Label>
                    <Select
                      value={googleModelSelectValue}
                      onValueChange={(value) => {
                        if (value === CUSTOM_MODEL_VALUE) {
                          if (GOOGLE_MODEL_VALUES.includes(googleModel)) {
                            setGoogleModel("");
                          }
                          return;
                        }
                        setGoogleModel(value);
                      }}
                    >
                      <SelectTrigger id="googleModel" className="w-full">
                        <SelectValue placeholder="Select a Google model" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOOGLE_MODELS.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                        <SelectItem value={CUSTOM_MODEL_VALUE}>
                          Custom model
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {googleModelSelectValue === CUSTOM_MODEL_VALUE ? (
                      <Input
                        value={googleModel}
                        onChange={(event) => setGoogleModel(event.target.value)}
                        placeholder="Enter custom Google model ID"
                      />
                    ) : null}
                  </div>
                ) : null}

                {providerId === "openai" ? (
                  <div className="space-y-2">
                    <Label htmlFor="openaiModel">OpenAI Model</Label>
                    <Select
                      value={openaiModelSelectValue}
                      onValueChange={(value) => {
                        if (value === CUSTOM_MODEL_VALUE) {
                          if (OPENAI_MODEL_VALUES.includes(openaiModel)) {
                            setOpenAIModel("");
                          }
                          return;
                        }
                        setOpenAIModel(value);
                      }}
                    >
                      <SelectTrigger id="openaiModel" className="w-full">
                        <SelectValue placeholder="Select an OpenAI model" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPENAI_MODELS.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                        <SelectItem value={CUSTOM_MODEL_VALUE}>
                          Custom model
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {openaiModelSelectValue === CUSTOM_MODEL_VALUE ? (
                      <Input
                        value={openaiModel}
                        onChange={(event) => setOpenAIModel(event.target.value)}
                        placeholder="Enter custom OpenAI model ID"
                      />
                    ) : null}
                  </div>
                ) : null}

                {providerId === "anthropic" ? (
                  <div className="space-y-2">
                    <Label htmlFor="anthropicModel">Anthropic Model</Label>
                    <Select
                      value={anthropicModelSelectValue}
                      onValueChange={(value) => {
                        if (value === CUSTOM_MODEL_VALUE) {
                          if (ANTHROPIC_MODEL_VALUES.includes(anthropicModel)) {
                            setAnthropicModel("");
                          }
                          return;
                        }
                        setAnthropicModel(value);
                      }}
                    >
                      <SelectTrigger id="anthropicModel" className="w-full">
                        <SelectValue placeholder="Select an Anthropic model" />
                      </SelectTrigger>
                      <SelectContent>
                        {ANTHROPIC_MODELS.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                        <SelectItem value={CUSTOM_MODEL_VALUE}>
                          Custom model
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {anthropicModelSelectValue === CUSTOM_MODEL_VALUE ? (
                      <Input
                        value={anthropicModel}
                        onChange={(event) => setAnthropicModel(event.target.value)}
                        placeholder="Enter custom Anthropic model ID"
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

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
                provider?.status !== "ready"
              }
            >
              {isTesting ? "Generating..." : "Generate Summary"}
            </Button>
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
