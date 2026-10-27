/**
 * Author identity.
 *
 * Sourced from the author's own repositories — `info/index_1.html` and
 * `soil-media-portal/index.html` — not from any generated copy. The previous
 * build of this site shipped a hardcoded `monir@example.com` placeholder; that
 * is gone.
 *
 * Numbers here are transcribed from the CV, EXCEPT `repos` / `live`, which are
 * counted from repos.generated.json at runtime so they can never drift. See
 * design-system.md §7 "Claims discipline".
 */

export const author = {
  name: "Abu Md. Moniruzjaman",
  nameAlt: "Abu Md. Moniruzjaman",
  short: "Moniruzjaman",
  initials: "AM",
  role: "Additional Deputy Director (Horticulture)",
  org: "Department of Agricultural Extension (DAE)",
  orgBn: "কৃষি সম্প্রসারণ অধিদপ্তর",
  location: "Kurigram, Rangpur Division, Bangladesh",
  cadre: "31st BCS Agriculture Cadre",
  email: "mithun.hstu@gmail.com",
  phone: "+8801712663740",
  phoneDisplay: "01712663740",
  /** Portfolio default: phone is not published. Flip to true to show it on Home/About. */
  showPhone: false as boolean,
  // Social profile URLs — single source of truth (see src/components/Socials.tsx).
  github: "https://github.com/moniruzjaman",
  githubHandle: "moniruzjaman",
  linkedin: "https://www.linkedin.com/in/abu-md-moniruzjaman-a55b5034/",
  facebook: "https://www.facebook.com/moniruzjaman2021",
  youtube: "https://www.youtube.com/@AgriWisdomBd",
  site: "https://moniruzjaman.github.io",

  vision:
    "Transforming Bangladesh's agricultural extension from paper-based to AI-powered — bringing science, data, and connectivity directly into the hands of smallholder farmers.",

  education: [
    {
      degree: "MBA",
      field: "Marketing",
      org: "North South University",
      orgBn: "নর্থ সাউথ বিশ্ববিদ্যালয়",
      year: 2011,
      detail: "CGPA 3.13 / 4.00",
    },
    {
      degree: "B.Sc. Ag. (Hons.)",
      field: "Agriculture Science",
      org: "Hajee Mohammad Danesh S&T University",
      orgBn: "হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়",
      year: 2008,
      detail: "CGPA 2.91 / 4.00",
    },
  ],

  career: [
    {
      from: "2024",
      to: "Present",
      role: "Additional Deputy Director (Horticulture)",
      place: "DAE, Kurigram",
      placeBn: "কুড়িগ্রাম",
      note: "District strategic leadership for horticulture extension — digital transformation of extension services, AI app deployment, farmer outreach in the northern river delta.",
    },
    {
      from: "2022",
      to: "2024",
      role: "Upazila Agriculture Officer",
      place: "Rangpur Sadar & Kaunia, Rangpur",
      placeBn: "রংপুর",
      note: "Digital farmer services and crop advisory across the fertile Rangpur plains.",
    },
    {
      from: "2021",
      to: "2022",
      role: "Upazila Agriculture Officer",
      place: "Rangamati Sadar & Naniarchar, Rangamati",
      placeBn: "রাঙ্গামাটি",
      note: "Hill tracts agriculture extension in the CHT — indigenous farming systems and upland crop management.",
    },
    {
      from: "2021",
      to: "2021",
      role: "Instructor, Agriculture Training Institute (ATI)",
      place: "Bangladesh",
      placeBn: "বাংলাদেশ",
      note: "Technical knowledge transfer to field extension officers; curriculum for modern crop management.",
    },
    {
      from: "2018",
      to: "2021",
      role: "Upazila Agriculture Officer",
      place: "Dirai & Shalla, Sunamganj",
      placeBn: "সুনামগঞ্জ",
      note: "Haor wetland crop management — flood-resilient, disaster-adaptive farming for the seasonally inundated haor ecosystem.",
    },
    {
      from: "2017",
      to: "2018",
      role: "Agricultural Extension Officer",
      place: "Natore Sadar, Natore",
      placeBn: "নাটোর",
      note: "Commencement of civil service. Field-level extension work for smallholder farmers.",
    },
  ],

  competencies: [
    {
      group: "Agricultural Science",
      groupBn: "কৃষি বিজ্ঞান",
      items: [
        "CABI Plantwise Diagnostics",
        "IPM / Crop Protection",
        "Horticulture Management",
        "Haor & Hill Tract Agronomy",
        "Farmer Field Schools",
      ],
    },
    {
      group: "Software Development",
      groupBn: "সফটওয়্যার উন্নয়ন",
      items: [
        "React / React Native",
        "Vite / Node.js",
        "Vercel Serverless Functions",
        "Cloudflare Workers",
        "Google Apps Script",
      ],
    },
    {
      group: "AI & Data",
      groupBn: "এআই ও তথ্য",
      items: [
        "Multimodal LLM orchestration",
        "Bengali NLP / TTS / ASR",
        "On-device model inference",
        "Retrieval over field datasets",
      ],
    },
    {
      group: "Management & Policy",
      groupBn: "ব্যবস্থাপনা ও নীতি",
      items: [
        "Agricultural Policy Analysis",
        "Extension Programme Management",
        "Strategic Planning (MBA)",
        "Report Writing & Proposals",
      ],
    },
  ],
} as const;

/** Derived from `career` so they cannot drift (design-system.md §7). */
export const figures = {
  yearsField: new Date().getFullYear() - Number(author.career[author.career.length - 1].from),
  postings: author.career.length,
  edu: author.education.length,
};

export type Author = typeof author;
