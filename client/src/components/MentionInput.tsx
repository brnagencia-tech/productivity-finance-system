import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  users: User[];
  className?: string;
  disabled?: boolean;
}

export function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Digite seu comentário...",
  users,
  className,
  disabled = false,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter users based on query
  useEffect(() => {
    if (mentionQuery) {
      const query = mentionQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query)
      );
      setSuggestions(filtered.slice(0, 5));
      setSelectedIndex(0);
    } else if (showSuggestions) {
      setSuggestions(users.slice(0, 5));
      setSelectedIndex(0);
    }
  }, [mentionQuery, users, showSuggestions]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    onChange(newValue);

    // Check if we're typing a mention
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's no space between @ and cursor (still typing username)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionStart(lastAtIndex);
        setMentionQuery(textAfterAt);
        setShowSuggestions(true);
        return;
      }
    }

    setShowSuggestions(false);
    setMentionStart(null);
    setMentionQuery("");
  };

  const insertMention = (user: User) => {
    if (mentionStart === null) return;

    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${user.username} ${afterMention}`;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionStart(null);
    setMentionQuery("");

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + user.username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && !e.shiftKey && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("min-h-[80px] resize-none", className)}
        disabled={disabled}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-w-xs bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-500">
              Mencionar usuário
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onClick={() => insertMention(user)}
                className={cn(
                  "w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors",
                  index === selectedIndex && "bg-emerald-50"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium text-sm">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{user.username}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to render text with highlighted mentions
export function renderMentions(text: string): React.ReactNode {
  const mentionRegex = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add highlighted mention
    parts.push(
      <span
        key={match.index}
        className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium text-sm"
      >
        @{match[1]}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
