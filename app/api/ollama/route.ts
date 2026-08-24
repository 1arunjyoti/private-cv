import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Resolve a hostname to IP addresses and reject private, loopback, link-local
 * and other non-public targets so the proxy cannot be abused for SSRF against
 * internal networks or cloud metadata endpoints.
 */
async function isPublicHost(hostname: string): Promise<boolean> {
  // Literal IPs can be validated directly.
  const v4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    return isPublicIpv4(v4.slice(1).map(Number));
  }
  if (hostname === "::1" || hostname === "[::1]") return false;

  try {
    const { lookup } = await import("node:dns/promises");
    const records = await lookup(hostname, { all: true, verbatim: true });
    if (records.length === 0) return false;
    return records.every((record) => {
      if (record.family === 4) {
        return isPublicIpv4(record.address.split(".").map(Number));
      }
      const address = record.address.toLowerCase();
      return (
        address !== "::1" &&
        !address.startsWith("fe80:") &&
        !address.startsWith("fc") &&
        !address.startsWith("fd") &&
        !address.startsWith("::ffff:127.")
      );
    });
  } catch {
    // DNS resolution failed - treat as unsafe rather than falling through.
    return false;
  }
}

function isPublicIpv4(octets: number[]): boolean {
  const [a, b] = octets;
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  if (a === 0 || a === 10 || a === 127) return false; // this-network, private, loopback
  if (a === 169 && b === 254) return false; // link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return false; // private
  if (a === 192 && b === 168) return false; // private
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
  if (a >= 224) return false; // multicast / reserved
  return true;
}

type EndpointValidation =
  | { ok: true; url: URL }
  | { ok: false; error: string };

function getAllowedHosts(): Set<string> {
  const raw = process.env.OLLAMA_PROXY_ALLOWED_HOSTS ?? "";
  return new Set(
    raw
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function validateEndpoint(rawEndpoint: unknown): Promise<EndpointValidation> {
  if (typeof rawEndpoint !== "string" || rawEndpoint.trim() === "") {
    return { ok: false, error: "Missing required fields: endpoint, model, prompt" };
  }

  let url: URL;
  try {
    url = new URL(rawEndpoint);
  } catch {
    return { ok: false, error: "Invalid endpoint URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Endpoint must use http or https." };
  }

  // Block credentials in the URL (they would be sent to a third party).
  if (url.username || url.password) {
    return { ok: false, error: "Endpoint must not contain credentials." };
  }

  const portBlocked = url.port === "25" || url.port === "587" || url.port === "465";
  if (portBlocked) {
    return { ok: false, error: "Endpoint port is not allowed." };
  }

  // Self-hosted deployments can explicitly opt in additional hosts
  // (e.g. an internal LLM gateway) via OLLAMA_PROXY_ALLOWED_HOSTS.
  const hostname = url.hostname.toLowerCase();
  if (!getAllowedHosts().has(hostname) && !(await isPublicHost(hostname))) {
    return { ok: false, error: "Endpoint host is not allowed." };
  }

  return { ok: true, url };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { model, prompt, temperature, maxTokens, apiKey } = body;

  if (!model || !prompt) {
    return NextResponse.json(
      { error: "Missing required fields: endpoint, model, prompt" },
      { status: 400 }
    );
  }

  const validation = await validateEndpoint(body.endpoint);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const url = `${validation.url.href.replace(/\/$/, "")}/api/generate`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof apiKey === "string" && apiKey.length > 0) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timeoutMs = parsePositiveInt(
    process.env.OLLAMA_PROXY_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  );
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: typeof temperature === "number" ? temperature : 0.5,
          num_predict: typeof maxTokens === "number" ? maxTokens : 512,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ollama request failed: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Guard against unexpectedly huge upstream payloads.
    const contentLength = Number(response.headers.get("content-length") ?? "");
    if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
      return NextResponse.json(
        { error: "Upstream response too large." },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: `Upstream request timed out after ${timeoutMs}ms.` },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
