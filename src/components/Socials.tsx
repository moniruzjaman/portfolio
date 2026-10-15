import { author } from "@/lib/author";
import { GithubMark, LinkedinMark, FacebookMark, YoutubeMark } from "@/components/icons";

/** Single source for every outbound profile link on the site. */
export const socials = [
  { key: "github", label: "GitHub", href: author.github, handle: `github.com/${author.githubHandle}`, Icon: GithubMark },
  { key: "linkedin", label: "LinkedIn", href: author.linkedin, handle: "linkedin.com/in/abu-md-moniruzjaman", Icon: LinkedinMark },
  { key: "youtube", label: "YouTube", href: author.youtube, handle: "youtube.com/@agriwisdombd", Icon: YoutubeMark },
  { key: "facebook", label: "Facebook", href: author.facebook, handle: "facebook.com/moniruzjaman2021", Icon: FacebookMark },
] as const;
