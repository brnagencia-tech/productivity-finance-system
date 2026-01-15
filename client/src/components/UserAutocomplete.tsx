import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Check } from "lucide-react";

interface UserAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (username: string) => void;
  placeholder?: string;
  className?: string;
}

export default function UserAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "@usuario",
  className = ""
}: UserAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extrair query de busca (remover @ se existir)
  const searchQuery = value.startsWith('@') ? value.slice(1) : value;

  // Buscar usuários com debounce
  const { data: users, isLoading } = trpc.managedUsers.search.useQuery(
    { query: searchQuery },
    { 
      enabled: searchQuery.length > 0,
      staleTime: 30000 // Cache por 30s
    }
  );

  // Abrir dropdown quando há resultados
  useEffect(() => {
    if (users && users.length > 0 && searchQuery.length > 0) {
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
    }
  }, [users, searchQuery]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !users || users.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % users.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
        break;
      case "Enter":
        e.preventDefault();
        if (users[selectedIndex]) {
          handleSelect(users[selectedIndex].username);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Selecionar usuário
  const handleSelect = (username: string) => {
    onChange(username);
    setIsOpen(false);
    if (onSelect) {
      onSelect(username);
    }
  };

  // Gerar iniciais para avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (users && users.length > 0) {
            setIsOpen(true);
          }
        }}
        className={className}
        autoComplete="off"
      />

      {/* Dropdown de sugestões */}
      {isOpen && users && users.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-[300px] overflow-y-auto"
        >
          {users.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user.username)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>

              {/* Nome e Username */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
              </div>

              {/* Ícone de seleção */}
              {index === selectedIndex && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && searchQuery.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Buscando usuários...
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && searchQuery.length > 0 && (!users || users.length === 0) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            Nenhum usuário encontrado
          </div>
        </div>
      )}
    </div>
  );
}
