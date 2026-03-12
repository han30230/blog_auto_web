import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const country = "KR";
  const language = "ko";

  const keywords = [
    "블로그",
    "SEO",
    "키워드 분석",
    "콘텐츠 마케팅",
    "검색량",
    "글쓰기",
    "마케팅",
    "트렌드",
    "네이버 블로그",
    "구글 검색",
  ];

  const keywordRecords = [];
  for (const text of keywords) {
    let k = await prisma.keyword.findFirst({ where: { text, country, language } });
    if (!k) {
      k = await prisma.keyword.create({ data: { text, country, language } });
    }
    keywordRecords.push(k);
  }

  const job1 = await prisma.sourceJob.create({
    data: {
      source: "google_trends",
      status: "completed",
      startedAt: new Date(Date.now() - 3600000),
      finishedAt: new Date(),
    },
  });
  const job2 = await prisma.sourceJob.create({
    data: {
      source: "naver_datalab",
      status: "completed",
      startedAt: new Date(Date.now() - 7200000),
      finishedAt: new Date(Date.now() - 3600000),
    },
  });

  const now = new Date();
  for (let i = 0; i < keywordRecords.length; i++) {
    const kw = keywordRecords[i];
    await prisma.keywordMetric.create({
      data: {
        keywordId: kw.id,
        source: i % 2 === 0 ? "google_trends" : "naver_datalab",
        country,
        language,
        collectedAt: now,
        trendScoreRelative: 20 + Math.random() * 80,
        monthlySearchVolume: i % 2 === 0 ? 1000 + Math.floor(Math.random() * 9000) : null,
        risingScore: 10 + Math.random() * 90,
        competitionLevel: Math.random() * 0.6,
        sourceConfidence: 0.8,
        sourceJobId: i % 2 === 0 ? job1.id : job2.id,
      },
    });
  }

  for (const kw of keywordRecords) {
    const vol = 1000 + Math.random() * 9000;
    const trend = 20 + Math.random() * 80;
    const comp = Math.random() * 0.6;
    const growth = 10 + Math.random() * 90;
    const nVol = Math.min(1, vol / 100000);
    const nTrend = Math.min(1, trend / 100);
    const nCompInv = 1 - Math.min(1, comp);
    const nGrowth = Math.min(1, growth / 100);
    const final =
      0.25 * nVol + 0.25 * nTrend + 0.25 * nCompInv + 0.25 * nGrowth;
    await prisma.keywordOpportunityScore.create({
      data: {
        keywordId: kw.id,
        snapshotAt: now,
        normalizedVolumeScore: nVol,
        normalizedTrendScore: nTrend,
        normalizedCompetitionInverse: nCompInv,
        normalizedGrowthScore: nGrowth,
        finalOpportunityScore: final,
      },
    });
  }

  if (keywordRecords.length >= 2) {
    await prisma.keywordCluster.create({
      data: {
        parentKeywordId: keywordRecords[0].id,
        childKeywordId: keywordRecords[1].id,
        relationType: "related",
      },
    });
    await prisma.keywordCluster.create({
      data: {
        parentKeywordId: keywordRecords[0].id,
        childKeywordId: keywordRecords[2].id,
        relationType: "longtail",
      },
    });
  }

  console.log("Seed completed: keywords", keywordRecords.length, "jobs 2, metrics and scores created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
