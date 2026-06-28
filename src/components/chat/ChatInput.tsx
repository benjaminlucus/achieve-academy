"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, Send } from "lucide-react";

const EMOJI_GROUPS = [
  {
    label: "Smileys",
    emojis: ["😀", "😂", "🥰", "😊", "😍", "🤩", "😎", "🤔", "😅", "😢", "😭", "😤", "🥳", "😴", "🤗"],
  },
  {
    label: "Gestures",
    emojis: ["👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "💪", "🙏", "👋", "🫶", "❤️", "🔥", "⭐", "✅"],
  },
  {
    label: "Study",
    emojis: ["📚", "✏️", "📝", "🎓", "💡", "🧠", "📖", "🖊️", "📌", "🎯", "🏆", "⏰", "📅", "💻", "🔔"],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {EMOJI_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] font-black text-steel-blue uppercase tracking-widest mb-1.5 px-1">
              {group.label}
            </p>
            <div className="grid grid-cols-8 gap-0.5">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  onBack?: () => void;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
  onBack,
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <div className="relative flex-grow flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-2.5 text-gray-400 hover:text-coral hover:bg-coral/5 rounded-xl transition-all disabled:opacity-40"
          title="Add emoji"
        >
          <Smile size={20} />
        </button>
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-grow px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20 disabled:opacity-50"
        />
      </div>
      {value.trim() ? (
        <button
          type="submit"
          disabled={disabled}
          className="p-3 bg-dark-navy text-white rounded-xl hover:bg-coral transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      ) : onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      ) : null}
    </form>
  );
}
