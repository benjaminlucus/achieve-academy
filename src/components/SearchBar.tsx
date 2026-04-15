"use client";
import { Search, MapPin, BookOpen, Filter } from 'lucide-react';

export const SearchBar = ({ placeholder, onSearch }: { placeholder: string, onSearch: (val: string) => void }) => (
  <div>
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/5 text-sm font-medium transition-all"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex-1 md:flex-none">
          <Filter size={16} /> Filters
        </button>
        <select className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-all flex-1 md:flex-none">
          <option>All Roles</option>
          <option>Student</option>
          <option>Tutor</option>
          <option>Admin</option>
        </select>
      </div>
    </div>
  </div>
);