"use client";
import { useState, useLayoutEffect } from "react";
import { Search, Filter } from "lucide-react";

export const SearchBar = ({
  placeholder,
  onSearch,
  allStatuses,
  initialStatus = "All Status",
  filterClick,
}: {
  placeholder: string;
  onSearch: (data: { search: string; status: string }) => void;
  allStatuses: string[];
  initialStatus?: string;
  filterClick?: () => void;
}) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [mounted, setMounted] = useState(false);

  // Use useLayoutEffect for hydration flag to avoid cascading renders
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 Debounce (important for performance)
  useLayoutEffect(() => {
    if (!mounted) return;
    const delay = setTimeout(() => {
      onSearch({ search, status });
    }, 300);

    return () => clearTimeout(delay);
  }, [search, status, mounted, onSearch]);

  if (!mounted) return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center opacity-50">
      <div className="relative flex-1 w-full h-11 bg-gray-50 rounded-xl animate-pulse" />
      <div className="w-full md:w-32 h-11 bg-gray-50 rounded-xl animate-pulse" />
    </div>
  );

  return (
    <div>
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        
        {/* 🔍 Search Input */}
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/5 text-sm font-medium transition-all"
          />
        </div>

        {/* 🎛 Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          
          {filterClick && (
            <button
              onClick={filterClick}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex-1 md:flex-none"
            >
              <Filter size={16} /> Filters
            </button>
          )}

          {/* 📌 Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-all flex-1 md:flex-none"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

        </div>
      </div>
    </div>
  );
};
