"use client";

import React, { useState, useEffect } from "react";
import { Send, AlertTriangle, Info, Bell, MessageSquare, Search, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { sendAdminMessage } from "@/app/(routes)/messages/actions";

interface UserListEntry {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function AdminContactPanel() {
  const [users, setUsers] = useState<UserListEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("all_students");
  const [category, setCategory] = useState<"warning" | "update" | "reminder" | "general">("general");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users/list");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error("Failed to load users for message panel", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Message content cannot be empty");
      return;
    }

    setLoading(true);
    const res = await sendAdminMessage({
      recipientId: selectedRecipient,
      content,
      category,
    });
    setLoading(false);

    if (res.success) {
      toast.success("Message sent successfully!");
      setContent("");
    } else {
      toast.error(res.error || "Failed to send message");
    }
  };

  const getRecipientLabel = () => {
    if (selectedRecipient === "all_students") return "All Students";
    if (selectedRecipient === "all_tutors") return "All Tutors";
    const user = users.find((u) => u._id === selectedRecipient);
    return user ? `${user.name} (${user.role.toUpperCase()})` : "Select recipient";
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2rem] border-2 border-dark-navy shadow-[8px_8px_0px_0px_rgba(43,65,98,1)] flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-dark-navy uppercase tracking-tight flex items-center gap-3">
          <MessageSquare className="text-coral" size={24} /> Contact Center
        </h2>
        <p className="text-[10px] md:text-[11px] font-bold text-steel-blue uppercase tracking-[0.2em]">
          Send notifications, warnings, updates, and reminders to users
        </p>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recipient Selection */}
          <div className="relative space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-dark-navy">
              Recipient
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full text-left px-5 py-4 bg-gray-50 border-2 border-dark-navy rounded-2xl text-xs font-bold text-dark-navy focus:outline-none flex justify-between items-center"
              >
                <span>{getRecipientLabel()}</span>
                <Search size={16} className="text-steel-blue" />
              </button>

              {showDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-dark-navy rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-2 space-y-1">
                  <input
                    type="text"
                    placeholder="Search students/tutors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 border-b border-gray-100 text-xs font-bold focus:outline-none mb-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecipient("all_students");
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 ${
                      selectedRecipient === "all_students" ? "text-coral bg-coral/5" : "text-dark-navy"
                    }`}
                  >
                    All Students
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecipient("all_tutors");
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 ${
                      selectedRecipient === "all_tutors" ? "text-coral bg-coral/5" : "text-dark-navy"
                    }`}
                  >
                    All Tutors
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  {filteredUsers.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => {
                        setSelectedRecipient(u._id);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium hover:bg-gray-50 flex items-center justify-between ${
                        selectedRecipient === u._id ? "text-coral bg-coral/5 font-black" : "text-dark-navy"
                      }`}
                    >
                      <span className="truncate">{u.name} ({u.email})</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border bg-gray-50 text-steel-blue">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-dark-navy">
              Message Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "general", label: "General", icon: Info, color: "bg-blue-50 text-blue-600 border-blue-100" },
                { id: "update", label: "Update", icon: Bell, color: "bg-purple-50 text-purple-600 border-purple-100" },
                { id: "reminder", label: "Reminder", icon: CheckCircle, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                { id: "warning", label: "Warning", icon: AlertTriangle, color: "bg-amber-50 text-amber-600 border-amber-100" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
                    category === cat.id
                      ? "border-dark-navy bg-dark-navy text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <cat.icon size={14} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-dark-navy">
            Message Content
          </label>
          <textarea
            placeholder="Type your message details here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-dark-navy rounded-2xl text-xs font-bold text-dark-navy focus:outline-none focus:bg-white resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-xl hover:shadow-coral/20 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Send size={14} /> Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
