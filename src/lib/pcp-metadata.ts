import {pumps,materials,drives} from './pcp-data';
export const pcpShareImage='/opengraph-image?v=20261018';
export const pcpSearchMeta:Record<string,{title:string;description:string}>={
 'pcp-systems':{title:'Progressive Cavity Pump (PCP) Artificial Lift Systems',description:'Explore progressive cavity pump (PCP pump) systems for artificial lift, also known as progressing cavity pumps. Review downhole pumps, elastomers, surface driveheads and the well conditions needed for engineering review.'},
 'downhole-pumps':{title:'Downhole Progressive Cavity Pump (PCP) Models & Specs',description:`Compare ${pumps.length} brochure-listed downhole progressive cavity pump (PCP pump) models by displacement, reference flow at 100 rpm, stages and water-column head. Shortlist candidates for engineering review.`},
 'pcp-elastomers':{title:'PCP Stator Elastomer Compounds & Material Reference Data',description:`Review ${materials.length} progressive cavity pump stator elastomer compounds, brochure working and maximum temperatures, and fluid-service considerations. Project-specific compatibility requires technical review.`},
 'surface-drive-pcp':{title:'PCP Surface Drive Heads: GBF, VED & PMM',description:`Compare ${drives.length} brochure-listed PCP surface drive head configurations by speed, torque, power and axial load. Interfaces and complete-system suitability require review.`},
 'engineering-inquiry':{title:'PCP Engineering Inquiry & Well Conditions',description:'Prepare a PCP engineering inquiry with well conditions, pump, elastomer and drive candidates. Unknown parameters can follow; submission is not a quotation or selection approval.'},
 'technical-resources':{title:'PCP Technical Resources & Reference Tables',description:'Download brochure-based PCP pump specifications, elastomer reference data and surface drivehead tables. Check units, source conditions and information still needed for review.'},
};
