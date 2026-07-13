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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
