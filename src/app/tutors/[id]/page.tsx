
// Public. Faced by users.
import React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { User, BookOpen, GraduationCap, DollarSign, Users, Calendar, Clock, Edit2, CheckCircle } from "lucide-react";

// This would normally be a server component fetching from MongoDB
export default function TutorDashboard({ params }: { params: { id: string } }) {
  // Mock data for demonstration
  const tutorData = {
    id: params.id,
    name: "Dr. Sarah Jenkins",
    email: "sarah.j@example.com",
    role: "tutor",
    status: "active",
    profile: {
      subjects: ["Mathematics", "Physics", "Calculus"],
      experienceYears: 8,
      education: "Ph.D. in Theoretical Physics",
      hourlyRate: 50,
      monthlyRate: 180,
      bio: "Passionate educator with over 8 years of experience in helping students master complex concepts in STEM subjects.",
    },
    stats: {
      totalStudents: 12,
      activeSessions: 8,
      monthlyEarnings: 1440,
    },
    students: [
      { id: "s1", name: "Alex Rivera", sessionStatus: "active", paymentStatus: "paid" },
      { id: "s2", name: "Maya Chen", sessionStatus: "active", paymentStatus: "pending" },
      { id: "s3", name: "Jordan Smith", sessionStatus: "inactive", paymentStatus: "paid" },
    ],
    sessions: [
      { id: "ses1", student: "Alex Rivera", startDate: "2024-03-01", endDate: "2024-03-31", status: "active" },
      { id: "ses2", student: "Maya Chen", startDate: "2024-03-05", endDate: "2024-04-05", status: "active" },
    ]
  };

  if (tutorData.status === "blocked") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white p-6">
        <DashboardCard className="max-w-md w-full text-center border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Account Blocked</h2>
          <p className="text-steel-blue">Your account has been restricted. Please contact support for more information.</p>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DashboardCard className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 bg-dark-navy text-off-white flex items-center justify-center text-3xl font-bold border-2 border-dark-navy">
                {tutorData.name.charAt(0)}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-extrabold text-dark-navy tracking-tight">{tutorData.name}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tutorData.profile.subjects.map(sub => (
                        <span key={sub} className="px-2 py-1 bg-off-white border-2 border-dark-navy/10 text-[10px] font-bold uppercase text-steel-blue">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <StatusBadge status={tutorData.status} />
                </div>
                <p className="mt-4 text-steel-blue font-medium leading-relaxed">{tutorData.profile.bio}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-dark-navy">
                    <Clock size={16} className="text-coral" />
                    <span className="text-sm font-bold">{tutorData.profile.experienceYears} Years Exp.</span>
                  </div>
                  <div className="flex items-center gap-2 text-dark-navy">
                    <GraduationCap size={16} className="text-coral" />
                    <span className="text-sm font-bold">PhD Physics</span>
                  </div>
                  <div className="flex items-center gap-2 text-dark-navy">
                    <DollarSign size={16} className="text-coral" />
                    <span className="text-sm font-bold">${tutorData.profile.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Actions */}
          <DashboardCard title="Quick Actions" className="h-fit">
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-dark-navy text-off-white font-bold hover:bg-coral transition-colors border-2 border-dark-navy">
                <Edit2 size={16} /> Edit Profile
              </button>
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dark-navy text-dark-navy font-bold hover:bg-dark-navy hover:text-off-white transition-colors">
                <Calendar size={16} /> Manage Schedule
              </button>
            </div>
          </DashboardCard>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard className="border-l-8 border-l-dark-navy">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-steel-blue uppercase tracking-widest">Total Students</p>
                <h4 className="text-3xl font-extrabold text-dark-navy mt-1">{tutorData.stats.totalStudents}</h4>
              </div>
              <Users size={32} className="text-dark-navy/20" />
            </div>
          </DashboardCard>
          <DashboardCard className="border-l-8 border-l-coral">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-steel-blue uppercase tracking-widest">Active Sessions</p>
                <h4 className="text-3xl font-extrabold text-dark-navy mt-1">{tutorData.stats.activeSessions}</h4>
              </div>
              <Clock size={32} className="text-coral/20" />
            </div>
          </DashboardCard>
          <DashboardCard className="border-l-8 border-l-steel-blue">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-steel-blue uppercase tracking-widest">Monthly Earnings</p>
                <h4 className="text-3xl font-extrabold text-dark-navy mt-1">${tutorData.stats.monthlyEarnings}</h4>
              </div>
              <DollarSign size={32} className="text-steel-blue/20" />
            </div>
          </DashboardCard>
        </div>

        {/* Assigned Students & Session Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Assigned Students */}
          <DashboardCard title="Assigned Students">
            <div className="flex flex-col gap-4 mt-2">
              {tutorData.students.length > 0 ? (
                tutorData.students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-off-white border-2 border-dark-navy/5 hover:border-dark-navy/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-steel-blue/10 text-steel-blue flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-dark-navy">{student.name}</p>
                        <div className="flex gap-2 mt-1">
                          <StatusBadge status={student.sessionStatus} />
                          <StatusBadge status={student.paymentStatus} />
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-steel-blue hover:text-coral transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-steel-blue italic">No assigned students yet.</p>
              )}
            </div>
          </DashboardCard>

          {/* Session Management */}
          <DashboardCard title="Active Sessions">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-dark-navy/5">
                    <th className="py-3 text-xs font-bold text-steel-blue uppercase">Student</th>
                    <th className="py-3 text-xs font-bold text-steel-blue uppercase">Dates</th>
                    <th className="py-3 text-xs font-bold text-steel-blue uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-dark-navy/5">
                  {tutorData.sessions.length > 0 ? (
                    tutorData.sessions.map(session => (
                      <tr key={session.id} className="group">
                        <td className="py-4">
                          <p className="font-bold text-dark-navy">{session.student}</p>
                          <StatusBadge status={session.status} className="mt-1" />
                        </td>
                        <td className="py-4">
                          <p className="text-xs font-bold text-steel-blue">{session.startDate}</p>
                          <p className="text-xs font-bold text-steel-blue">to {session.endDate}</p>
                        </td>
                        <td className="py-4 text-right">
                          <button className="p-2 bg-dark-navy text-off-white hover:bg-coral transition-colors" title="Mark as Complete">
                            <CheckCircle size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-steel-blue italic">No active sessions.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

        </div>
      </div>
    </div>
  );
}

// Simple ChevronRight icon if lucide doesn't provide it as needed
function ChevronRight({ size = 24, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
