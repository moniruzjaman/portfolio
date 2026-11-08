import { repos, type Repo } from "./data";

/**
 * Research topics — the human-owned grouping of the generated catalogue.
 *
 * The contract mirrors the apps.json curation in src/lib/curation.ts: entries
 * are keyed by repo NAME against `repos.generated.json`, which the sync
 * workflow rewrites daily. A name the sync no longer reports simply renders
 * nothing; a synced repo nobody has assigned yet surfaces in the "elsewhere"
 * group, so new work appears on its own instead of waiting for a hand edit
 * (design-system §9 forbids a hand-typed repository list; §7 keeps counts
 * computed — every number on /topics derives from the generated data).
 */

export type TopicId =
  | "krishi-ai"
  | "diagnosis"
  | "pesticide"
  | "fertilizer"
  | "plantation"
  | "farmer"
  | "green"
  | "publications"
  | "systems";

/** The curated topics plus the fallback group; every repo has exactly one owner. */
export type GroupId = TopicId | "elsewhere";

export type TopicMeta = {
  id: GroupId;
  en: string;
  bn: string;
  blurbEn: string;
  blurbBn: string;
  /** Palette token (design-system §2) for the distribution bars. */
  color: string;
  /** Research notes (src/content/notes) that document this topic's method. */
  noteSlugs: readonly string[];
};

export const TOPICS: readonly TopicMeta[] = [
  {
    id: "krishi-ai",
    en: "Krishi AI Platform",
    bn: "কৃষি এআই প্ল্যাটফর্ম",
    blurbEn:
      "The Bengali-first agricultural AI assistant and its generations — flagship site, web platform, API gateway and the Expo mobile app.",
    blurbBn:
      "বাংলা-প্রথম কৃষি এআই সহকারী ও তার ধারাবাহিক সংস্করণ — ফ্ল্যাগশিপ সাইট, ওয়েব প্ল্যাটফর্ম, এপিআই গেটওয়ে ও মোবাইল অ্যাপ।",
    color: "var(--color-forest-500)",
    noteSlugs: [],
  },
  {
    id: "diagnosis",
    en: "Crop Diagnosis & Plant Health",
    bn: "ফসলের রোগ নির্ণয়",
    blurbEn:
      "CABI five-protocol diagnosis tools, the Plant Detective suite, a rice-doctor simulation game and an ML disease dataset.",
    blurbBn:
      "CABI পাঁচ-ধাপ নির্ণয় পদ্ধতির টুল, প্ল্যান্ট ডিটেকটিভ সিরিজ, ধান-ডাক্তার সিমুলেশন খেলা ও একটি এমএল রোগ ডেটাসেট।",
    color: "var(--color-forest-600)",
    noteSlugs: [
      "cabi-plantwise-ready-reckoner",
      "ipm-game-field-method",
      "greenhouse-advisory-tools",
    ],
  },
  {
    id: "pesticide",
    en: "Pesticide & AgriChem",
    bn: "বালাইনাশক ও কৃষিরসায়ন",
    blurbEn:
      "DAE-registered product databases, resistance-aware spraying, label reform, the 2018 Act and a biopesticide policy brief.",
    blurbBn:
      "ডিএই-নিবন্ধিত কীটনাশক ডেটাবেজ, বালাই-প্রতিরোধ সচেতন স্প্রেয়িং, লেবেল সংস্কার, ২০১৮ সালের আইন ও বায়োপেস্টিসাইড নীতিপত্র।",
    color: "var(--color-gold-600)",
    noteSlugs: [],
  },
  {
    id: "fertilizer",
    en: "Fertilizer & Soil Health",
    bn: "সার ও মাটি ব্যবস্থাপনা",
    blurbEn:
      "Subsidy transparency, distribution reform and soil-health media — the path from burden to bloom.",
    blurbBn: "ভর্তুকির স্বচ্ছতা, বিতরণ সংস্কার ও মাটির স্বাস্থ্য মিডিয়া — বোঝা থেকে ফুলের পথ।",
    color: "var(--color-gold-500)",
    noteSlugs: ["smart-integrated-nutrient-management-t-aman", "soil-health-media-hub"],
  },
  {
    id: "plantation",
    en: "Plantation & Nursery",
    bn: "বৃক্ষরোপণ ও নার্সারি",
    blurbEn:
      "Offline-first GIS trackers for the “০৫ বছরে ২৫ কোটি বৃক্ষরোপণ” programme and the Kurigram nursery registry.",
    blurbBn:
      "“০৫ বছরে ২৫ কোটি বৃক্ষরোপণ” কর্মসূচির অফলাইন-প্রথম জিআইএস ট্র্যাকার ও কুড়িগ্রাম নার্সারি রেজিস্ট্রি।",
    color: "var(--color-forest-700)",
    noteSlugs: ["plantation-tracker-field-system"],
  },
  {
    id: "farmer",
    en: "Farmer Services, GAP & Policy",
    bn: "কৃষক সেবা, জিএপি ও নীতি",
    blurbEn:
      "Krishak Card dashboards, GAP producer registers and training portals, plus a national agriculture policy study.",
    blurbBn:
      "কৃষক কার্ড ড্যাশবোর্ড, জিএপি উৎপাদক রেজিস্টার ও প্রশিক্ষণ পোর্টাল, সঙ্গে জাতীয় কৃষি নীতি গবেষণা।",
    color: "var(--color-gold-400)",
    noteSlugs: ["digital-transformation-krishak-card-roadmap"],
  },
  {
    id: "green",
    en: "Green Initiatives & Energy",
    bn: "সবুজ উদ্যোগ ও শক্তি",
    blurbEn:
      "Blockchain-enabled circular agriculture for the CIRDAP innovation challenge, and rooftop solar potential.",
    blurbBn:
      "সিআইআরডিএপি উদ্ভাবন চ্যালেঞ্জের ব্লকচেইন-ভিত্তিক চক্রাকার কৃষি এবং ছাদভিত্তিক সৌরবিদ্যুতের সম্ভাবনা।",
    color: "var(--color-forest-400)",
    noteSlugs: ["greenloop-3-circular-agriculture"],
  },
  {
    id: "publications",
    en: "Publications & e-Books",
    bn: "প্রকাশনা ও ই-বুক",
    blurbEn:
      "Bengali e-books and audiobooks — statecraft titles and self-reliant farming education.",
    blurbBn: "বাংলা ই-বুক ও অডিওবুক — রাষ্ট্রচিন্তার গ্রন্থ ও স্বশিক্ষিত কৃষিশিক্ষা।",
    color: "var(--color-moss-500)",
    noteSlugs: [],
  },
  {
    id: "systems",
    en: "Office Systems & Platform",
    bn: "অফিস ব্যবস্থা ও প্ল্যাটফর্ম",
    blurbEn:
      "The daily reporting pipeline, an e-billing concept demo and the knowledge-hub platform itself.",
    blurbBn: "দৈনিক প্রতিবেদন পাইপলাইন, ই-বিলিং ধারণা ডেমো এবং নলেজ-হাব প্ল্যাটফর্ম নিজেই।",
    color: "var(--color-forest-800)",
    noteSlugs: [],
  },
];

