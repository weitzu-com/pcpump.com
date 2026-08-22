import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#0f5754", color: "white", display: "flex", fontSize: 35, fontWeight: 900, height: "100%", justifyContent: "center", letterSpacing: "-0.08em", width: "100%" }}>
      PC
    </div>,
    size,
  );
}
