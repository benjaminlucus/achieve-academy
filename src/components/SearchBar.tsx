"use client";
import { Search, MapPin, BookOpen } from 'lucide-react';

export const SearchBar = ({ placeholder, onSearch }: { placeholder: string, onSearch: (val: string) => void }) => (
  <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-3 w-5 h-5 text-[#70869d]" />
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-[#f8f9fa] border-none rounded-lg focus:ring-2 focus:ring-[#1e3a5f] outline-none"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
    <select className="px-4 py-2 bg-[#f8f9fa] rounded-lg text-[#1e3a5f] font-medium outline-none border-none">
      <option>Subject (All)</option>
      <option>Mathematics</option>
      <option>Computer Science</option>
    </select>
  </div>
);