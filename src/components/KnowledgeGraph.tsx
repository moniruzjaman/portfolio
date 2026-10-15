import { useMemo } from "react";
import { ExternalLink, GitBranch, Leaf, MapPin, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import { repos, type Repo } from "@/lib/data";

/**
 * Carried over from the Manus build — the SVG edge system, the node geometry,
 * the palette. The change is that `repoSignal` and the supporting links are no
 * longer hardcoded to plantation-tracker: they resolve against the generated
 * repo list, so a graph is a live view of what actually shipped.
 */

export type GraphIcon = "leaf" | "map" | "shield" | "branch" | "spark" | "sprout";

export type GraphNode = {
  label: string;
  detail: string;
  icon: GraphIcon;
};

export type ExpertiseGraph = {
  id: string;
  eyebrow: string;
  title: string;
  bangla: string;
  summary: string;
  color: string;
  /** Repos whose name/description/topic match this expertise. */
  match: string[];
  nodes: GraphNode[];
};

const iconMap = {
  leaf: Leaf,
  map: MapPin,
  shield: ShieldCheck,
  branch: GitBranch,
  spark: Sparkles,
  sprout: Sprout,
} as const;

const positions = [
  { left: "7%", top: "17%" },
  { right: "6%", top: "17%" },
  { left: "9%", bottom: "12%" },
  { right: "9%", bottom: "12%" },
];

/** Match a graph's declared keywords against real repo metadata. */
function matchRepos(match: string[]): Repo[] {
  const needle = (r: Repo) =>
    [r.name, r.title, r.description ?? "", ...(r.topics ?? []), ...r.channels]
      .join(" ")
      .toLowerCase();
  return repos.filter((r) => {
    const hay = needle(r);
    return match.some((m) => hay.includes(m.toLowerCase()));
  });
}

export function KnowledgeGraph({
  graph,
  compact = false,
}: {
  graph: ExpertiseGraph;
  compact?: boolean;
}) {
  const linked = useMemo(() => matchRepos(graph.match).slice(0, 4), [graph]);

  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-forest-800 ${
        compact ? "min-h-[350px]" : "min-h-[470px]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(74,184,112,0.18),transparent_34%),linear-gradient(135deg,rgba(201,162,39,0.08),transparent_44%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(168,216,176,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(168,216,176,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {positions.map((_, index) => {
          const x = index % 2 === 0 ? (index === 0 ? 22 : 25) : index === 1 ? 78 : 75;
          const y = index < 2 ? 29 : 72;
          return (
            <line
              key={index}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke={graph.color}
              strokeOpacity="0.42"
              strokeWidth="0.35"
              strokeDasharray="1.2 1.8"
            />
          );
        })}
      </svg>

      <div className="absolute left-1/2 top-1/2 z-10 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-forest-200/45 bg-forest-700 p-3 text-center shadow-[0_0_0_12px_rgba(74,184,112,0.06),0_18px_50px_rgba(0,0,0,0.28)] sm:h-36 sm:w-36">
        <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-forest-900">
          <Leaf size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-200">Expertise</span>
        <strong className="mt-1 text-sm leading-tight text-white">{graph.title}</strong>
      </div>

      {graph.nodes.map((node, index) => {
        const Icon = iconMap[node.icon];
        return (
          <div
            key={node.label}
            className="absolute z-10 w-[39%] max-w-[188px] rounded-2xl border border-white/10 bg-forest-900/90 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-1 hover:border-forest-200/45"
            style={positions[index]}
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold-400">
                <Icon size={14} />
              </span>
              <div>
                <p className="text-xs font-bold leading-tight text-white">{node.label}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-forest-200">{node.detail}</p>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-white/10 bg-forest-900/70 px-4 py-3 backdrop-blur">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-forest-200">
          {linked.length} linked {linked.length === 1 ? "repo" : "repos"}
        </span>
        {linked[0] && (
          <a
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-gold-400 transition-colors hover:text-white"
            href={linked[0].url}
            target="_blank"
            rel="noreferrer"
          >
            {linked[0].name} <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

export const expertiseGraphs: ExpertiseGraph[] = [
  {
    id: "plantwise",
    eyebrow: "01 / Diagnosis",
    title: "Plantwise Diagnostics",
    bangla: "উদ্ভিদ রোগ নির্ণয়",
    summary:
      "A field diagnosis mindset made actionable through location-aware records, structured observations, and traceable entries.",
    color: "var(--color-forest-400)",
    match: ["cabi", "diagnosis", "plant-detective", "crop-diagnosis", "plantwise"],
    nodes: [
      { label: "Field observation", detail: "Structured nursery and seedling records", icon: "leaf" },
      { label: "Geo context", detail: "Coordinates and reverse-geocoded address", icon: "map" },
      { label: "Review trail", detail: "Editable records for follow-up checks", icon: "shield" },
      { label: "Diagnosis loop", detail: "From evidence to an actionable next step", icon: "branch" },
    ],
  },
  {
    id: "ipm",
    eyebrow: "02 / Protection",
    title: "IPM & Crop Protection",
    bangla: "সমন্বিত বালাই ব্যবস্থাপনা",
    summary:
      "Integrated protection connects what is planted, where it is planted, and how field teams verify it without losing context.",
    color: "var(--color-gold-300)",
    match: ["pesticide", "ipm", "gap-brinjal", "biopesticide", "crop-protection"],
    nodes: [
      { label: "Plant categories", detail: "Fruit, forest, and medicinal groupings", icon: "sprout" },
      { label: "Boundary check", detail: "Upazila polygon validation for GPS entries", icon: "shield" },
      { label: "Signal quality", detail: "Flags anomalies without deleting evidence", icon: "spark" },
      { label: "Safer action", detail: "Review before intervention or escalation", icon: "branch" },
    ],
  },
  {
    id: "horticulture",
    eyebrow: "03 / Systems",
    title: "Horticulture Management",
    bangla: "উদ্যানতত্ত্ব ব্যবস্থাপনা",
    summary:
      "A management view of nurseries, species, counts, and locations turns horticultural work into a measurable operating system.",
    color: "var(--color-forest-300)",
    match: ["plantation", "nursery", "kurigram", "horticulture", "tracker"],
    nodes: [
      { label: "Nursery profile", detail: "Region, district, upazila, and contact", icon: "map" },
      { label: "Species mix", detail: "Name, age, seedlings, and grafting counts", icon: "leaf" },
      { label: "Progress view", detail: "Totals by region and plant category", icon: "spark" },
      { label: "Official export", detail: "Excel-ready operational reporting", icon: "branch" },
    ],
  },
  {
    id: "field-schools",
    eyebrow: "04 / Learning",
    title: "Farmer Field Schools",
    bangla: "কৃষক মাঠ স্কুল",
    summary:
      "Learning is strongest when field knowledge is captured simply, works offline, and returns to a shared record when connectivity does.",
    color: "var(--color-gold-400)",
    match: ["game", "education", "wisdom", "youtube", "school", "training"],
    nodes: [
      { label: "Field-ready form", detail: "Mobile collection in low-connectivity areas", icon: "sprout" },
      { label: "Local memory", detail: "Browser storage keeps entries available", icon: "shield" },
      { label: "Sync moment", detail: "Automatic sync when a network is available", icon: "branch" },
      { label: "Shared learning", detail: "Data becomes a common operational language", icon: "spark" },
    ],
  },
  {
    id: "ai-tools",
    eyebrow: "05 / Intelligence",
    title: "AI-Powered Extension Tools",
    bangla: "এআই-ভিত্তিক কৃষি সেবা",
    summary:
      "Digital extension becomes useful when intelligent tools sit on top of reliable field data, maps, and clear human review paths.",
    color: "var(--color-forest-200)",
    match: ["krishi-ai", "krishiai", "ai", "chat", "gateway", "weather"],
    nodes: [
      { label: "Capture layer", detail: "PWA form built for field collection", icon: "spark" },
      { label: "Data layer", detail: "Structured records ready for analysis", icon: "branch" },
      { label: "Insight layer", detail: "Regional and species-level statistics", icon: "leaf" },
      { label: "Human loop", detail: "Reviewers keep decisions accountable", icon: "shield" },
    ],
  },
  {
    id: "policy",
    eyebrow: "06 / Policy",
    title: "Policy & Traceability",
    bangla: "নীতি ও নজরদারি",
    summary:
      "Traceability starts with trustworthy events: who recorded what, where it happened, and how the record can be exported or reviewed.",
    color: "var(--color-gold-600)",
    match: ["policy", "fertilizer", "bnp", "e-bill", "blockchain", "fertilizer-reform"],
    nodes: [
      { label: "Origin event", detail: "Nursery, location, and submission date", icon: "map" },
      { label: "Asset identity", detail: "Species, age, count, and grafting data", icon: "leaf" },
      { label: "Audit signal", detail: "Edits, checks, and exportable records", icon: "shield" },
      { label: "Review path", detail: "A clear base for chain-of-custody data", icon: "branch" },
    ],
  },
];

export const graphById = (id: string) => expertiseGraphs.find((g) => g.id === id);
