import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Pathible - Faith-Based Family Legacy Platform";
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

      {/* Main headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#2C2C2C",
            lineHeight: 1.2,
            display: "flex",
          }}
        >
          Don't leave them a mess.
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#2C2C2C",
            lineHeight: 1.2,
            display: "flex",
          }}
        >
          Leave them a{" "}
          <span
            style={{
              color: "#D4AF37",
              marginLeft: 16,
            }}
          >
            blessing
          </span>
          .
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 24,
          color: "#8B8680",
          marginTop: 30,
          display: "flex",
        }}
      >
        Faith-based family legacy platform for documents, stories, and values.
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
