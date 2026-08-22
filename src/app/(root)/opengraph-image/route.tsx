import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div style={{ background: "#f4f1ea", color: "#10201f", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "74px 82px", position: "relative", width: "100%" }}>
      <div style={{ background: "#e65332", height: 20, position: "absolute", right: 0, top: 0, width: 290 }} />
      <div style={{ display: "flex", fontSize: 48, fontWeight: 900, letterSpacing: "-0.07em" }}>
        PCPUMP<span style={{ color: "#e65332" }}>.COM</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 880 }}>
        <div style={{ color: "#0f5754", fontSize: 22, fontWeight: 800, letterSpacing: "0.13em", marginBottom: 28, textTransform: "uppercase" }}>Oilfield production systems</div>
        <div style={{ display: "flex", fontFamily: "Georgia", fontSize: 76, letterSpacing: "-0.045em", lineHeight: 0.98 }}>Move difficult fluids with fewer compromises.</div>
      </div>
      <div style={{ borderTop: "2px solid rgba(16,32,31,.18)", display: "flex", fontSize: 19, justifyContent: "space-between", paddingTop: 24 }}>
        <span>PCP · Artificial lift · Drilling · Field service</span>
        <span>sales@pcpump.com</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
