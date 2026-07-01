"use client";
import React, { useState, useEffect } from "react";
import { Trophy, Award, FileText, Star, TrendingUp, Clock, BookOpen } from "lucide-react";
import Image from "next/image";

interface UserAchievement {
  _id: string;
  achievement: {
    _id: string;
    name: string;
    description: string;
    type: "badge" | "certificate" | "milestone" | "achievement";
    image?: string;
    icon?: string;
    category?: string;
    points?: number;
  };
  earnedAt: string;
}

interface Achievement {
  _id: string;
  name: string;
  description: string;
  type: "badge" | "certificate" | "milestone" | "achievement";
  image?: string;
  icon?: string;
  category?: string;
  points?: number;
}

interface AchievementsSectionProps {
  userId: string;
}

const getIconForType = (type: string) => {
  switch (type) {
    case "certificate":
      return FileText;
    case "badge":
      return Award;
    case "milestone":
      return TrendingUp;
    default:
      return Trophy;
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case "certificate":
      return { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", iconBg: "bg-purple-100" };
    case "badge":
      return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", iconBg: "bg-amber-100" };
    case "milestone":
      return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", iconBg: "bg-emerald-100" };
    default:
      return { bg: "bg-coral/10", border: "border-coral/20", text: "text-coral", iconBg: "bg-coral/20" };
  }
};

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ userId }) => {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userRes, allRes] = await Promise.all([
          fetch(`/api/achievements?userId=${userId}`),
          fetch("/api/achievements")
        ]);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserAchievements(userData.userAchievements);
        }
        if (allRes.ok) {
          const allData = await allRes.json();
          setAllAchievements(allData.achievements);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const earnedIds = new Set(userAchievements.map(ua => ua.achievement._id));

  if (isLoading) {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Earned Achievements */}
      {userAchievements.length > 0 && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-50 pb-6 mb-8">
            <div>
              <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">My Achievements</h2>
              <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mt-1">
                {userAchievements.length} earned so far
              </p>
            </div>
            <Trophy className="text-coral" size={28} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAchievements.map((ua) => {
              const colors = getColorForType(ua.achievement.type);
              const Icon = getIconForType(ua.achievement.type);
              return (
                <div key={ua._id} className={`${colors.bg} ${colors.border} border p-6 rounded-[2rem] hover:shadow-md transition-all group`}>
                  <div className="flex items-start gap-4">
                    {ua.achievement.image ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/30">
                        <Image src={ua.achievement.image} alt={ua.achievement.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className={`${colors.iconBg} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={colors.text} size={28} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-dark-navy text-sm uppercase tracking-tight group-hover:text-purple-primary transition-colors">
                        {ua.achievement.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                        {ua.achievement.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        {ua.achievement.points && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                            <Star size={12} fill="currentColor" /> {ua.achievement.points} XP
                          </span>
                        )}
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {new Date(ua.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Achievements (Locked) */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-50 pb-6 mb-8">
          <div>
            <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Available Achievements</h2>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mt-1">
              {allAchievements.length - earnedIds.size} to unlock
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-gray-400" size={20} />
            <BookOpen className="text-gray-400" size={20} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAchievements.filter(a => !earnedIds.has(a._id)).map((achievement) => {
            const colors = getColorForType(achievement.type);
            const Icon = getIconForType(achievement.type);
            return (
              <div key={achievement._id} className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] opacity-70 hover:opacity-100 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0">
                    <Icon className="text-gray-400" size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-600 text-sm uppercase tracking-tight">
                      {achievement.name}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                      {achievement.description}
                    </p>
                    {achievement.points && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full mt-3">
                        <Star size={12} /> {achievement.points} XP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {allAchievements.filter(a => !earnedIds.has(a._id)).length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                🎉 You've earned all achievements!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
