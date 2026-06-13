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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
            fontFamily: "system-ui, -apple-system, sans-serif",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              top: "-100px",
              left: "-100px",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              bottom: "-80px",
              right: "-80px",
              display: "flex",
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              padding: "50px 80px 60px 80px",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* Header section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 900,
                  color: "white",
                  letterSpacing: "-6px",
                  marginBottom: "10px",
                  display: "flex",
                  textShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
              >
                PrivateCV
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.95)",
                  letterSpacing: "1px",
                  display: "flex",
                }}
              >
                Professional Resume Builder for the Privacy-Conscious
              </div>
            </div>

            {/* Features grid */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Row 1 */}
              <div style={{ display: "flex", gap: "20px" }}>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    padding: "16px 24px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: 32, display: "flex" }}>🔒</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "white",
                        display: "flex",
                      }}
                    >
                      100% Private
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                      }}
                    >
                      Zero data collection
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    padding: "16px 24px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: 32, display: "flex" }}>📶</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "white",
                        display: "flex",
                      }}
                    >
                      Offline PWA
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                      }}
                    >
                      Works without internet
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: "flex", gap: "20px" }}>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    padding: "16px 24px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: 32, display: "flex" }}>🤖</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "white",
                        display: "flex",
                      }}
                    >
                      AI-Powered
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                      }}
                    >
                      ATS score & job matching
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    padding: "16px 24px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: 32, display: "flex" }}>🎨</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "white",
                        display: "flex",
                      }}
                    >
                      14 Templates
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                      }}
                    >
                      Fully customizable
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  color: "rgba(255, 255, 255, 0.9)",
                  display: "flex",
                  fontWeight: 500,
                }}
              >
                ⚡ Export to PDF, DOCX, JSON • Import from LinkedIn, PDF, DOCX
              </div>
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
