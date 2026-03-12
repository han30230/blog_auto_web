import type { NormalizedKeyword } from "@/adapters/types";

describe("normalized keyword schema", () => {
  it("NormalizedKeyword has required fields", () => {
    const n: NormalizedKeyword = {
      keyword: "test",
      source: "google_trends",
      country: "KR",
      language: "ko",
      collected_at: new Date(),
    };
    expect(n.keyword).toBe("test");
    expect(n.source).toBe("google_trends");
  });
});
