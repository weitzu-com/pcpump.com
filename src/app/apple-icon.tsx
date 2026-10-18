import { ImageResponse } from "next/og";

// Same mark as icon.tsx at 180px, also used as the Organization logo (>=112px).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#0f5754", color: "white", display: "flex", fontSize: 98, fontWeight: 900, height: "100%", justifyContent: "center", letterSpacing: "-0.08em", width: "100%" }}>
      PC
    </div>,
    size,
  );
}
