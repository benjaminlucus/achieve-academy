
// Public. Faced by users.
import React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { User, BookOpen, GraduationCap, DollarSign, Users, Calendar, Clock, Edit2, CheckCircle, CreditCard, History } from "lucide-react";

// This would normally be a server component fetching from MongoDB
export default function StudentDashboard({ params }: { params: { id: string } }) {
  // Mock data for demonstration
  const studentData = {
    id: params.id,
    name: "Alex Rivera",
    email: "alex.r@example.com",
    role: "student",
    status: "active",
    profile: {
      learningGoals: "Mastering AP Physics and improving Calculus scores for college applications.",
      preferredSubjects: ["Physics", "Mathematics"],
      gradeLevel: "12th Grade",
    },
    tutor: {
      id: "t1",
      name: "Dr. Sarah Jenkins",
      subject: "Physics & Calculus",
      rate: 180, // Monthly rate
      avatar: "S",
    },
    activeSession: {
      id: "ses1",
      startDate: "2024-03-01",
      endDate: "2024-03-31",
      status: "active",
      paymentStatus: "paid",
    },
    history: [
      { id: "h1", tutor: "Dr. Sarah Jenkins", date: "Feb 2024", status: "completed" },
      { id: "h2", tutor: "Dr. Sarah Jenkins", date: "Jan 2024", status: "completed" },
    ]
  };

  if (studentData.status === "blocked") {
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
              <div className="w-24 h-24 bg-coral text-off-white flex items-center justify-center text-3xl font-bold border-2 border-dark-navy">
                {studentData.name.charAt(0)}
              </div>
              <div className="flex-grow w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-extrabold text-dark-navy tracking-tight">{studentData.name}</h1>
                    <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mt-1">{studentData.profile.gradeLevel}</p>
                  </div>
                  <StatusBadge status={studentData.status} />
                </div>
                
                <div className="mt-6 flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mb-1">Learning Goals</p>
                    <p className="text-dark-navy font-medium leading-relaxed">{studentData.profile.learningGoals}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mb-1">Preferred Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {studentData.profile.preferredSubjects.map(sub => (
                        <span key={sub} className="px-2 py-1 bg-off-white border-2 border-dark-navy/10 text-[10px] font-bold uppercase text-steel-blue">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard title="Account Actions" className="h-fit">
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-dark-navy text-off-white font-bold hover:bg-coral transition-colors border-2 border-dark-navy">
                <Edit2 size={16} /> Update Profile
              </button>
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dark-navy text-dark-navy font-bold hover:bg-dark-navy hover:text-off-white transition-colors">
                <BookOpen size={16} /> Find New Tutor
              </button>
            </div>
          </DashboardCard>
        </div>

        {/* Assigned Tutor & Active Session */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Assigned Tutor Card */}
          <DashboardCard title="My Tutor">
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex items-center gap-4 p-4 bg-off-white border-2 border-dark-navy/5">
                <div className="w-12 h-12 bg-dark-navy text-off-white flex items-center justify-center font-bold">
                  {studentData.tutor.avatar}
                </div>
                <div>
                  <p className="font-bold text-dark-navy">{studentData.tutor.name}</p>
                  <p className="text-xs font-bold text-steel-blue uppercase">{studentData.tutor.subject}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-steel-blue font-bold uppercase tracking-wider text-[10px]">Monthly Rate</span>
                  <span className="text-dark-navy font-extrabold">${studentData.tutor.rate}/mo</span>
                </div>
                <button className="w-full py-2 border-2 border-dark-navy text-dark-navy text-xs font-bold hover:bg-dark-navy hover:text-off-white transition-colors uppercase tracking-widest">
                  View Tutor Profile
                </button>
              </div>
            </div>
          </DashboardCard>

          {/* Active Session & Payment */}
          <DashboardCard title="Active Session" className="lg:col-span-2">
            {studentData.activeSession ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-coral text-off-white">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-steel-blue uppercase tracking-widest">Session Period</p>
                      <p className="text-lg font-extrabold text-dark-navy mt-1">
                        {studentData.activeSession.startDate} to {studentData.activeSession.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-steel-blue text-off-white">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-steel-blue uppercase tracking-widest">Current Status</p>
                      <StatusBadge status={studentData.activeSession.status} className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="bg-dark-navy p-6 flex flex-col justify-between border-2 border-dark-navy">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">Payment Status</p>
                      <StatusBadge status={studentData.activeSession.paymentStatus} className="mt-1" />
                    </div>
                    <CreditCard className="text-off-white/20" size={32} />
                  </div>
                  
                  <div className="mt-8 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">Due Amount</p>
                      <p className="text-2xl font-extrabold text-off-white">${studentData.tutor.rate}</p>
                    </div>
                    {studentData.activeSession.paymentStatus !== "paid" && (
                      <button className="px-6 py-2 bg-coral text-off-white font-bold text-sm hover:bg-rose transition-colors uppercase tracking-widest">
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-steel-blue font-bold italic">No active session at the moment.</p>
                <button className="mt-4 px-8 py-3 bg-dark-navy text-off-white font-bold hover:bg-coral transition-colors">
                  Browse Tutors
                </button>
              </div>
            )}
          </DashboardCard>
        </div>

        {/* History Section */}
        <DashboardCard title="Learning History">
          <div className="flex flex-col gap-4 mt-2">
            {studentData.history.length > 0 ? (
              studentData.history.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-off-white border-2 border-dark-navy/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-steel-blue/10 text-steel-blue">
                      <History size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-dark-navy">{item.tutor}</p>
                      <p className="text-xs font-bold text-steel-blue uppercase">{item.date}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-steel-blue italic">No session history yet.</p>
            )}
          </div>
        </DashboardCard>

      </div>
    </div>
  );
}
