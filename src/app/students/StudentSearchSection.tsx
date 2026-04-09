"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, MapPin, ChevronRight } from "lucide-react";

export function StudentSearchSection({ initialStudents }: { initialStudents: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("Class (All)");

  // Get unique classes
  const allClasses = Array.from(new Set(initialStudents.map(s => s.whichClass))).filter(Boolean).sort();

  const filteredStudents = initialStudents.filter((student) => {
    const nameMatch = student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = (student.subjects || []).some((s: string) => 
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filterMatch = selectedClass === "Class (All)" || student.whichClass === selectedClass;

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
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option>Class (All)</option>
          {allClasses.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student._id} className="bg-white border-2 border-dark-navy p-6 shadow-[4px_4px_0px_0px_rgba(43,65,98,1)] hover:shadow-[6px_6px_0px_0px_rgba(43,65,98,1)] transition-all flex flex-col text-center group">
              <div className="w-20 h-20 bg-dark-navy text-off-white flex items-center justify-center text-3xl font-bold border-2 border-dark-navy mx-auto mb-4 overflow-hidden">
                {student.user?.profileImage ? (
                  <img src={student.user.profileImage} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  student.user?.name?.charAt(0) || "S"
                )}
              </div>
              
              <span className="text-[10px] font-bold text-coral uppercase tracking-widest mb-1">
                {student.whichClass || "Student"}
              </span>
              
              <h3 className="text-lg font-extrabold text-dark-navy mb-2 uppercase tracking-tight group-hover:text-coral transition-colors">
                {student.user?.name || "Student Name"}
              </h3>
              
              <p className="text-steel-blue text-xs font-medium italic mb-4 line-clamp-2">
                "{student.description || student.learningGoals || "I want to excel in my studies."}"
              </p>
              
              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-steel-blue uppercase tracking-widest">
                  <BookOpen className="w-3 h-3 text-coral" /> 
                  <span className="truncate">{(student.subjects || []).join(", ") || "No subjects"}</span>
                </div>
                {student.user?.country && (
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-steel-blue uppercase tracking-widest">
                    <MapPin className="w-3 h-3 text-coral" /> {student.user.country}
                  </div>
                )}
              </div>
              
              <Link 
                href={`/students/${student.user?._id || student._id}`}
                className="w-full py-2 bg-dark-navy text-off-white text-[10px] font-bold uppercase tracking-widest hover:bg-coral transition-colors border-2 border-dark-navy flex items-center justify-center gap-2"
              >
                View Profile <ChevronRight size={12} />
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white border-2 border-dashed border-dark-navy/20">
            <p className="text-steel-blue font-bold italic uppercase tracking-widest">No students found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
