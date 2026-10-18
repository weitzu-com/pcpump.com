export const systems = ["Surface PCP", "ESPCP", "Surface drive", "Not sure yet"];
export const inquiryFields = {
 name:"Full name",company:"Company",email:"Work email",country:"Project country",system:"System",models:"Models of interest",application:"Application",requirements:"Project requirements",
 flow:"Target flow (m³/day)",depth:"Setting depth (m)",diameter:"Minimum wellbore diameter (mm)",temperature:"Fluid temperature (°C)",viscosity:"Viscosity (cP)",viscosityTemperature:"Viscosity measurement temperature (°C)",sand:"Sand content (%)",water:"Water cut (%)",gas:"Gas / CO₂ / H₂S information",power:"Available power / voltage",existing:"Existing equipment",torque:"Required torque (N·m)",load:"Required axial load (kN)",speed:"Operating speed (rpm)"
} as const;
export type InquiryFields = Record<keyof typeof inquiryFields,string>;
export function validateInquiry(fields: InquiryFields): string | null {
 for (const key of ["name","company","email","country","requirements"] as const) if(!fields[key]?.trim()) return `${inquiryFields[key]} is required.`;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return "Enter a valid email address.";
 if(!systems.includes(fields.system)) return "Choose a system.";
 if(fields.requirements.trim().length<15) return "Describe your project in at least 15 characters.";
 for(const key of ["flow","depth","diameter","temperature","viscosity","viscosityTemperature","sand","water","torque","load","speed"] as const) {
  const value=fields[key]; if(!value) continue; const n=Number(value);
  if(!Number.isFinite(n)||(!["temperature","viscosityTemperature"].includes(key)&&n<0)||(["sand","water"].includes(key)&&n>100)) return `Check ${inquiryFields[key]}.`;
 }
 return null;
}
