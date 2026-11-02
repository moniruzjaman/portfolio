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
  name: "Abu Md. Moniruzzaman",
  nameAlt: "Abu Md. Moniruzzaman",
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
    "Transforming Bangladesh's agricultural extension from paper-based to AI-powered — bringing science, data, and connectivity directly into the hands of smallholder farmers, while building a Smart Bangladesh through technology, transparency, and field-level innovation.",

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
      org: "Hajee Mohammad Danesh Science & Technology University",
      orgBn: "হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়",
      year: 2008,
      detail: "CGPA 2.91 / 4.00",
    },
    {
      degree: "HSC (Science)",
      field: "Science",
      org: "Rangpur Cantonment Public School & College",
      orgBn: "রংপুর ক্যান্টনমেন্ট পাবলিক স্কুল অ্যান্ড কলেজ",
      year: 2002,
      detail: "First Division",
    },
    {
      degree: "SSC (Science)",
      field: "Science",
      org: "Dinajpur Zilla School",
      orgBn: "দিনাজপুর জিলা স্কুল",
      year: 2000,
      detail: "First Division",
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
      placeBn: "রংপুর সদর ও কাউনিয়া, রংপুর",
      note: "Digital farmer services and crop advisory across the fertile Rangpur plains.",
    },
    {
      from: "2021",
      to: "2022",
      role: "Upazila Agriculture Officer",
      place: "Rangamati Sadar & Naniarchar, Rangamati",
      placeBn: "রাঙ্গামাটি সদর ও নানিয়ারচর, রাঙ্গামাটি",
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
      placeBn: "দিরাই ও শাল্লা, সুনামগঞ্জ",
      note: "Haor wetland crop management — flood-resilient, disaster-adaptive farming for the seasonally inundated haor ecosystem.",
    },
    {
      from: "2017",
      to: "2018",
      role: "Agricultural Extension Officer",
      place: "Natore Sadar, Natore",
      placeBn: "নাটোর সদর, নাটোর",
      note: "Commencement of civil service (31st BCS Agriculture Cadre). Field-level extension work for smallholder farmers.",
    },
  ],

  preService: [
    {
      from: "2010",
      to: "2011",
      role: "CEO & Founder",
      place: "Nagar Krishak Limited, Dhaka",
      placeBn: "নগর কৃষক লিমিটেড, ঢাকা",
      note: "Pioneered urban rooftop farming solutions in Mirpur-Gabtoli and expanded across Dhaka.",
    },
    {
      from: "—",
      to: "—",
      role: "Area Sales Manager",
      place: "Transcom Mobile Ltd. (Samsung)",
      placeBn: "ট্রান্সকম মোবাইল লিমিটেড (স্যামসাং)",
      note: "Regional sales force management and market expansion.",
    },
    {
      from: "—",
      to: "—",
      role: "Regional Sales Manager",
      place: "SB Tel Ltd. (Symphony)",
      placeBn: "এসবি টেল লিমিটেড (সিম্ফনি)",
      note: "Multi-district sales operations and distribution across assigned territories.",
    },
    {
      from: "—",
      to: "—",
      role: "Executive Officer",
      place: "Giant Agro Processing Ltd. (Bangla Seed)",
      placeBn: "জায়ান্ট অ্যাগ্রো প্রসেসিং লিমিটেড (বাংলা সীড)",
      note: "Seed systems, agro-processing, and rural supply chain operations.",
    },
  ],

  digitalInnovations: [
    {
      title: "CABI Diagnosis Web App",
      titleBn: "উদ্ভিদ গোয়েন্দা (Plant Detective)",
      period: "2025–Present",
      description:
        "React/Vite app integrating Claude AI with CABI Plantwise Ready Reckoner. Bilingual Bengali/English, voice I/O, TTS, 94+ DAE pesticides, weather via Open-Meteo, Plantix-inspired UI.",
      repo: "https://github.com/moniruzjaman/cabi-diagnosis",
    },
    {
      title: "Krishi AI Mobile App",
      titleBn: "কৃষি AI মোবাইল অ্যাপ",
      period: "Present",
      description:
        "React Native app with Cloudflare Worker backend, MobileNetV2 TFLite disease detection, 17 tool screens, Bengali errors, secure EAS build.",
    },
    {
      title: "Krishak Card (কৃষককার্ড)",
      titleBn: "কৃষককার্ড",
      period: "Present",
      description:
        "Digital farmer services portal with live DAE market prices, 11 services, Noto Serif Bengali, Bangladesh emblem.",
      repo: "https://github.com/moniruzjaman/krishak-card",
    },
    {
      title: "IPM/FFS Educational Game",
      titleBn: "স্বশিক্ষা কৃষি প্রকল্প",
      period: "Present",
      description:
        "HTML5 Bengali IPM decision game across rice scenarios with AI-generated SVG illustrations via Anthropic API.",
    },
    {
      title: "AgriWisdom YouTube Channel",
      titleBn: "এগ্রিওয়াইজডম ইউটিউব চ্যানেল",
      period: "Present",
      description:
        "Bilingual agri-extension videos semi-automated via Google Sheets + Apps Script, Claude API for metadata, YouTube Data API.",
      repo: "https://www.youtube.com/@AgriWisdomBd",
    },
  ],

  competencies: [
    {
      group: "Agricultural Science",
      groupBn: "কৃষি বিজ্ঞান",
      items: [
        "CABI Plantwise Diagnostics",
        "IPM / Integrated Crop Management",
        "Horticulture Management",
        "Haor, Hill Tract & Plains Agronomy",
        "Farmer Field Schools (FFS)",
        "DAE Extension Programme Management",
      ],
    },
    {
      group: "Software Development",
      groupBn: "সফটওয়্যার উন্নয়ন",
      items: [
        "React / React Native / Vite",
        "Vercel Serverless Functions",
        "Cloudflare Workers",
        "Google Apps Script",
        "AppSheet Development",
      ],
    },
    {
      group: "AI & Data",
      groupBn: "এআই ও তথ্য",
      items: [
        "Claude AI API Integration",
        "Multimodal LLM orchestration",
        "Bengali NLP / TTS / ASR (Web Speech API)",
        "On-device ML (MobileNetV2 TFLite)",
        "Retrieval over field datasets",
      ],
    },
    {
      group: "Emerging Tech",
      groupBn: "উদীয়মান প্রযুক্তি",
      items: [
        "Blockchain (Hyperledger Fabric)",
        "Smart AgriTech / Digital Extension",
        "Data Automation & Dashboards (Chart.js)",
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
