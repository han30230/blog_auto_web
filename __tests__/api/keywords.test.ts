import { listKeywords } from "@/services/keywordService";

describe("keywords API / service", () => {
  it("listKeywords returns array", async () => {
    const result = await listKeywords({ limit: 5, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("listKeywords accepts sort option", async () => {
    const result = await listKeywords({ sort: "volume", limit: 2 });
    expect(Array.isArray(result)).toBe(true);
  });
});
