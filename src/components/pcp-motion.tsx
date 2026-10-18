'use client';
import { useState } from 'react';
export function PcpMotion() {
 const [paused,setPaused]=useState(false);
 return <figure className={`pump-visual ${paused?'paused':''}`}>
  <div className="visual-meta"><span className="live-dot"/> PCP / PRINCIPLE OF OPERATION <button type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Play motion':'Pause motion'}</button></div>
  <svg viewBox="0 0 880 350" role="img" aria-labelledby="pump-diagram-title pump-diagram-desc"><title id="pump-diagram-title">Progressive cavity pump: rotor, stator and axial flow</title><desc id="pump-diagram-desc">A simplified conceptual cutaway. Moving orange markers indicate the direction of fluid transport. Geometry and motion are illustrative, not a dimensional or kinematic simulation.</desc>
   <defs><linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#70838b"/><stop offset=".23" stopColor="#f1f5f5"/><stop offset=".5" stopColor="#b6c5cb"/><stop offset=".75" stopColor="#f4f7f7"/><stop offset="1" stopColor="#657b86"/></linearGradient><linearGradient id="rotor" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#dce6ea"/><stop offset=".35" stopColor="#7a929e"/><stop offset=".55" stopColor="#eff5f6"/><stop offset="1" stopColor="#45606b"/></linearGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d6dfe2" strokeWidth=".7"/></pattern><clipPath id="cavity"><rect x="120" y="132" width="650" height="86" rx="43"/></clipPath></defs>
   <rect width="880" height="350" fill="url(#grid)"/>
   <path d="M70 175H815" stroke="#9aadb5" strokeDasharray="6 7"/>
   <rect x="82" y="109" width="716" height="132" rx="64" fill="url(#steel)" stroke="#738b97"/>
   <rect x="115" y="127" width="660" height="96" rx="48" fill="#233c47"/>
   <g clipPath="url(#cavity)"><rect x="115" y="132" width="660" height="86" fill="#efb88a"/><path className="rotor-wave" d="M20 175 Q80 112 140 175T260 175T380 175T500 175T620 175T740 175T860 175T980 175" stroke="url(#rotor)" strokeWidth="38" fill="none"/>
   {[0,1,2,3,4,5].map(i=><circle key={i} className="fluid-particle" cx="110" cy={i%2?200:150} r="5" style={{animationDelay:`${i*-.8}s`}} />)}</g>
   <rect x="77" y="99" width="24" height="152" rx="5" fill="url(#steel)" stroke="#738b97"/><rect x="779" y="99" width="24" height="152" rx="5" fill="url(#steel)" stroke="#738b97"/>
   <path d="M200 125V62H125M430 172V45H520M690 222V288H760" stroke="#667e8b" fill="none"/>
   <g fill="#233c47" fontFamily="Arial, sans-serif" fontSize="15"><text x="125" y="50">ELASTOMER STATOR</text><text x="528" y="50">HELICAL ROTOR</text><text x="660" y="313">FLUID TRANSPORT →</text></g>
   <path className="flow-arrow" d="M330 278H540m-14-7 14 7-14 7" stroke="#c35c25" strokeWidth="2" fill="none"/>
  </svg>
  <figcaption><span>Rotating rotor. Progressive fluid transport.</span><span>Conceptual schematic · not to scale</span></figcaption>
 </figure>
}
