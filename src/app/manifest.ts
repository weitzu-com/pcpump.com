import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PCPUMP.COM",
    short_name: "PCPUMP.COM",
    description: "Oilfield pumping, production, drilling and service equipment.",
    start_url: "/en",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#0f5754",
  };
}
