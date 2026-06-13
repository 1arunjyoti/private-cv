import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Ollama proxy API" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, model, prompt, temperature, maxTokens, apiKey } = body;

    if (!endpoint || !model || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: endpoint, model, prompt" },
        { status: 400 }
      );
    }

    const url = `${endpoint.replace(/\/$/, "")}/api/generate`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: temperature ?? 0.5,
          num_predict: maxTokens ?? 512,
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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
