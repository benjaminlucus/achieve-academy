"use client";

import React, { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import Link from "next/link";
import { BookOpen, Clock, DollarSign, Star, ChevronRight } from "lucide-react";

export function TutorSearchSection({ initialTutors }: { initialTutors: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Subject (All)");

  // Get unique subjects from all tutors
  const allSubjects = Array.from(new Set(initialTutors.flatMap(t => t.subjects || []))).sort();

  const filteredTutors = initialTutors.filter((tutor) => {
    const nameMatch = tutor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = (tutor.subjects || []).some((s: string) => 
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filterMatch = selectedSubject === "Subject (All)" || (tutor.subjects || []).includes(selectedSubject);

    return (nameMatch || subjectMatch) && filterMatch;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 border-2 border-dark-navy shadow-[4px_4px_0px_0px_rgba(43,65,98,1)]">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by name or subject..."
            className="w-full px-4 py-2 bg-off-white border-2 border-dark-navy text-dark-navy font-bold focus:outline-none focus:ring-0"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 bg-off-white border-2 border-dark-navy text-dark-navy font-bold outline-none"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option>Subject (All)</option>
          {allSubjects.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTutors.length > 0 ? (
          filteredTutors.map((tutor) => (
            <div key={tutor._id} className="bg-white border-2 border-dark-navy shadow-[4px_4px_0px_0px_rgba(43,65,98,1)] hover:shadow-[6px_6px_0px_0px_rgba(43,65,98,1)] transition-all flex flex-col group">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-dark-navy text-off-white flex items-center justify-center text-xl font-bold border-2 border-dark-navy">
                    {tutor.user?.name?.charAt(0) || "T"}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-off-white text-dark-navy border-2 border-dark-navy px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
                      ${tutor.hourlyRate || 0}/hr
                    </span>
                    <div className="flex items-center gap-1 mt-2 text-dark-navy">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{tutor.rating || "New"}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-dark-navy mb-2 uppercase tracking-tight group-hover:text-coral transition-colors">
                  {tutor.user?.name || "Tutor Name"}
                </h3>
                <p className="text-steel-blue text-sm font-medium mb-4 line-clamp-2">
                  {tutor.description || "No description available."}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {(tutor.subjects || []).slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] uppercase tracking-widest font-bold bg-off-white border-2 border-dark-navy/10 text-steel-blue px-2 py-1">
                      {tag}
                    </span>
                  ))}
                  {tutor.subjects?.length > 3 && (
                    <span className="text-[10px] uppercase tracking-widest font-bold bg-off-white border-2 border-dark-navy/10 text-steel-blue px-2 py-1">
                      +{tutor.subjects.length - 3}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-dark-navy">
                    <Clock size={14} className="text-coral" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tutor.experienceYears || 0} Years Exp.</span>
                  </div>
                  <div className="flex items-center gap-2 text-dark-navy">
                    <BookOpen size={14} className="text-coral" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tutor.totalStudents || 0} Students</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t-2 border-dark-navy p-4 bg-off-white flex justify-end">
                <Link 
                  href={`/tutors/${tutor.user?._id || tutor._id}`}
                  className="flex items-center gap-2 bg-dark-navy text-off-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-coral transition-colors border-2 border-dark-navy"
                >
                  View Profile <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-dark-navy/20">
            <p className="text-steel-blue font-bold italic uppercase tracking-widest">No tutors found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
