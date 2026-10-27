import { author } from "@/lib/author";
import { GithubMark, LinkedinMark, FacebookMark, YoutubeMark } from "@/components/icons";

/**
 * Single source for every outbound profile link on the site.
 * URLs live in `author` (src/lib/author.ts); handles are derived from them so
 * the displayed text can never drift from where a link actually goes.
 */
const handleOf = (url: string): string =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** The three professional profiles surfaced across hero / Connect / footer. */
export const socials = [
  { key: "github", label: "GitHub", href: author.github, handle: handleOf(author.github), Icon: GithubMark },
  { key: "linkedin", label: "LinkedIn", href: author.linkedin, handle: handleOf(author.linkedin), Icon: LinkedinMark },
  { key: "youtube", label: "YouTube", href: author.youtube, handle: handleOf(author.youtube), Icon: YoutubeMark },
  { key: "facebook", label: "Facebook", href: author.facebook, handle: handleOf(author.facebook), Icon: FacebookMark },
] as const;

/** The three requested social profiles (no GitHub) — used by "Connect & Follow". */
export const connectProfiles = [
  {
    key: "facebook",
    label: "Facebook",
    href: author.facebook,
    handle: handleOf(author.facebook),
    Icon: FacebookMark,
    accent: "text-[#1877F2]",
    en: "Announcements, photo essays from the field, and community updates.",
    bn: "ঘোষণা, মাঠের ছবি ও কমিউনিটি আপডেট।",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: author.linkedin,
    handle: handleOf(author.linkedin),
    Icon: LinkedinMark,
    accent: "text-[#0A66C2]",
    en: "Professional background — agricultural extension leadership and digital initiatives.",
    bn: "পেশাদার পরিচিতি — কৃষি সম্প্রসারণ নেতৃত্ব ও ডিজিটাল উদ্যোগ।",
  },
  {
    key: "youtube",
    label: "YouTube",
    href: author.youtube,
    handle: handleOf(author.youtube),
    Icon: YoutubeMark,
    accent: "text-[#FF0000]",
    en: "AgriWisdomBd — an agricultural knowledge channel with practical guidance for farmers and field officers.",
    bn: "AgriWisdomBd — কৃষক ও মাঠ কর্মকর্তাদের জন্য ব্যবহারিক কৃষি জ্ঞানের ইউটিউব চ্যানেল।",
  },
] as const;
