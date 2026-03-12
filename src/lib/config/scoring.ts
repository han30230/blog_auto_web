export const scoringConfig = {
  weightVolume: parseFloat(process.env.SCORE_WEIGHT_VOLUME ?? "0.25"),
  weightTrend: parseFloat(process.env.SCORE_WEIGHT_TREND ?? "0.25"),
  weightCompetition: parseFloat(process.env.SCORE_WEIGHT_COMPETITION ?? "0.25"),
  weightGrowth: parseFloat(process.env.SCORE_WEIGHT_GROWTH ?? "0.25"),
  volumeCap: parseFloat(process.env.SCORE_VOLUME_CAP ?? "100000"),
  trendCap: parseFloat(process.env.SCORE_TREND_CAP ?? "100"),
  competitionCap: parseFloat(process.env.SCORE_COMPETITION_CAP ?? "1"),
};

export function getWeights() {
  return {
    volume: scoringConfig.weightVolume,
    trend: scoringConfig.weightTrend,
    competition: scoringConfig.weightCompetition,
    growth: scoringConfig.weightGrowth,
  };
}

export function normalizeInRange(value: number, cap: number): number {
  if (cap <= 0) return 0;
  return Math.min(1, Math.max(0, value / cap));
}
