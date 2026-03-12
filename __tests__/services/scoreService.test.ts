import { getScoringConfig } from "@/services/scoreService";
import { normalizeInRange } from "@/lib/config/scoring";

describe("scoreService / scoring config", () => {
  it("getWeights returns weights", () => {
    const config = getScoringConfig();
    expect(config.weights).toBeDefined();
    expect(typeof config.weights.volume).toBe("number");
  });

  it("normalizeInRange caps at 1", () => {
    expect(normalizeInRange(200, 100)).toBe(1);
  });

  it("normalizeInRange floors at 0", () => {
    expect(normalizeInRange(-10, 100)).toBe(0);
  });
});
