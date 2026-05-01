"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, MapPin, ChevronRight, Target, User } from "lucide-react";

import { SearchBar } from "@/components/SearchBar";

export function StudentSearchSection({ initialStudents = [] }: { initialStudents: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const allClasses = Array.from(new Set((initialStudents || []).map(s => s.gradeLevel || s.whichClass))).filter(Boolean).sort();

  const filteredStudents = (initialStudents || []).filter((student) => {
    const subjects = student.preferredSubjects || student.subjects || [];
    const grade = student.gradeLevel || student.whichClass || "";
    const nameMatch = student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = subjects.some((s: string) => 
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filterMatch = !selectedClass || grade === selectedClass;

    return (nameMatch || subjectMatch) && filterMatch;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Professional Search & Filter */}
      <SearchBar 
        placeholder="Search by name or interests..."
        onSearch={(data) => {
          setSearchTerm(data.search);
          setSelectedClass(data.status === "Class (All)" ? "" : data.status);
        }}
        allStatuses={["Class (All)", ...allClasses]}
        initialStatus="Class (All)"
      />

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student._id} className="bg-white border-2 border-dark-navy shadow-[4px_4px_0px_0px_rgba(43,65,98,1)] hover:shadow-[8px_8px_0px_0px_rgba(255,111,97,1)] transition-all flex flex-col group">
              {/* Card Top: Class Badge & Avatar */}
              <div className="p-6 pb-0 flex flex-col items-center text-center">
                <div className="w-full flex justify-end mb-2">
                  <span className="px-3 py-1 bg-coral text-off-white text-[9px] font-black uppercase tracking-widest border-2 border-dark-navy shadow-[2px_2px_0px_0px_rgba(43,65,98,1)]">
                    {student.gradeLevel || student.whichClass || "N/A"}
                  </span>
                </div>
                
                <div className="w-20 h-20 bg-dark-navy border-2 border-dark-navy flex items-center justify-center overflow-hidden mb-4 shadow-[4px_4px_0px_0px_rgba(255,111,97,1)]">
                  {student.user?.profileImage ? (
                    <img src={student.user.profileImage} alt={student.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-off-white uppercase">{student.user?.name?.charAt(0) || "S"}</span>
                  )}
                </div>
                
                <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight group-hover:text-coral transition-colors">
                  {student.user?.name || "Student Name"}
                </h3>
              </div>
              
              {/* Card Body: Goals & Interests */}
              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-coral" />
                    <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest">Learning Goals</span>
                  </div>
                  <p className="text-dark-navy text-xs font-medium leading-relaxed line-clamp-3 italic bg-off-white p-3 border border-dark-navy/10 rounded">
                    "{student.learningGoals || "Looking for an expert to help me master my subjects."}"
                  </p>
                </div>
                
                <div className="mt-auto space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest">Interests</span>
                    <div className="flex flex-wrap gap-1">
                      {(student.preferredSubjects || student.subjects || []).slice(0, 2).map((sub: string) => (
                        <span key={sub} className="px-2 py-0.5 bg-dark-navy text-off-white text-[8px] font-black uppercase tracking-wider">
                          {sub}
                        </span>
                      ))}
                      {(student.preferredSubjects || student.subjects)?.length > 2 && (
                        <span className="px-2 py-0.5 bg-off-white border border-dark-navy text-dark-navy text-[8px] font-black uppercase tracking-wider">
                          +{(student.preferredSubjects || student.subjects).length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {student.user?.country && (
                    <div className="flex items-center gap-2 text-[9px] font-black text-steel-blue uppercase tracking-widest">
                      <MapPin size={12} className="text-coral shrink-0" /> {student.user.country}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer Action */}
              <div className="p-4 pt-0">
                <Link 
                  href={`/students/${student.user?._id || student._id}`}
                  className="w-full py-3 bg-dark-navy text-off-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-coral transition-all active:translate-y-0.5"
                >
                  View Profile <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white border-4 border-dashed border-dark-navy/10">
            <p className="text-steel-blue font-black text-lg uppercase tracking-[0.3em]">No Students Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
