"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Award, Trophy, FileText, TrendingUp, Loader2, X, Users } from "lucide-react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Achievement {
  _id: string;
  name: string;
  description: string;
  type: "badge" | "certificate" | "milestone" | "achievement";
  image?: string;
  icon?: string;
  category?: string;
  points?: number;
  isActive: boolean;
  createdAt: string;
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

export default function AdminAchievementsClient() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "achievement" as "badge" | "certificate" | "milestone" | "achievement",
    image: "",
    icon: "",
    category: "",
    points: 0,
    isActive: true,
  });

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/achievements");
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/achievements", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: editingId,
        }),
      });
      if (res.ok) {
        toast.success(editingId ? "Achievement updated!" : "Achievement created!");
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
          name: "",
          description: "",
          type: "achievement",
          image: "",
          icon: "",
          category: "",
          points: 0,
          isActive: true,
        });
        fetchAchievements();
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement._id);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      type: achievement.type,
      image: achievement.image || "",
      icon: achievement.icon || "",
      category: achievement.category || "",
      points: achievement.points || 0,
      isActive: achievement.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    try {
      const res = await fetch(`/api/admin/achievements?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Achievement deleted!");
        fetchAchievements();
      }
    } catch (error) {
      toast.error("Error deleting achievement");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-purple-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              type: "achievement",
              image: "",
              icon: "",
              category: "",
              points: 0,
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-dark-navy text-white font-black text-xs uppercase tracking-widest rounded-[1.5rem] hover:bg-purple-primary transition-all shadow-lg"
        >
          <Plus size={16} />
          Add Achievement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const Icon = getIconForType(achievement.type);
          return (
            <div
              key={achievement._id}
              className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {achievement.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100">
                      <Image src={achievement.image} alt={achievement.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center">
                      <Icon className="text-purple-600" size={28} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-dark-navy text-sm uppercase tracking-tight">
                      {achievement.name}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {achievement.type} • {achievement.category || "General"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="p-2 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-600 rounded-lg transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(achievement._id)}
                    className="p-2 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {achievement.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  {achievement.points && (
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                      {achievement.points} XP
                    </span>
                  )}
                  <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${achievement.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    {achievement.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {new Date(achievement.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
        {achievements.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
            <Trophy className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
              No achievements yet. Create your first one!
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-deep-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-deep-black uppercase tracking-tight">
                  {editingId ? "Edit Achievement" : "Add Achievement"}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Name
                      </label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy focus:outline-none focus:border-purple-primary/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as any,
                          })
                        }
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy focus:outline-none focus:border-purple-primary/30 transition-all"
                      >
                        <option value="achievement">Achievement</option>
                        <option value="badge">Badge</option>
                        <option value="certificate">Certificate</option>
                        <option value="milestone">Milestone</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy focus:outline-none focus:border-purple-primary/30 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Image URL (Optional)
                      </label>
                      <input
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy focus:outline-none focus:border-purple-primary/30 transition-all"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Category (Optional)
                      </label>
                      <input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy focus:outline-none focus:border-purple-primary/30 transition-all"
                        placeholder="e.g., Academics, Sessions"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        XP Points (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy focus:outline-none focus:border-purple-primary/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Status
                      </label>
                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 accent-purple-primary rounded"
                        />
                        <span className="text-sm font-bold text-gray-700">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                      }}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-purple-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-purple-primary/90 transition-all shadow-lg disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin" size={16} />
                          Saving...
                        </div>
                      ) : editingId ? (
                        "Update Achievement"
                      ) : (
                        "Create Achievement"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
