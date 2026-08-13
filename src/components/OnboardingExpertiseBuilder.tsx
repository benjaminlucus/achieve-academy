"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DEFAULT_TEACHING_LANGUAGES } from "@/lib/constants";

export interface OnboardingExpertiseEntry {
  category: string;
  subjects: string[];
  teachingLevels: string[];
  teachingLanguages: string[];
  experience: number;
  teachingStrength: "beginner" | "good" | "strong" | "very_strong";
  hourlyRate?: number;
  specialNotes?: string;
  visibility: "public" | "private" | "connections";
}

type Lookup = { _id: string; name: string };
const emptyEntry = (): OnboardingExpertiseEntry => ({
  category: "", subjects: [], teachingLevels: [], teachingLanguages: ["English"],
  experience: 0, teachingStrength: "good", visibility: "public",
});

export default function OnboardingExpertiseBuilder({ value, onChange }: { value: OnboardingExpertiseEntry[]; onChange: (entries: OnboardingExpertiseEntry[]) => void }) {
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [levels, setLevels] = useState<Lookup[]>([]);
  const [subjectMap, setSubjectMap] = useState<Record<string, Lookup[]>>({});

  useEffect(() => { void Promise.all([fetch("/api/expertise-categories"), fetch("/api/education-levels")]).then(async ([categoriesRes, levelsRes]) => {
    if (categoriesRes.ok) setCategories((await categoriesRes.json()).data || []);
    if (levelsRes.ok) setLevels((await levelsRes.json()).data || []);
  }); }, []);
  useEffect(() => { value.forEach(entry => { if (entry.category && !subjectMap[entry.category]) void fetch(`/api/expertise-subjects?categoryId=${entry.category}`).then(async res => { if (res.ok) { const payload = await res.json(); setSubjectMap(prev => ({ ...prev, [entry.category]: payload.data || [] })); } }); }); }, [value, subjectMap]);

  const update = (index: number, patch: Partial<OnboardingExpertiseEntry>) => onChange(value.map((entry, i) => i === index ? { ...entry, ...patch } : entry));
  const toggle = (index: number, field: "subjects" | "teachingLevels" | "teachingLanguages", id: string) => {
    const current = value[index][field];
    update(index, { [field]: current.includes(id) ? current.filter(item => item !== id) : [...current, id] } as Partial<OnboardingExpertiseEntry>);
  };

  return <div className="space-y-5">
    {value.map((entry, index) => <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 space-y-5">
      <div className="flex items-center justify-between"><h3 className="font-black text-deep-black">Expertise {index + 1}</h3>{value.length > 1 && <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="text-rose-600"><Trash2 size={16} /></button>}</div>
      <div className="grid gap-4 md:grid-cols-2"><select value={entry.category} onChange={e => update(index, { category: e.target.value, subjects: [] })} className="px-4 py-3 rounded-xl border border-gray-200 bg-white font-bold"><option value="">Choose category</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
        <div className="rounded-xl border border-gray-200 bg-white p-3 max-h-36 overflow-y-auto space-y-2">{entry.category ? (subjectMap[entry.category] || []).map(subject => <label key={subject._id} className="flex gap-2 text-sm font-bold"><input type="checkbox" checked={entry.subjects.includes(subject._id)} onChange={() => toggle(index, "subjects", subject._id)} />{subject.name}</label>) : <span className="text-sm text-gray-400">Choose a category first</span>}</div></div>
      <div><p className="text-[11px] font-black uppercase tracking-widest mb-2">Teaching levels for these subjects</p><div className="grid grid-cols-2 gap-2">{levels.map(level => <label key={level._id} className="flex gap-2 text-xs font-bold"><input type="checkbox" checked={entry.teachingLevels.includes(level._id)} onChange={() => toggle(index, "teachingLevels", level._id)} />{level.name}</label>)}</div></div>
      <div><p className="text-[11px] font-black uppercase tracking-widest mb-2">Teaching languages</p><div className="flex flex-wrap gap-2">{DEFAULT_TEACHING_LANGUAGES.map(language => <button key={language} type="button" onClick={() => toggle(index, "teachingLanguages", language)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${entry.teachingLanguages.includes(language) ? "bg-purple-primary text-white" : "bg-white border border-gray-200"}`}>{language}</button>)}</div></div>
      <div className="grid gap-4 md:grid-cols-3"><select value={entry.teachingStrength} onChange={e => update(index, { teachingStrength: e.target.value as OnboardingExpertiseEntry["teachingStrength"] })} className="px-4 py-3 rounded-xl border border-gray-200 bg-white font-bold"><option value="beginner">Beginner confidence</option><option value="good">Good confidence</option><option value="strong">Strong confidence</option><option value="very_strong">Very strong confidence</option></select><input type="number" min="0" value={entry.experience} onChange={e => update(index, { experience: Number(e.target.value) || 0 })} placeholder="Years (optional)" className="px-4 py-3 rounded-xl border border-gray-200 bg-white font-bold"/><input type="number" min="0" value={entry.hourlyRate || ""} onChange={e => update(index, { hourlyRate: e.target.value ? Number(e.target.value) : undefined })} placeholder="Hourly rate (optional)" className="px-4 py-3 rounded-xl border border-gray-200 bg-white font-bold"/></div>
      <textarea value={entry.specialNotes || ""} onChange={e => update(index, { specialNotes: e.target.value })} placeholder="Additional notes (optional)" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-bold" rows={2}/>
    </div>)}
    <button type="button" onClick={() => onChange([...value, emptyEntry()])} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-purple-primary text-purple-primary font-black text-xs uppercase tracking-widest"><Plus size={16}/> Add another expertise</button>
  </div>;
}
