import { describe, expect, it, vi } from "vitest";

// Mock Socket.IO module
vi.mock("socket.io", () => ({
  Server: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    to: vi.fn().mockReturnValue({
      emit: vi.fn()
    })
  }))
}));

describe("Socket.IO Integration", () => {
  describe("KanbanEvents", () => {
    it("should have all required event types defined", async () => {
      const { KanbanEvents } = await import("./_core/socket");
      
      expect(KanbanEvents.CARD_MOVED).toBe("kanban:card-moved");
      expect(KanbanEvents.CARD_CREATED).toBe("kanban:card-created");
      expect(KanbanEvents.CARD_UPDATED).toBe("kanban:card-updated");
      expect(KanbanEvents.CARD_DELETED).toBe("kanban:card-deleted");
      expect(KanbanEvents.COLUMN_CREATED).toBe("kanban:column-created");
      expect(KanbanEvents.COLUMN_UPDATED).toBe("kanban:column-updated");
      expect(KanbanEvents.COLUMN_DELETED).toBe("kanban:column-deleted");
      expect(KanbanEvents.COMMENT_ADDED).toBe("kanban:comment-added");
      expect(KanbanEvents.CHECKLIST_UPDATED).toBe("kanban:checklist-updated");
    });
  });

  describe("emitToBoardRoom", () => {
    it("should emit events to the correct board room", async () => {
      const { emitToBoardRoom, initializeSocket, KanbanEvents } = await import("./_core/socket");
      const http = await import("http");
      
      // Create a mock HTTP server
      const mockServer = http.createServer();
      initializeSocket(mockServer);
      
      // This should not throw
      expect(() => {
        emitToBoardRoom(1, KanbanEvents.CARD_CREATED, { id: 1, title: "Test Card" });
      }).not.toThrow();
    });
  });
});

describe("Managed Users Login", () => {
  describe("Password Hashing", () => {
    it("should correctly encode password to base64", () => {
      const password = "TestPassword123!";
      const hash = Buffer.from(password).toString("base64");
      
      expect(hash).toBe("VGVzdFBhc3N3b3JkMTIzIQ==");
      
      // Verify decoding works
      const decoded = Buffer.from(hash, "base64").toString();
      expect(decoded).toBe(password);
    });

    it("should generate different hashes for different passwords", () => {
      const password1 = "Password1";
      const password2 = "Password2";
      
      const hash1 = Buffer.from(password1).toString("base64");
      const hash2 = Buffer.from(password2).toString("base64");
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Token Generation", () => {
    it("should generate a valid base64 token", () => {
      const userId = 123;
      const timestamp = Date.now();
      const token = Buffer.from(`${userId}:${timestamp}`).toString("base64");
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      
      // Verify decoding works
      const decoded = Buffer.from(token, "base64").toString();
      const [decodedUserId, decodedTimestamp] = decoded.split(":");
      
      expect(parseInt(decodedUserId)).toBe(userId);
      expect(parseInt(decodedTimestamp)).toBe(timestamp);
    });
  });
});

describe("Username Validation", () => {
  const usernameRegex = /^[a-z0-9_]+$/;

  it("should accept valid usernames", () => {
    const validUsernames = [
      "joaosilva",
      "joao_silva",
      "joao123",
      "joao_silva_123",
      "user1"
    ];

    validUsernames.forEach(username => {
      expect(usernameRegex.test(username)).toBe(true);
    });
  });

  it("should reject invalid usernames", () => {
    const invalidUsernames = [
      "JoaoSilva",    // uppercase
      "joao silva",   // space
      "joao@silva",   // special char
      "joão",         // accent
      "joao-silva",   // hyphen
      ""              // empty
    ];

    invalidUsernames.forEach(username => {
      expect(usernameRegex.test(username)).toBe(false);
    });
  });

  it("should generate valid username from name", () => {
    const generateUsername = (firstName: string, lastName: string) => {
      const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, "");
      const random = Math.floor(Math.random() * 1000);
      return `${base}${random}`;
    };

    // Note: Accented characters like 'ã' are removed, so 'João' becomes 'joo'
    const username = generateUsername("João", "Silva");
    
    expect(usernameRegex.test(username)).toBe(true);
    expect(username).toMatch(/^joosilva\d{1,3}$/); // 'a' with tilde removed
    
    // Test with non-accented name
    const username2 = generateUsername("Joao", "Silva");
    expect(username2).toMatch(/^joaosilva\d{1,3}$/);
  });
});

describe("Phone Number Formatting", () => {
  describe("Brazilian Phone Format", () => {
    const formatPhoneBR = (value: string): string => {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 2) return `(${numbers}`;
      if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    it("should format partial numbers correctly", () => {
      expect(formatPhoneBR("11")).toBe("(11");
      expect(formatPhoneBR("1199")).toBe("(11) 99");
      expect(formatPhoneBR("11999")).toBe("(11) 999");
    });

    it("should format complete numbers correctly", () => {
      expect(formatPhoneBR("11999999999")).toBe("(11) 99999-9999");
    });
  });

  describe("US Phone Format", () => {
    const formatPhoneUS = (value: string): string => {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 3) return `(${numbers}`;
      if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
      if (numbers.length <= 10) return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    };

    it("should format partial numbers correctly", () => {
      expect(formatPhoneUS("555")).toBe("(555");
      expect(formatPhoneUS("555123")).toBe("(555) 123");
    });

    it("should format complete numbers correctly", () => {
      expect(formatPhoneUS("5551234567")).toBe("(555) 123-4567");
    });
  });
});

describe("Strong Password Generation", () => {
  const generateStrongPassword = (): string => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const all = lowercase + uppercase + numbers + symbols;
    
    let password = "";
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 0; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    return password.split("").sort(() => Math.random() - 0.5).join("");
  };

  it("should generate password with minimum 16 characters", () => {
    const password = generateStrongPassword();
    expect(password.length).toBe(16);
  });

  it("should contain at least one lowercase letter", () => {
    const password = generateStrongPassword();
    expect(/[a-z]/.test(password)).toBe(true);
  });

  it("should contain at least one uppercase letter", () => {
    const password = generateStrongPassword();
    expect(/[A-Z]/.test(password)).toBe(true);
  });

  it("should contain at least one number", () => {
    const password = generateStrongPassword();
    expect(/[0-9]/.test(password)).toBe(true);
  });

  it("should contain at least one special character", () => {
    const password = generateStrongPassword();
    expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
  });

  it("should generate unique passwords", () => {
    const passwords = new Set();
    for (let i = 0; i < 100; i++) {
      passwords.add(generateStrongPassword());
    }
    expect(passwords.size).toBe(100);
  });
});
