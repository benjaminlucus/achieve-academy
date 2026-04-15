import React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { 
  BookOpen, GraduationCap, DollarSign, Clock, Users, 
  Calendar, Mail, MapPin, CheckCircle, ChevronRight, 
  BarChart3, Settings, LogOut, LayoutDashboard, Search, Bell
} from "lucide-react";
import Link from "next/link";

export default function TutorProfileView({ params }: { params: { id: string } }) {
  // Simplified mock data
  const tutorData = {
    name: "Dr. Sarah Jenkins",
    email: "sarah.j@example.com",
    status: "active",
    subjects: ["Mathematics", "Physics", "Calculus"],
    experienceYears: 8,
    education: "Ph.D. in Theoretical Physics",
    hourlyRate: 50,
    bio: "Passionate educator with over 8 years of experience in helping students master complex concepts in STEM subjects.",
    stats: {
      totalStudents: 12,
      hoursTaught: 124,
      rating: 4.9
    },
    availability: [
      { day: "Monday", time: "10:00 AM - 4:00 PM" },
      { day: "Wednesday", time: "2:00 PM - 6:00 PM" },
      { day: "Friday", time: "9:00 AM - 1:00 PM" }
    ]
  };

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Profile Header Card */}
        <div className="bg-white border border-dark-navy/10 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 bg-dark-navy rounded-2xl flex items-center justify-center text-off-white text-4xl font-bold border-4 border-white shadow-md overflow-hidden">
              {tutorData.name.charAt(0)}
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-dark-navy uppercase tracking-tight mb-2">{tutorData.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {tutorData.subjects.map(sub => (
                      <span key={sub} className="px-3 py-1 bg-off-white text-steel-blue text-[10px] font-bold uppercase rounded-full border border-dark-navy/5">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusBadge status={tutorData.status} />
              </div>
              
              <p className="mt-6 text-steel-blue text-sm font-medium leading-relaxed max-w-2xl">
                {tutorData.bio}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-dark-navy/5">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Hourly Rate</span>
                  <p className="text-xl font-bold text-dark-navy">${tutorData.hourlyRate}<span className="text-xs font-medium">/hr</span></p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Experience</span>
                  <p className="text-xl font-bold text-dark-navy">{tutorData.experienceYears}<span className="text-xs font-medium"> Years</span></p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Students</span>
                  <p className="text-xl font-bold text-dark-navy">{tutorData.stats.totalStudents}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Expertise & Education */}
          <div className="bg-white border border-dark-navy/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
              <GraduationCap className="text-coral" size={20} /> Education & Background
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Highest Qualification</p>
                <p className="text-sm font-bold text-dark-navy">{tutorData.education}</p>
              </div>
              <div className="pt-4 border-t border-dark-navy/5">
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-2">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {tutorData.subjects.map(skill => (
                    <span key={skill} className="text-[10px] font-bold text-dark-navy bg-off-white px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Availability & Contact */}
          <div className="bg-white border border-dark-navy/10 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
              <Calendar className="text-coral" size={20} /> Availability
            </h3>
            <div className="space-y-3 flex-grow">
              {tutorData.availability.map(item => (
                <div key={item.day} className="flex justify-between items-center text-sm py-2 border-b border-dark-navy/5 last:border-0">
                  <span className="font-bold text-dark-navy">{item.day}</span>
                  <span className="text-steel-blue font-medium">{item.time}</span>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-dark-navy text-off-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-coral transition-colors shadow-md">
              Book a Session
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