/**
 * Repos per topic, by name. Order inside a topic is curated; a name the sync
 * no longer reports contributes nothing rather than breaking the page.
 */
const TOPIC_REPO_NAMES: Record<TopicId, readonly string[]> = {
  "krishi-ai": [
    "web.krishiai.live",
    "krishi-ai",
    "krishiai-v2",
    "KrishiAI-3.0",
    "krishiai4.0",
    "krishiai",
    "krishi-ai-gateway",
    "krishiai-antigravity",
    "app.krishiai",
  ],
  diagnosis: [
    "cabi-diagnosis",
    "diagnosis-assistant",
    "crop-diagnosis",
    "cabi-diagnosis-builder",
    "diagnosis_game",
    "kaggle-dataset",
  ],
  pesticide: [
    "AgriChem-Guide-Pest-Control-Database",
    "pesticide-field-guide",
    "AgriChem_Registry",
    "pesticide-reform",
    "pesticide_regulatory",
    "pesticide_act_2018",
    "biopesticide-policy",
  ],
  fertilizer: [
    "fertilizer",
    "fertilizer-reform",
    "fertilizer-nationalism",
    "path-to-bloom",
    "cabinet-division-bangladesh-before-all",
    "soil-media-portal",
  ],
  plantation: [
    "plantation-tracker",
    "plantation-tracker-v1",
    "plantation-tracker-app",
    "plantation-submission-system",
    "kurigram_nursery_registry",
    "kurigram-nursery-2026",
    "nursery-report",
    "nursery-form",
    "nursery-form-2",
  ],
  farmer: ["krishak-card", "krishak-card-v2", "producer-register", "gap-brinjal", "bnp_policy"],
  green: ["cirdap-greenloop3.0", "solar-rooftop"],
  publications: ["rashtra_teen_chokhe", "rastro-tin-ayna", "bangladesh-zindabad", "self-learning"],
  systems: ["daily-report-pipeline", "e-bill-system", "knowledge-hub", "portfolio"],
};

/** Where unassigned-but-synced repos land. Rendered only when non-empty. */
export const ELSEWHERE_META: TopicMeta = {
  id: "elsewhere",
  en: "Everything else",
  bn: "অন্যান্য",
  blurbEn: "Freshly synced repositories that have not been assigned a theme yet.",
  blurbBn: "সদ্য সিঙ্ক হওয়া রিপোজিটরি — এখনো কোনো থিমের অন্তর্ভুক্ত হয়নি।",
  color: "var(--color-forest-300)",
  noteSlugs: [],
};

const META_BY_ID = new Map<GroupId, TopicMeta>([...TOPICS, ELSEWHERE_META].map((m) => [m.id, m]));

export const metaOf = (id: GroupId): TopicMeta => META_BY_ID.get(id)!;

const OWNER = new Map<string, TopicId>();
for (const t of TOPICS as readonly (TopicMeta & { id: TopicId })[]) {
  for (const name of TOPIC_REPO_NAMES[t.id]) {
    if (OWNER.has(name)) console.warn(`topics: "${name}" is assigned twice`);
    OWNER.set(name, t.id);
  }
}

export const topicOf = (r: Repo): GroupId => OWNER.get(r.name) ?? "elsewhere";

export const reposOf = (id: GroupId): Repo[] => repos.filter((r) => topicOf(r) === id);

/** Computed per design-system §7 — never typed by hand. */
export function groupStats(id: GroupId): { count: number; live: number } {
  const rs = reposOf(id);
  return { count: rs.length, live: rs.filter((r) => r.live || r.pages).length };
}

/** Groups that actually own something, in display order — elsewhere last. */
export const ACTIVE_GROUPS: GroupId[] = [
  ...TOPICS.map((t) => t.id),
  ...(groupStats("elsewhere").count > 0 ? (["elsewhere"] as GroupId[]) : []),
];

// Dev-time guard: a stale name is harmless at runtime but means the map wants attention.
for (const name of OWNER.keys()) {
  if (!repos.some((r) => r.name === name))
    console.warn(`topics: mapping references unknown repo "${name}"`);
}
