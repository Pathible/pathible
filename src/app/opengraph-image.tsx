import { ImageResponse } from "next/og";

// Image metadata
export const alt =
  "Pathible - Get everything in one place for your family, so they never have to sort through the mess.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F6F4F1",
        position: "relative",
      }}
    >
      {/* Background decorative circle - top right */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: 200,
          backgroundColor: "rgba(123, 160, 131, 0.15)",
        }}
      />
      {/* Background decorative circle - bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(212, 175, 55, 0.1)",
        }}
      />

      {/* Logo text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#4B7F52",
          }}
        >
          Pathible
        </span>
      </div>

      {/* Main headline - StoryBrand problem question */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 900,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            color: "#2C2C2C",
            lineHeight: 1.25,
            display: "flex",
          }}
        >
          Have you ever had to sort through
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            color: "#2C2C2C",
            lineHeight: 1.25,
            display: "flex",
          }}
        >
          a loved one&apos;s <span style={{ color: "#D4AF37", marginLeft: 14 }}>mess</span>?
        </div>
      </div>

      {/* Empathy beat */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: "#4B7F52",
          marginTop: 30,
          display: "flex",
        }}
      >
        We have. So we built Pathible.
      </div>

      {/* Supporting tagline */}
      <div
        style={{
          fontSize: 22,
          color: "#8B8680",
          marginTop: 16,
          display: "flex",
        }}
      >
        Get everything in one place for your family. So they never have to.
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 18,
            color: "#4B7F52",
            fontWeight: 500,
          }}
        >
          pathible.com
        </span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
