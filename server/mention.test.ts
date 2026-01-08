import { describe, it, expect } from "vitest";

describe("Mention functionality", () => {
  it("should detect @ symbol in text", () => {
    const text = "Hello @bruno, how are you?";
    const lastAtIndex = text.lastIndexOf("@");
    expect(lastAtIndex).toBe(6);
  });

  it("should extract mention query", () => {
    const text = "Hello @bru";
    const lastAtIndex = text.lastIndexOf("@");
    const mentionQuery = text.slice(lastAtIndex + 1);
    expect(mentionQuery).toBe("bru");
  });

  it("should filter users by mention query", () => {
    const users = [
      { id: 1, username: "bruno", firstName: "Bruno", lastName: "Medeiros" },
      { id: 2, username: "ana", firstName: "Ana", lastName: "Silva" },
      { id: 3, username: "carlos", firstName: "Carlos", lastName: "Santos" },
    ];

    const query = "br";
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].username).toBe("bruno");
  });

  it("should handle multiple mention filtering", () => {
    const users = [
      { id: 1, username: "bruno", firstName: "Bruno", lastName: "Medeiros" },
      { id: 2, username: "ana", firstName: "Ana", lastName: "Silva" },
      { id: 3, username: "carlos", firstName: "Carlos", lastName: "Santos" },
    ];

    const query = "a";
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
    );

    expect(filtered).toHaveLength(2); // ana and carlos
  });

  it("should insert mention correctly", () => {
    const value = "Hello @bru";
    const mentionStart = 6;
    const mentionQuery = "bru";
    const username = "bruno";

    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${username} ${afterMention}`;

    expect(newValue).toBe("Hello @bruno ");
  });

  it("should handle mention in middle of text", () => {
    const value = "Hello @bru and goodbye";
    const mentionStart = 6;
    const mentionQuery = "bru";
    const username = "bruno";

    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${username} ${afterMention}`;

    expect(newValue).toBe("Hello @bruno  and goodbye");
  });

  it("should detect mention regex pattern", () => {
    const text = "Hello @bruno, @ana and @carlos";
    const mentionRegex = /@(\w+)/g;
    const matches: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      matches.push(match[1]);
    }

    expect(matches).toEqual(["bruno", "ana", "carlos"]);
  });

  it("should handle empty mention query", () => {
    const users = [
      { id: 1, username: "bruno", firstName: "Bruno", lastName: "Medeiros" },
      { id: 2, username: "ana", firstName: "Ana", lastName: "Silva" },
    ];

    const query = "";
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
    );

    expect(filtered).toHaveLength(2); // All users match empty query
  });
});
