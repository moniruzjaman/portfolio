/**
 * lucide-react 1.x removed brand marks (GitHub, X, etc.) for trademark reasons,
 * so the GitHub glyph is drawn here rather than substituted with a generic
 * icon that would misrepresent the destination.
 */
export function GithubMark({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22 0 1.6-.02 2.9-.02 3.29 0 .32.21.7.83.58C20.57 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

type IconProps = { size?: number; className?: string };
const Mark = ({ size = 16, className = "", d, evenodd }: IconProps & { d: string; evenodd?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
    <path d={d} fillRule={evenodd ? "evenodd" : undefined} />
  </svg>
);

export const LinkedinMark = (p: IconProps) => (
  <Mark {...p} d="M4.5 9h3v11h-3zM6 4a1.75 1.75 0 1 1 0 3.5A1.75 1.75 0 0 1 6 4Zm4 5h2.9v1.5c.5-.9 1.7-1.7 3.4-1.7 3.2 0 3.7 2.1 3.7 4.8V20h-3v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20h-3Z" />
);
export const FacebookMark = (p: IconProps) => (
  <Mark {...p} d="M14 8.5V6.9c0-.7.2-1.1 1.2-1.1h1.3V3.1C16.2 3.1 15.4 3 14.5 3 12.4 3 11 4.3 11 6.6v1.9H8.5v2.9H11V21h3v-9.6h2.3l.4-2.9H14Z" />
);
export const YoutubeMark = (p: IconProps) => (
  <Mark {...p} evenodd d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z" />
);
