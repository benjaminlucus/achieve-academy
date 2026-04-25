"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, DollarSign, Star, ChevronRight, GraduationCap, MapPin } from "lucide-react";

import { SearchBar } from "@/components/SearchBar";

export function TutorSearchSection({ initialTutors = [] }: { initialTutors: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const allSubjects = Array.from(new Set((initialTutors || []).flatMap(t => t.subjects || []))).sort();

  const filteredTutors = (initialTutors || []).filter((tutor) => {
    const nameMatch = tutor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const subjects = tutor.subjects || [];
    const subjectMatch = subjects.some((s: string) => 
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filterMatch = !selectedSubject || subjects.includes(selectedSubject);

    return (nameMatch || subjectMatch) && filterMatch;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Professional Search & Filter */}
      <SearchBar 
        placeholder="Type name or subject..."
        onSearch={(data) => {
          setSearchTerm(data.search);
          setSelectedSubject(data.status === "Subject (All)" ? "" : data.status);
        }}
        allStatuses={["Subject (All)", ...allSubjects]}
        initialStatus="Subject (All)"
      />

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTutors.length > 0 ? (
          filteredTutors.map((tutor) => (
            <div key={tutor._id} className="bg-white border-2 border-dark-navy shadow-[8px_8px_0px_0px_rgba(43,65,98,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,111,97,1)] transition-all flex flex-col group">
              {/* Card Header: Photo & Essential Info */}
              <div className="p-8 pb-0 flex gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-dark-navy border-2 border-dark-navy flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(255,111,97,1)]">
                    {tutor.user?.profileImage ? (
                      <img src={tutor.user.profileImage} alt={tutor.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-off-white uppercase">{tutor.user?.name?.charAt(0) || "T"}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col justify-center">
                  <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight group-hover:text-coral transition-colors">
                    {tutor.user?.name || "Expert Tutor"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star size={14} className="text-coral fill-coral" />
                    <span className="text-xs font-black text-dark-navy uppercase tracking-widest">{tutor.rating || "New"}</span>
                    <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest ml-2">• Verified</span>
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-8 pt-6 flex-grow">
                <div className="mb-6">
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
                    <span className="text-lg font-black text-dark-navy">{tutor.experienceYears || 0}<span className="text-[10px] font-bold"> Yrs</span></span>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2">
                  {(tutor.subjects || []).slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-dark-navy text-off-white text-[9px] font-black uppercase tracking-[0.1em]">
                      {tag}
                    </span>
                  ))}
                  {tutor.subjects?.length > 3 && (
                    <span className="px-3 py-1 bg-coral text-off-white text-[9px] font-black uppercase tracking-[0.1em]">
                      +{tutor.subjects.length - 3} More
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Action */}
              <div className="mt-auto border-t-2 border-dark-navy p-6 bg-off-white/30">
                <Link 
                  href={`/tutors/${tutor.user?._id || tutor._id}`}
                  className="w-full py-4 bg-dark-navy text-off-white text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-coral transition-all active:translate-y-1"
                >
                  View Full Profile <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white border-4 border-dashed border-dark-navy/10">
            <p className="text-steel-blue font-black text-lg uppercase tracking-[0.3em]">No Tutors Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
