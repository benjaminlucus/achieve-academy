"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ChevronRight, Search } from "lucide-react";

import { SearchBar } from "@/components/SearchBar";
import { VerifiedTick } from "@/components/VerifiedTick";
import { ConnectButton } from "@/components/ConnectButton";
import { RequestTutorModal } from "@/components/RequestTutorModal";
import { Toaster } from "react-hot-toast";
import Image from "next/image";

export function TutorSearchSection({ initialTutors = [] }: { initialTutors: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allSubjects = Array.from(new Set((initialTutors || []).flatMap((t: any) => t.allSearchableSubjects || t.subjects || []))).sort();
  const allLevels = Array.from(new Set((initialTutors || []).flatMap(t => t.teachingLevels || []))).sort();
  const allExperienceLevels = ["Less than 1 year", "1-2 years", "3-5 years", "5+ years"];

  const filteredTutors = (initialTutors || []).filter((tutor) => {
    const nameMatch = tutor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const searchableSubjects: string[] = tutor.allSearchableSubjects || tutor.subjects || [];
    const subjectMatch = searchableSubjects.some((s: string) =>
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filterMatchSubject = !selectedSubject || searchableSubjects.includes(selectedSubject);
    const filterMatchLevel = !selectedLevel || (tutor.teachingLevels || []).includes(selectedLevel);
    const filterMatchExperience = !selectedExperience || tutor.experienceLevel === selectedExperience;

    return (nameMatch || subjectMatch) && filterMatchSubject && filterMatchLevel && filterMatchExperience;
  });

  function buildCanTeachEntries(tutor: any): { name: string; levelsText: string }[] {
    const results: { name: string; levelsText: string }[] = [];
    const seen = new Set<string>();

    if (tutor.expertise && Array.isArray(tutor.expertise)) {
      for (const e of tutor.expertise) {
        if (!e || !e.name) continue;
        const key = e.name.trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        let levelsText = "";
        if (e.levels && e.levels.length > 0) {
          levelsText = e.levels.join(" & ");
        }
        results.push({ name: e.name, levelsText });
      }
    }

    for (const s of tutor.subjects || []) {
      if (!s) continue;
      const key = String(s).trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ name: s, levelsText: "" });
    }

    return results;
  }

  return (
    <div className="flex flex-col gap-8">
      <Toaster />
      <RequestTutorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Request a Tutor Section (Top) */}
      <div className="bg-[#0F172A] border border-[#8B5CF6]/20 p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b from-emerald-500 to-[#8B5CF6]"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pl-2 sm:pl-4">
          <div className="w-12 h-12 sm:w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Search size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              Can't find the right tutor?
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 leading-relaxed">
              Tell us what you're looking for and we'll help you find a suitable tutor. Our team usually responds within 24 hours.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-emerald-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700 transition-all rounded-2xl shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-y-[1px]"
        >
          Request a Tutor
        </button>
      </div>

      {/* Professional Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* 🔍 Search Input */}
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search name, subject, language, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary/5 text-sm font-medium transition-all"
          />
        </div>

        {/* 🎛 Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-all"
          >
            <option value="">All Subjects</option>
            {allSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Teaching Level Dropdown */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-all"
          >
            <option value="">All Levels</option>
            {allLevels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Experience Level Dropdown */}
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-all"
          >
            <option value="">All Experience</option>
            {allExperienceLevels.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTutors.length > 0 ? (
          filteredTutors.map((tutor) => (
            <div key={tutor._id} className="bg-white border-2 border-dark-navy shadow-[8px_8px_0px_0px_rgba(43,65,98,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,111,97,1)] transition-all flex flex-col group">
              {/* Card Header: Photo & Essential Info */}
              <div className="p-8 pb-0 flex gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-dark-navy border-2 border-dark-navy flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(255,111,97,1)] relative">
                    {tutor.user?.profileImage ? (
                      <Image src={tutor.user.profileImage} alt={tutor.user.name} fill className="object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-off-white uppercase">{tutor.user?.name?.charAt(0) || "T"}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight group-hover:text-coral transition-colors">
                      {tutor.user?.name || "Expert Tutor"}
                    </h3>
                    <VerifiedTick 
                      level={tutor.user?.verificationLevel} 
                      status={tutor.user?.status} 
                      size={20}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star size={14} className="text-coral fill-coral" />
                    <span className="text-xs font-black text-dark-navy uppercase tracking-widest">{tutor.rating || "New"}</span>
                    <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest ml-2">• Verified Member</span>
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-8 pt-6 flex-grow">
                <div className="mb-6">
                  <p className="text-steel-blue text-xs font-bold uppercase tracking-widest mb-2 underline decoration-coral decoration-2 underline-offset-4">Teaching Levels</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(tutor.teachingLevels || []).map((level: string) => (
                      <span key={level} className="px-3 py-1 bg-purple-primary/10 text-purple-primary text-[9px] font-black uppercase tracking-[0.1em] border border-purple-primary/20 rounded-lg">
                        {level}
                      </span>
                    ))}
                  </div>
                  <p className="text-steel-blue text-xs font-bold uppercase tracking-widest mb-2 underline decoration-coral decoration-2 underline-offset-4">Biography</p>
                  <p className="text-dark-navy text-sm font-medium leading-relaxed line-clamp-3">
                    {tutor.description || "Highly qualified professional dedicated to delivering academic excellence and practical knowledge to every student."}
                  </p>
                </div>

                {/* Professional Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-off-white p-3 border-2 border-dark-navy/10 flex flex-col">
                    <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest mb-1">Hourly Rate</span>
                    <span className="text-lg font-black text-dark-navy">${tutor.hourlyRate || 0}<span className="text-[10px] font-bold">/hr</span></span>
                  </div>
                  <div className="bg-off-white p-3 border-2 border-dark-navy/10 flex flex-col">
                    <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest mb-1">Experience</span>
                    <span className="text-lg font-black text-dark-navy">{tutor.experienceLevel || "Less than 1 year"}</span>
                  </div>
                </div>

                {/* CAN TEACH Section */}
                {(() => {
                  const canTeach = buildCanTeachEntries(tutor);
                  const visible = canTeach.slice(0, 4);
                  const remaining = canTeach.length - visible.length;
                  return (
                    <div className="mb-5">
                      <p className="text-steel-blue text-[10px] font-black uppercase tracking-widest mb-2 underline decoration-coral decoration-2 underline-offset-4">
                        Can Teach
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {visible.map((entry, i) => (
                          <div key={i} className="flex flex-wrap items-baseline gap-2">
                            <span className="text-dark-navy text-[11px] font-black uppercase tracking-[0.08em]">
                              {entry.name}
                            </span>
                            {entry.levelsText && (
                              <span className="text-coral text-[9px] font-bold uppercase tracking-widest">
                                — {entry.levelsText}
                              </span>
                            )}
                          </div>
                        ))}
                        {remaining > 0 && (
                          <span className="text-dark-navy/60 text-[10px] font-bold uppercase tracking-widest">
                            +{remaining} more
                          </span>
                        )}
                        {canTeach.length === 0 && (
                          <span className="text-steel-blue/70 text-[10px] font-medium">
                            No subjects listed yet
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Footer Action */}
              <div className="mt-auto border-t-2 border-dark-navy p-6 bg-off-white/30 flex flex-col gap-3">
                <Link 
                  href={`/tutors/${tutor.user?._id || tutor._id}`}
                  className="w-full py-4 bg-dark-navy text-off-white text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-coral transition-all active:translate-y-1"
                >
                  View Full Profile <ChevronRight size={16} />
                </Link>
                <div className="w-full">
                  <ConnectButton targetUserId={tutor.user?._id || tutor._id} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white border-4 border-dashed border-dark-navy/10">
            <p className="text-steel-blue font-black text-lg uppercase tracking-[0.3em]">No Tutors Found</p>
          </div>
        )}
      </div>

      {/* Request a Tutor Section (Bottom) */}
      <div className="bg-[#0F172A] border border-[#8B5CF6]/20 p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b from-[#8B5CF6] to-emerald-500"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pl-2 sm:pl-4">
          <div className="w-12 h-12 sm:w-14 h-14 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl flex items-center justify-center flex-shrink-0">
            <Search size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              Still haven't found what you're looking for?
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 leading-relaxed">
              We have a network of tutors not yet listed on the platform. Let us help find your perfect match!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#8B5CF6] text-white font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-[#7c3aed] hover:bg-[#7c3aed] hover:border-[#6d28d9] transition-all rounded-2xl shadow-[2px_2px_0px_0px_rgba(124,58,237,1)] hover:shadow-none hover:translate-y-[1px]"
        >
          Request a Tutor
        </button>
      </div>
    </div>
  );
}
