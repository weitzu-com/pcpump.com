import { drives, materials, pumps } from "@/lib/pcp-data";

type Prop = { name: string; value: string | number; unitText?: string };
const prop = ({ name, value, unitText }: Prop) => ({ "@type": "PropertyValue", name, value, ...(unitText ? { unitText } : {}) });

/**
 * Product list for the PCP catalog pages. Uses only the brochure-transcribed fields shown on the page
 * (same as /resources/*.csv). No brand, price, offer, rating or review data is asserted.
 */
export function pcpProductListJsonLd(slug: string, pageUrl: string) {
  const items =
    slug === "downhole-pumps"
      ? pumps.map((p) => ({
          name: `${p.model} downhole progressive cavity pump`,
          sku: p.model,
          category: "Downhole progressive cavity pump (PCP)",
          additionalProperty: [
            prop({ name: "Family", value: p.family }),
            prop({ name: "Displacement", value: p.displacement, unitText: "ml/rev" }),
            prop({ name: "Brochure reference flow at 100 rpm", value: p.flow100, unitText: "m³/day" }),
            prop({ name: "Stages", value: p.stages }),
            prop({ name: "Water-column head", value: p.head, unitText: "m" }),
          ],
        }))
      : slug === "pcp-elastomers"
        ? materials.map((m) => ({
            name: `${m.model} PCP stator elastomer compound`,
            sku: m.model,
            category: "Progressive cavity pump stator elastomer",
            description: m.description,
            additionalProperty: [
              prop({ name: "Brochure material working temperature", value: m.work, unitText: "°C" }),
              prop({ name: "Brochure material maximum temperature", value: m.max, unitText: "°C" }),
            ],
          }))
        : slug === "surface-drive-pcp"
          ? drives.map((d) => ({
              name: `${d.model} PCP surface drivehead`,
              sku: d.model,
              category: `PCP surface drivehead (${d.type})`,
              additionalProperty: [
                prop({ name: "Speed", value: d.speed, unitText: "rpm" }),
                prop({ name: "Torque", value: d.torque, unitText: "N·m" }),
                prop({ name: "Power", value: d.power, unitText: "kW" }),
                prop({ name: "Axial load", value: d.load }),
              ],
            }))
          : null;
  if (!items) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "Product", ...item } })),
  };
}
