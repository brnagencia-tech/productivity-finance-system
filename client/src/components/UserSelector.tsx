import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface SelectedUser {
  id: number;
  displayName: string;
}

interface UserSelectorProps {
  selectedUserIds: number[];
  onUsersChange: (userIds: number[]) => void;
  placeholder?: string;
}

export function UserSelector({ selectedUserIds, onUsersChange, placeholder }: UserSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions = [] } = trpc.managedUsers.search.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  // Carregar informações dos usuários selecionados
  const { data: allUsers = [] } = trpc.managedUsers.list.useQuery();

  useEffect(() => {
    if (allUsers.length > 0) {
      const users = selectedUserIds.map(id => {
        const user = allUsers.find(u => u.id === id);
        return user ? {
          id: user.id,
          displayName: `${user.firstName} ${user.lastName} (@${user.username})`
        } : null;
      }).filter(Boolean) as SelectedUser[];
      setSelectedUsers(users);
    }
  }, [selectedUserIds, allUsers]);

  useEffect(() => {
    // Detectar @ no input
    if (inputValue.startsWith("@")) {
      const searchQuery = inputValue.slice(1);
      setQuery(searchQuery);
      setShowSuggestions(true);
    } else if (inputValue.length > 0) {
      setQuery(inputValue);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setQuery("");
    }
  }, [inputValue]);

  const handleSelectUser = (user: { id: number; displayName: string }) => {
    // Adicionar usuário selecionado
    if (!selectedUserIds.includes(user.id)) {
      onUsersChange([...selectedUserIds, user.id]);
    }
    // Limpar input
    setInputValue("");
    setShowSuggestions(false);
    setQuery("");
  };

  const handleRemoveUser = (userId: number) => {
    onUsersChange(selectedUserIds.filter(id => id !== userId));
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder || "Digite @ para mencionar usuários ou busque por nome..."}
          className="w-full"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectUser(user)}
                className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              >
                <div className="flex-1">
                  <div className="font-medium">{user.displayName}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Usuários selecionados */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
              {user.displayName}
              <button
                type="button"
                onClick={() => handleRemoveUser(user.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
