/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "PrivateCV - Privacy-First Resume Creator";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(to bottom right, #eff6ff, #dbeafe)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontSize: 100,
                fontWeight: 900,
                color: "#1e40af",
                letterSpacing: "-4px",
              }}
            >
              PrivateCV
            </div>
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#3b82f6",
              marginBottom: "60px",
              textAlign: "center",
            }}
          >
            The Privacy-First Resume Creator
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <div
              style={{
                background: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "2px solid #bfdbfe",
                fontSize: 28,
                color: "#1e3a8a",
              }}
            >
              🔒 Private
            </div>
            <div
              style={{
                background: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "2px solid #bfdbfe",
                fontSize: 28,
                color: "#1e3a8a",
              }}
            >
              ✈️ Offline
            </div>
            <div
              style={{
                background: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "2px solid #bfdbfe",
                fontSize: 28,
                color: "#1e3a8a",
              }}
            >
              📄 ATS Ready
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
