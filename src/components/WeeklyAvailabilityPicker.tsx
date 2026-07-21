"use client";

import React from "react";
import { Clock, Check, Calendar } from "lucide-react";

export interface AvailabilityDay {
  day: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_OPTIONS: string[] = [
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
];

interface WeeklyAvailabilityPickerProps {
  value: AvailabilityDay[];
  onChange: (availability: AvailabilityDay[]) => void;
}

export function getDefaultAvailability(): AvailabilityDay[] {
  return DAYS.map((day) => ({
    day,
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    active: day !== "Saturday" && day !== "Sunday",
  }));
}

export default function WeeklyAvailabilityPicker({
  value,
  onChange,
}: WeeklyAvailabilityPickerProps) {
  const currentAvailability: AvailabilityDay[] =
    Array.isArray(value) && value.length > 0
      ? DAYS.map((day) => {
          const existing = value.find(
            (v) => v.day.toLowerCase() === day.toLowerCase()
          );
          if (existing) {
            return {
              day,
              startTime: existing.startTime || "09:00 AM",
              endTime: existing.endTime || "05:00 PM",
              active: existing.active !== undefined ? existing.active : true,
            };
          }
          return {
            day,
            startTime: "09:00 AM",
            endTime: "05:00 PM",
            active: day !== "Saturday" && day !== "Sunday",
          };
        })
      : getDefaultAvailability();

  const handleToggleDay = (dayIndex: number) => {
    const updated = [...currentAvailability];
    updated[dayIndex] = {
      ...updated[dayIndex],
      active: !updated[dayIndex].active,
    };
    onChange(updated);
  };

  const handleTimeChange = (
    dayIndex: number,
    field: "startTime" | "endTime",
    timeValue: string
  ) => {
    const updated = [...currentAvailability];
    updated[dayIndex] = {
      ...updated[dayIndex],
      [field]: timeValue,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-dark-navy uppercase tracking-tight flex items-center gap-2">
            <Calendar size={16} className="text-coral" /> Weekly Availability Schedule
          </h4>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Select available teaching days and 12-hour time slots (AM / PM).
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {currentAvailability.map((item, index) => (
          <div
            key={item.day}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
              item.active
                ? "bg-gray-50/80 border-gray-200 shadow-xs"
                : "bg-gray-50/20 border-gray-100 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3 min-w-[140px]">
              <button
                type="button"
                onClick={() => handleToggleDay(index)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  item.active
                    ? "bg-dark-navy text-white shadow-xs"
                    : "border-2 border-gray-300 text-transparent"
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  item.active ? "text-dark-navy" : "text-gray-400"
                }`}
              >
                {item.day}
              </span>
            </div>

            {item.active ? (
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Start
                  </span>
                  <div className="relative">
                    <select
                      value={item.startTime}
                      onChange={(e) =>
                        handleTimeChange(index, "startTime", e.target.value)
                      }
                      className="appearance-none bg-white px-3 py-2 pr-8 rounded-xl border border-gray-200 text-xs font-bold text-dark-navy focus:outline-none focus:border-coral transition-all"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <Clock
                      size={12}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                <span className="text-gray-300 text-xs hidden sm:inline">-</span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    End
                  </span>
                  <div className="relative">
                    <select
                      value={item.endTime}
                      onChange={(e) =>
                        handleTimeChange(index, "endTime", e.target.value)
                      }
                      className="appearance-none bg-white px-3 py-2 pr-8 rounded-xl border border-gray-200 text-xs font-bold text-dark-navy focus:outline-none focus:border-coral transition-all"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <Clock
                      size={12}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-gray-400 italic">
                Unavailable
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
