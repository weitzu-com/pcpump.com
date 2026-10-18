'use client';
import { useEffect,useState } from 'react';
import {pumps,materials,drives} from '@/lib/pcp-data';
export type Selection = { pump?:string;material?:string;drive?:string };
const key='pcpump-engineering-selection';
let memory:Selection={};
let memoryOnly=false;
export function readSelection():Selection {
 if(memoryOnly)return memory;
 try{const parsed=JSON.parse(sessionStorage.getItem(key)||'{}');if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return memory;const clean:Selection={};for(const [k,items] of Object.entries({pump:pumps,material:materials,drive:drives})){const value=parsed[k];if(typeof value==='string'&&items.some(i=>i.model===value))clean[k as keyof Selection]=value}memory=clean;return clean}catch{return memory}
}
function persist(next:Selection){memory=next;try{sessionStorage.setItem(key,JSON.stringify(next))}catch{memoryOnly=true}window.dispatchEvent(new Event('pcpump-selection'));}
export function setSelection(field:keyof Selection,value:string|undefined){const next={...readSelection()};if(value===undefined)delete next[field];else next[field]=value;persist(next)}
export function clearSelection(){persist({})}
export function useSelection(){const [s,setS]=useState<Selection>({});useEffect(()=>{const update=()=>setS(readSelection());update();window.addEventListener('pcpump-selection',update);return()=>window.removeEventListener('pcpump-selection',update)},[]);return s;}
