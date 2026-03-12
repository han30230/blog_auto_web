import { listJobs } from "@/services/jobService";

describe("jobs API / service", () => {
  it("listJobs returns array", async () => {
    const result = await listJobs(5);
    expect(Array.isArray(result)).toBe(true);
  });
});
