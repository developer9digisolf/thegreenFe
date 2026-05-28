import { describe, it, expect, vi, beforeEach } from "vitest";
import UseStorages from "./storage.util";
import { StoragesProperties } from "./consts.util";

describe("UseStorages", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("setItem", () => {
    it("should store unencrypted data", () => {
      const result = UseStorages.setItem("THEGREEN@TOKEN", "my-token");
      expect(localStorage.getItem("THEGREEN@TOKEN")).toBe("my-token");
      expect(result.data).toEqual([]);
    });

    it("should return chaining methods", () => {
      const result = UseStorages.setItem("THEGREEN@TOKEN", "token1");
      expect(typeof result.getItem).toBe("function");
      expect(typeof result.setItem).toBe("function");
    });

    it("should handle encryption", () => {
      const result = UseStorages.setItem("THEGREEN@TOKEN", "secret", true);
      const stored = localStorage.getItem("THEGREEN@TOKEN");
      expect(stored).not.toBe("secret");
      expect(stored).toBeTruthy();
    });
  });

  describe("getItem", () => {
    it("should retrieve stored data", () => {
      localStorage.setItem("THEGREEN@TOKEN", "my-token");
      const result = UseStorages.getItem("THEGREEN@TOKEN");
      expect(result.data[0]).toBe("my-token");
    });

    it("should return null for non-existent key", () => {
      const result = UseStorages.getItem("THEGREEN@TOKEN");
      expect(result.data[0]).toBeNull();
    });

    it("should chain multiple getItem calls", () => {
      localStorage.setItem("THEGREEN@TOKEN", "token1");
      localStorage.setItem("THEGREEN@USER", "user1");
      const result = UseStorages.getItem("THEGREEN@TOKEN").getItem("THEGREEN@USER");
      expect(result.data).toEqual(["token1", "user1"]);
    });

    it("should parse JSON when parse flag is true", () => {
      localStorage.setItem("THEGREEN@USER", '{"id":1,"name":"Test"}');
      const result = UseStorages.getItem("THEGREEN@USER", false, true);
      expect(result.data[0]).toEqual({ id: 1, name: "Test" });
    });
  });

  describe("dropItem", () => {
    it("should remove single item", () => {
      localStorage.setItem("THEGREEN@TOKEN", "token");
      UseStorages.dropItem("THEGREEN@TOKEN");
      expect(localStorage.getItem("THEGREEN@TOKEN")).toBeNull();
    });

    it("should remove multiple items", () => {
      localStorage.setItem("THEGREEN@TOKEN", "token");
      localStorage.setItem("THEGREEN@USER", "user");
      UseStorages.dropItem(["THEGREEN@TOKEN", "THEGREEN@USER"]);
      expect(localStorage.getItem("THEGREEN@TOKEN")).toBeNull();
      expect(localStorage.getItem("THEGREEN@USER")).toBeNull();
    });

    it("should return true", () => {
      expect(UseStorages.dropItem("THEGREEN@TOKEN")).toBe(true);
    });
  });

  describe("dropAll", () => {
    it("should clear all localStorage", () => {
      localStorage.setItem("THEGREEN@TOKEN", "token");
      localStorage.setItem("THEGREEN@USER", "user");
      UseStorages.dropAll();
      expect(localStorage.length).toBe(0);
    });

    it("should return true", () => {
      expect(UseStorages.dropAll()).toBe(true);
    });
  });
});
